from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from .models import Attendance, AttendanceSession, UserRole
from attendance.models import AttendanceAttemptLog
from .serializers import AttendanceSerializer
from .geolocation_utils import verify_location, calculate_distance

# Anti-spoofing thresholds (must match frontend constants)
_MAX_ACCURACY_METERS = 100.0
_MAX_JUMP_METERS = 100.0
_MAX_DRIFT_METERS = 40.0
_MAX_SPEED_MPS = 10.0  # ~9 km/h


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
    Standardized attendance check-in logic with passive pre-validated sample verification.
    """
    samples = request.data.get('samples', [])
    if not samples:
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        acc = request.data.get('accuracy', 100)
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
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Only students can check in',
            'reason': 'Only students can check in'
        }, status=status.HTTP_403_FORBIDDEN)

    if not session.is_active:
        return Response({
            'success': False,
            'status': 'error',
            'error': 'Session is not active',
            'reason': 'Session is not active'
        }, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    location_data = session.get_location_coords()

    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT')

    all_verified = True
    rejected_reason = None
    drift_avg = 0.0
    last_sample = samples[-1]

    # Check for minimum number of samples for modern clients
    # (Allow 1 sample for backward compatibility, but log it)
    if len(samples) < 3 and ' samples' not in user_agent: # Simple check
        pass

    for sample in samples:
        lat = float(sample.get('latitude', 0))
        lng = float(sample.get('longitude', 0))
        acc = float(sample.get('accuracy', 0))

        if acc > _MAX_ACCURACY_METERS:
            all_verified = False
            rejected_reason = f"Accuracy too low ({acc}m). Min required: 100m."
            break

        is_inside, dist = verify_location(
            lat, lng, None,
            location_data['latitude'],
            location_data['longitude'],
            None,
            location_data['boundary'],
            location_data['radius']
        )

        if not is_inside:
            all_verified = False
            if location_data['boundary']:
                rejected_reason = f"Outside lecture hall boundary ({dist:.1f}m away)"
            else:
                rejected_reason = f"Too far from venue ({dist:.1f}m). Limit: {location_data['radius']}m."
            break

    if all_verified:
        is_stable, stability_reason, drift_avg = _validate_sample_stability(samples)
        if not is_stable:
            all_verified = False
            rejected_reason = stability_reason

    with transaction.atomic():
        AttendanceAttemptLog.objects.create(
            student=request.user,
            session=session,
            latitude=last_sample.get('latitude'),
            longitude=last_sample.get('longitude'),
            accuracy=last_sample.get('accuracy'),
            drift_avg=round(drift_avg, 2),
            inside_polygon=all_verified,
            rejected_reason=rejected_reason,
            ip_address=ip_address,
            user_agent=user_agent
        )

        if not all_verified:
            return Response({
                'success': False,
                'status': 'error',
                'error': rejected_reason,
                'reason': rejected_reason
            }, status=status.HTTP_400_BAD_REQUEST)

        if Attendance.objects.select_for_update().filter(session=session, student=request.user).exists():
            return Response({
                'success': False,
                'status': 'error',
                'error': 'Attendance already marked',
                'reason': 'Attendance already marked'
            }, status=status.HTTP_400_BAD_REQUEST)

        grace_period = timezone.timedelta(minutes=15)
        status_value = 'PRESENT'
        if now > session.start_time + grace_period:
            status_value = 'LATE'

        attendance = Attendance.objects.create(
            session=session,
            student=request.user,
            latitude=last_sample.get('latitude'),
            longitude=last_sample.get('longitude'),
            accuracy=last_sample.get('accuracy'),
            location_verified=True,
            status=status_value,
            distance_from_venue=dist # From last verify_location call
        )

        return Response({
            'success': True,
            'status': 'success',
            'message': 'Attendance marked successfully',
            'attendance': AttendanceSerializer(attendance).data
        }, status=status.HTTP_201_CREATED)
