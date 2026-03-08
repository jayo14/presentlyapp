from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from institutions.models import Attendance, AttendanceSession, UserRole
from attendance.models import AttendanceAttemptLog
from accounts.models import UserDevice
from .serializers import AttendanceSerializer
from .geolocation_utils import verify_location, calculate_distance

# Anti-spoofing thresholds (must match frontend constants)
_MAX_ACCURACY_METERS = 40.0
_MAX_JUMP_METERS = 100.0
_MAX_DRIFT_METERS = 40.0
_MAX_SPEED_MPS = 10.0  # ~36 km/h
_TRUST_THRESHOLD = 85
_FLAG_THRESHOLD = 50


def _validate_sample_stability(samples):
    """
    Validate that the sample window is stable (no spoofing indicators).
    Returns (is_stable: bool, rejected_reason: str | None, drift_avg: float).
    """
    if len(samples) < 2:
        return True, None, 0.0

    first = samples[0]
    prev = None
    drift_values = []

    for sample in samples:
        lat = float(sample.get('latitude', 0))
        lng = float(sample.get('longitude', 0))

        # Check for mock location flag if provided by modern device APIs
        if sample.get('is_mock') is True or sample.get('isMock') is True:
            return False, "Mock location detected", 0.0

        if prev is not None:
            prev_lat = float(prev.get('latitude', 0))
            prev_lng = float(prev.get('longitude', 0))
            jump = calculate_distance(prev_lat, prev_lng, lat, lng)

            # Detect teleport jump
            if jump > _MAX_JUMP_METERS:
                return False, f"Suspicious location jump detected ({jump:.1f}m)", sum(drift_values) / len(drift_values) if drift_values else 0.0

            # Detect unrealistic speed
            prev_ts = prev.get('timestamp')
            cur_ts = sample.get('timestamp')
            if prev_ts is not None and cur_ts is not None:
                # Convert both to float (some might be strings or large ints)
                time_diff = (float(cur_ts) - float(prev_ts)) / 1000.0
                if time_diff > 0:
                    speed = jump / time_diff
                    if speed > _MAX_SPEED_MPS:
                        return False, f"Unrealistic movement speed ({speed:.1f} m/s)", sum(drift_values) / len(drift_values) if drift_values else 0.0

        # Drift from the start
        drift = calculate_distance(
            float(first.get('latitude', 0)), float(first.get('longitude', 0)),
            lat, lng
        )
        drift_values.append(drift)

        if drift > _MAX_DRIFT_METERS:
            return False, f"Excessive movement drift ({drift:.1f}m)", sum(drift_values) / len(drift_values) if drift_values else 0.0

        prev = sample

    drift_avg = sum(drift_values) / len(drift_values) if drift_values else 0.0
    return True, None, drift_avg


def perform_attendance_check_in(request, session):
    """
    Standardized attendance check-in logic with weighted confidence score system.
    """
    data = request.data
    samples = data.get('samples', [])
    visitor_id = data.get('visitorId') or data.get('visitor_id')
    device_id = data.get('deviceId') or data.get('device_id')
    webgl_renderer = data.get('webglRenderer')
    is_mock_from_client = data.get('isMock') or data.get('is_mock') or False
    motion_detected = data.get('motionDetected') or data.get('motion_detected') or False
    ip_city = data.get('ipCity') or data.get('ip_city')

    if not samples:
        lat = data.get('latitude')
        lng = data.get('longitude')
        acc = data.get('accuracy', 100)
        if lat and lng:
            samples = [{'latitude': lat, 'longitude': lng, 'accuracy': acc}]

    if not samples:
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Location data is required',
            'reason': 'Location data is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if request.user.role != UserRole.STUDENT:
        return Response({'success': False, 'status': 'error', 'error': 'Only students can check in'}, status=status.HTTP_403_FORBIDDEN)

    if not session.is_active:
        return Response({'success': False, 'status': 'error', 'error': 'Session is not active'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    location_data = session.get_location_coords()
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    # --- Confidence Score System ---
    score: int = 0
    flags: list[str] = []
    
    # 1. GPS Accuracy Signal (20 points)
    last_sample = samples[-1]
    avg_acc = float(sum(float(s.get('accuracy', 999)) for s in samples) / len(samples))
    if avg_acc <= 10: score += 20
    elif avg_acc <= 20: score += 15
    elif avg_acc <= 40: score += 10
    else: flags.append(f"Low accuracy ({avg_acc:.1f}m)")

    # 2. Geofence Signal (30 points)
    is_inside_any = False
    min_dist = 999999
    for sample in samples:
        is_inside, dist = verify_location(
            float(sample.get('latitude')), float(sample.get('longitude')), None,
            location_data['latitude'], location_data['longitude'], None,
            location_data['boundary'], location_data['radius']
        )
        if is_inside: is_inside_any = True
        min_dist = min(min_dist, dist)
    
    if is_inside_any: score += 30
    else: flags.append(f"Outside area ({min_dist:.1f}m away)")

    # 3. Device/Integrity Signal (10 points)
    if visitor_id:
        device_exists = UserDevice.objects.filter(user=request.user, visitor_id=visitor_id).exists()
        if device_exists:
            score += 10
        else:
            # First time using this device
            score += 5
            flags.append("New device fingerprint")
    else:
        flags.append("Missing device fingerprint")

    # 4. Movement/Stability Signal (20 points)
    is_stable, stability_reason, drift_avg = _validate_sample_stability(samples)
    # Give points if motion sensor detected physical movement during sampling
    if motion_detected:
        score += 10
    else:
        flags.append("No physical movement detected (static device)")

    if is_stable and len(samples) >= 3:
        # Check if movement is too "perfect" (zero drift is suspicious for real GPS)
        if drift_avg > 0.01: 
            score += 10
        else:
            flags.append("Static GPS signal (suspicious)")
    elif not is_stable:
        score -= 20 # Penalty for jumps/speed
        flags.append(stability_reason)

    # 5. Network/Environment (20 points)
    # A. IP Sanity Check (+10) - placeholder for actual city comparison if we had student's home city
    # For now, we trust it if it's provided.
    if ip_city:
        score += 10
    else:
        flags.append("Could not verify IP city")

    # B. Network Continuity (+10)
    last_success = AttendanceAttemptLog.objects.filter(student=request.user, rejected_reason__isnull=True).first()
    if last_success and last_success.ip_address == ip_address:
        score += 10
    else:
        score += 5 # New IP

    # Hard Rejections (Overrides)
    is_mocked = is_mock_from_client or stability_reason == "Mock location detected"
    if is_mocked:
        score = 0
        flags.append("Mock location provider active")
    
    if webgl_renderer and ("SwiftShader" in webgl_renderer or "llvmpipe" in webgl_renderer):
        score -= 50
        flags.append("Emulator detected (hardware renderer)")

    # Rejection logic: Hard reject only if very low confidence
    if score < _FLAG_THRESHOLD:
        rejected_reason = "; ".join(flags) or "Low confidence score"
        with transaction.atomic():
            AttendanceAttemptLog.objects.create(
                student=request.user,
                session=session,
                latitude=last_sample.get('latitude'),
                longitude=last_sample.get('longitude'),
                accuracy=last_sample.get('accuracy'),
                drift_avg=round(float(drift_avg), 2),
                inside_polygon=is_inside_any,
                is_mocked=is_mocked,
                motion_detected=motion_detected,
                ip_city=ip_city,
                visitor_id=visitor_id,
                device_id=device_id,
                webgl_renderer=webgl_renderer,
                trust_score=score,
                rejected_reason=rejected_reason,
                ip_address=ip_address,
                user_agent=user_agent
            )

        return Response({
            'success': False,
            'status': 'error',
            'error': f"Attendance rejected (Confidence: {score}%). {rejected_reason}",
            'reason': rejected_reason,
            'score': score
        }, status=status.HTTP_400_BAD_REQUEST)

    # Success/Flag logic: Allow but mark status
    with transaction.atomic():
        AttendanceAttemptLog.objects.create(
            student=request.user,
            session=session,
            latitude=last_sample.get('latitude'),
            longitude=last_sample.get('longitude'),
            accuracy=last_sample.get('accuracy'),
            drift_avg=round(float(drift_avg), 2),
            inside_polygon=is_inside_any,
            is_mocked=is_mocked,
            motion_detected=motion_detected,
            ip_city=ip_city,
            visitor_id=visitor_id,
            device_id=device_id,
            webgl_renderer=webgl_renderer,
            trust_score=score,
            rejected_reason=None if score >= _TRUST_THRESHOLD else "; ".join(flags),
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Register device if first time or trusted enough
        if visitor_id:
            UserDevice.objects.update_or_create(
                user=request.user,
                visitor_id=visitor_id,
                defaults={
                    'device_name': user_agent[:250],
                    'user_agent': user_agent,
                    'ip_address': ip_address or '0.0.0.0',
                    'is_trusted': True if score >= 90 else False
                }
            )

        if Attendance.objects.select_for_update().filter(session=session, student=request.user).exists():
            return Response({'success': False, 'status': 'error', 'error': 'Attendance already marked'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine Status: LATE, FLAGGED, or PRESENT
        grace_period = timezone.timedelta(minutes=15)
        status_value = 'PRESENT'
        
        if score < _TRUST_THRESHOLD:
            status_value = 'FLAGGED'
        elif now > session.start_time + grace_period:
            status_value = 'LATE'

        attendance = Attendance.objects.create(
            session=session,
            student=request.user,
            latitude=last_sample.get('latitude'),
            longitude=last_sample.get('longitude'),
            accuracy=last_sample.get('accuracy'),
            location_verified=True,
            status=status_value,
            distance_from_venue=min_dist,
            trust_score=score,
            verification_metadata={'flags': flags, 'is_mocked': is_mocked}
        )

        return Response({
            'success': True,
            'status': 'success',
            'message': 'Attendance marked successfully',
            'score': score,
            'attendance': AttendanceSerializer(attendance).data
        }, status=status.HTTP_201_CREATED)
