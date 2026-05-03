from django.utils import timezone
from django.db import transaction
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from institutions.models import Attendance, AttendanceSession, UserRole, CourseEnrollment, ManualAttendanceRecord
from attendance.models import AttendanceAttemptLog
from accounts.models import UserDevice
from .serializers import AttendanceSerializer
from .geolocation_utils import verify_location, calculate_distance
from utils.email import send_attendance_confirmed_email
from system.feature_flags import get_feature_flag
import logging

logger = logging.getLogger(__name__)

# Anti-spoofing thresholds (must match frontend constants)
_MAX_ACCURACY_METERS = 40.0
_MAX_JUMP_METERS = 100.0
_MAX_DRIFT_METERS = 40.0
_MAX_SPEED_MPS = 10.0  # ~36 km/h
_TRUST_THRESHOLD = 85
_FLAG_THRESHOLD = 50


def check_session_validity(session):
    """
    Checks if a session is valid based on student participation.
    Rule: A session is marked invalid if less than 10% of enrolled students attended.
    """
    total_enrolled = session.course.enrolled_students_count  # Assuming helper property/count exists or used via query
    from .models import CourseEnrollment
    total_enrolled = CourseEnrollment.objects.filter(course=session.course, is_active=True).count()
    
    total_marked = session.attendances.count()
    
    if total_enrolled > 0:
        participation_rate = total_marked / total_enrolled
        if participation_rate < 0.10:  # Less than 10%
            session.is_valid = False
            session.invalidation_reason = f"Low attendance: Only {total_marked}/{total_enrolled} students ({participation_rate*100:.1f}%) attended."
            session.save()
            return False
    
    session.is_valid = True
    session.invalidation_reason = None
    session.save()
    return True


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


def perform_attendance_check_in(request, session, method='In-App'):
    """
    Standardized attendance check-in logic with weighted confidence score system.
    """
    # ========== PHASE 1: DEBUG LOGGING ==========
    logger.info("attendance_checkin.start user=%s role=%s session=%s code=%s method=%s",
                getattr(request.user, 'id', None), getattr(request.user, 'role', None),
                session.id, session.session_code, method)
    
    # Check enrollment status
    is_enrolled = False
    if request.user.is_authenticated:
        is_enrolled = CourseEnrollment.objects.filter(
            student=request.user,
            course=session.course,
            is_active=True,
        ).exists()
    logger.info("attendance_checkin.precheck user=%s enrolled=%s", getattr(request.user, 'id', None), is_enrolled)
    # ========== END DEBUG LOGGING ==========
    
    # ========== PHASE 1: SESSION & PERMISSION CHECKS ==========
    now = timezone.now()
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
        if lat is not None and lng is not None:
            samples = [{'latitude': lat, 'longitude': lng, 'accuracy': acc}]

    if not samples:
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Location data is required',
            'reason': 'Location data is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    is_superuser = getattr(request.user, 'is_superuser', False)

    # 1. Role Check
    user_role = getattr(request.user, 'role', None)
    if not is_superuser and user_role not in (UserRole.STUDENT, UserRole.CLASS_REP):
        logger.error(f"BLOCKING: User {request.user.email} (role: {user_role}) is not a student")
        return Response({
            'success': False, 
            'status': 'error', 
            'error': 'Only students can mark attendance'
        }, status=status.HTTP_403_FORBIDDEN)

    # 2. Enrollment Check
    if not is_superuser:
        enrollment = CourseEnrollment.objects.filter(
            student=request.user,
            course=session.course,
            is_active=True,
        ).first()
        
        if not enrollment:
            logger.error(f"BLOCKING: Student {request.user.email} is not enrolled in {session.course.code}")
            return Response({
                'success': False, 
                'status': 'error', 
                'error': f'You are not enrolled in {session.course.code}. Please register for the course first.'
            }, status=status.HTTP_403_FORBIDDEN)

    # 3. Session Status & Time Window check
    if not session.is_active:
        return Response({
            'success': False, 
            'status': 'error', 
            'error': 'This attendance session has been closed'
        }, status=status.HTTP_400_BAD_REQUEST)

    if now < session.start_time:
        return Response({
            'success': False,
            'status': 'error',
            'error': f'Attendance window hasn\'t opened yet. Starts at {session.start_time.strftime("%I:%M %p")}'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    if session.end_time and now > session.end_time: # Use end_time consistently
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Attendance window has closed for this session.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if session.expires_at and now > session.expires_at:
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Attendance window has closed for this session.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check expiry_time alias if it exists
    if hasattr(session, 'expiry_time') and session.expiry_time and now > session.expiry_time:
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Attendance window has closed for this session.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Prevent duplicates if manual attendance already exists for this user/session.
    matric = str(getattr(request.user, 'matric_number', '') or '').strip().upper()
    if matric and ManualAttendanceRecord.objects.filter(session=session, matric_number=matric).exists():
        logger.info("attendance_checkin.duplicate_manual user=%s session=%s matric=%s", request.user.id, session.id, matric)
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Attendance already recorded manually for this session.'
        }, status=status.HTTP_409_CONFLICT)

    # ========== PHASE 2: LOCATION & SCORING ==========
    location_data = session.get_location_coords()
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    # Determine whether the session has valid venue coordinates
    _lat = location_data.get('latitude')
    _lng = location_data.get('longitude')
    venue_coords_valid = (
        _lat is not None
        and _lng is not None
        and not (float(_lat) == 0.0 and float(_lng) == 0.0)
    )

    is_desktop = data.get('isDesktop') or data.get('is_desktop') or False

    # --- Confidence Score System ---
    score: int = 0
    flags: list[str] = []
    
    # 1. GPS Accuracy Signal (20 points)
    last_sample = samples[-1]
    avg_acc = float(sum(float(s.get('accuracy', 999)) for s in samples) / len(samples))
    if avg_acc <= 10: score += 20
    elif avg_acc <= 20: score += 15
    elif avg_acc <= 40: score += 10
    elif avg_acc <= 100 and is_desktop: score += 5  # Wi-Fi triangulation on desktop
    else: flags.append(f"Low accuracy ({avg_acc:.1f}m)")

    # 2. Geofence Signal (30 points)
    is_inside_any = False
    min_dist = 999999
    is_strict = getattr(session, 'strict_mode', False) or method == 'Magic Link'

    if not venue_coords_valid:
        if is_strict:
            # STRICT REQUIREMENT: If we cannot verify location because session has no venue coords, 
            # and the method is strict (Magic Link or Strict Mode), we do not award points.
            flags.append("Venue coordinates missing — proximity unverified (Strict)")
        else:
            # Non-strict mode: Award partial points if venue is misconfigured
            score += 15
            flags.append("Venue coordinates not configured — geofence skipped")
    else:
        for sample in samples:
            is_inside, dist = verify_location(
                float(sample.get('latitude')), float(sample.get('longitude')), None,
                location_data['latitude'], location_data['longitude'], None,
                location_data['boundary'], location_data['radius']
            )
            if is_inside: is_inside_any = True
            min_dist = min(min_dist, dist)

        if is_inside_any: 
            score += 30
        else:
            # STRICT GPS VALIDATION
            if is_strict:
                rejected_reason = f"Location verification failed: You are {min_dist:.1f}m away from the venue."
                return Response({
                    'success': False,
                    'status': 'error',
                    'error': rejected_reason,
                    'reason': 'outside_geofence',
                    'distance': min_dist
                }, status=status.HTTP_400_BAD_REQUEST)
            
            flags.append(f"Outside area ({min_dist:.1f}m away)")

    # 3. Device/Integrity Signal (10 points)
    if visitor_id:
        device_exists = UserDevice.objects.filter(user=request.user, device_fingerprint=visitor_id).exists()
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
    elif is_desktop:
        # Desktop users cannot provide motion sensor data — partial credit, no penalty
        score += 5
        flags.append("Desktop device — motion sensor unavailable")
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
    # Desktop users get lower thresholds since they cannot provide motion/GPS signals
    effective_flag_threshold = 35 if is_desktop else _FLAG_THRESHOLD
    effective_trust_threshold = 65 if is_desktop else _TRUST_THRESHOLD

    # Reliability guardrail: if core checks pass (inside geofence + no spoof signal),
    # do not hard-reject purely because auxiliary telemetry is weak.
    if is_inside_any and not is_mocked and score < effective_flag_threshold:
        flags.append("Low telemetry quality; accepted with reduced trust")
        score = effective_flag_threshold

    if score < effective_flag_threshold:
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
            rejected_reason=None if score >= effective_trust_threshold else "; ".join(flags),
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Register device if first time or trusted enough
        if visitor_id:
            UserDevice.objects.update_or_create(
                user=request.user,
                device_fingerprint=visitor_id,
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
        
        if score < effective_trust_threshold:
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
            verification_metadata={'flags': flags, 'is_mocked': is_mocked, 'method': method}
        )

        # Send email confirmation
        if get_feature_flag("email_attendance_confirmed", default=False):
            try:
                send_attendance_confirmed_email(
                    to=request.user.email,
                    first_name=request.user.full_name.split(' ')[0],
                    course_code=session.course.code,
                    course_name=session.course.title,
                    arrival_time=attendance.checked_in_at.strftime('%I:%M %p, %b %d %Y'),
                    check_in_method=method,
                    location_label=session.venue.name if session.venue else 'Campus Venue',
                    streak_label='Attendance consistency',
                    streak_message='Keep it up. Your attendance record is improving.',
                    streak_percent=85,
                    history_url=f"{settings.FRONTEND_URL}/attendance/history",
                    report_url=f"{settings.FRONTEND_URL}/attendance/report",
                )
            except Exception as e:
                # Don't fail the check-in if email fails
                import logging
                logging.getLogger(__name__).error(f"Failed to send attendance marked email: {e}")

        return Response({
            'success': True,
            'status': 'success',
            'message': 'Attendance marked successfully',
            'score': score,
            'attendance': AttendanceSerializer(attendance).data
        }, status=status.HTTP_201_CREATED)
