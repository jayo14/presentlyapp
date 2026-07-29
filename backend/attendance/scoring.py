import math
from attendance.models import AttendanceSubmission


def _server_recompute_score(session, payload: dict) -> tuple:
    """
    Re-compute a confidence score from the server's perspective.
    Returns (server_score: int, fail_reasons: list[str]).
    """
    score = 100
    fail_reasons = []

    coords = payload.get('coordinates', {})
    student_lat = coords.get('lat')
    student_lng = coords.get('lng')

    lecturer_coords = getattr(session, 'lecturer_coordinates', None) or {}
    if not lecturer_coords and getattr(session, 'latitude', None) and getattr(session, 'longitude', None):
        lecturer_coords = {
            'lat': float(session.latitude),
            'lng': float(session.longitude),
        }

    if lecturer_coords and student_lat is not None and student_lng is not None:
        R = 6_371_000
        phi1, phi2 = math.radians(float(lecturer_coords.get('lat', 0))), math.radians(float(student_lat))
        dphi = math.radians(float(student_lat) - float(lecturer_coords.get('lat', 0)))
        dlambda = math.radians(float(student_lng) - float(lecturer_coords.get('lng', 0)))
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        distance = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        radius = getattr(session, 'allowed_radius_meters', None) or 50
        if distance > radius:
            deduction = min(40, int(40 * (distance - radius) / max(radius, 1)))
            score -= deduction
            fail_reasons.append(
                f"Outside geofence: {distance:.1f}m from lecturer (limit {radius}m)"
            )

    min_samples = getattr(session, 'min_samples', None) or 3
    sample_count = payload.get('sample_count', 0)
    if sample_count < min_samples:
        score -= 20
        fail_reasons.append(
            f"Insufficient GPS samples: {sample_count} (minimum {min_samples})"
        )

    if payload.get('mock_gps_flag'):
        score -= 15
        fail_reasons.append("Mock GPS provider detected")

    if payload.get('suspiciously_still'):
        score -= 10
        fail_reasons.append("Device appears suspiciously still")

    bflags = payload.get('behavioral_flags', {})
    if bflags.get('appBackgrounded'):
        score -= 5
        fail_reasons.append("App was backgrounded during collection")
    if bflags.get('tapPatternSuspicious'):
        score -= 5
        fail_reasons.append("Suspicious tap pattern detected")
    if bflags.get('locationExitCount', 0) > 2:
        score -= 5
        fail_reasons.append(
            f"Location exit count too high: {bflags['locationExitCount']}"
        )

    return max(0, score), fail_reasons


def _determine_verdict(server_score, client_score, session, fail_reasons, payload):
    """
    Determine the final verdict.
    """
    all_fail_reasons = list(fail_reasons)

    if payload.get('mock_gps_flag'):
        return AttendanceSubmission.VERDICT_REJECTED, all_fail_reasons

    if server_score < 40:
        return AttendanceSubmission.VERDICT_REJECTED, all_fail_reasons

    score_delta = abs(client_score - server_score)
    if score_delta > 20:
        all_fail_reasons.append(
            f"Client score ({client_score}) diverges from server score ({server_score}) by {score_delta} points"
        )
        return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons

    if getattr(session, 'strict_mode', False) and all_fail_reasons:
        return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons

    if server_score >= 70:
        return AttendanceSubmission.VERDICT_ACCEPTED, all_fail_reasons

    return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons
