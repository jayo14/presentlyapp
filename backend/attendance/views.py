import math
import logging

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from institutions.models import AttendanceSession, CourseEnrollment
from .models import AttendanceSubmission, AttendanceRecord
from .serializers import (
    AttendanceSubmissionCreateSerializer,
    AttendanceSubmissionDetailSerializer,
    AttendanceRecordSerializer,
    LecturerOverrideSerializer,
    SessionConfigSerializer,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Permission helpers
# ---------------------------------------------------------------------------

class IsLecturer(BasePermission):
    """Allows access only to users with the LECTURER (or ADMIN) role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('LECTURER', 'ADMIN')
        )


# ---------------------------------------------------------------------------
# Utility: Haversine distance (metres)
# ---------------------------------------------------------------------------

def _haversine_metres(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance in metres between two GPS coordinates."""
    R = 6_371_000  # Earth's radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Server-side confidence re-computation
# ---------------------------------------------------------------------------

def _server_recompute_score(session: AttendanceSession, payload: dict) -> tuple:
    """
    Re-compute a confidence score from the server's perspective.
    Returns (server_score: int, fail_reasons: list[str]).

    Scoring breakdown (100 points total):
      - Proximity check:     40 pts
      - Sample count:        20 pts
      - Mock GPS flag:       15 pts  (penalty)
      - Suspiciously still:  10 pts  (penalty)
      - Behavioral flags:    15 pts  (penalty)
    """
    score = 100
    fail_reasons = []

    coords = payload.get('coordinates', {})
    student_lat = coords.get('lat')
    student_lng = coords.get('lng')

    # 1. Proximity
    lecturer_coords = session.lecturer_coordinates or {}
    if not lecturer_coords and session.latitude and session.longitude:
        lecturer_coords = {'lat': float(session.latitude), 'lng': float(session.longitude)}

    if lecturer_coords and student_lat is not None and student_lng is not None:
        distance = _haversine_metres(
            float(lecturer_coords.get('lat', 0)),
            float(lecturer_coords.get('lng', 0)),
            float(student_lat),
            float(student_lng),
        )
        radius = session.allowed_radius_meters or 50
        if distance > radius:
            deduction = min(40, int(40 * (distance - radius) / max(radius, 1)))
            score -= deduction
            fail_reasons.append(
                "Outside geofence: {:.1f}m from lecturer (limit {}m)".format(distance, radius)
            )

    # 2. Sample count
    min_samples = session.min_samples or 3
    sample_count = payload.get('sample_count', 0)
    if sample_count < min_samples:
        score -= 20
        fail_reasons.append(
            "Insufficient GPS samples: {} (minimum {})".format(sample_count, min_samples)
        )

    # 3. Mock GPS
    if payload.get('mock_gps_flag'):
        score -= 15
        fail_reasons.append("Mock GPS provider detected")

    # 4. Suspiciously still
    if payload.get('suspiciously_still'):
        score -= 10
        fail_reasons.append("Device appears suspiciously still")

    # 5. Behavioral flags
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
            "Location exit count too high: {}".format(bflags['locationExitCount'])
        )

    return max(0, score), fail_reasons


def _determine_verdict(server_score, client_score, session, fail_reasons, payload):
    """
    Determine the final verdict.

    Rules:
      - REJECTED if server_score < 40
      - REJECTED if mock_gps_flag is True
      - FLAGGED if strict_mode and any fail_reason
      - FLAGGED if |server_score - client_score| > 20
      - ACCEPTED if server_score >= 70 and no critical failures
      - FLAGGED if server_score in [40, 70)
    """
    all_fail_reasons = list(fail_reasons)

    if payload.get('mock_gps_flag'):
        return AttendanceSubmission.VERDICT_REJECTED, all_fail_reasons

    if server_score < 40:
        return AttendanceSubmission.VERDICT_REJECTED, all_fail_reasons

    # Flag if client lied significantly
    score_delta = abs(client_score - server_score)
    if score_delta > 20:
        all_fail_reasons.append(
            "Client score ({}) diverges from server score ({}) by {} points".format(
                client_score, server_score, score_delta
            )
        )
        return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons

    if session.strict_mode and all_fail_reasons:
        return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons

    if server_score >= 70:
        return AttendanceSubmission.VERDICT_ACCEPTED, all_fail_reasons

    return AttendanceSubmission.VERDICT_FLAGGED, all_fail_reasons


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------

class SubmitAttendanceView(APIView):
    """
    POST /api/attendance/submit/

    Accept the full submission payload from the mobile app, run server-side
    re-validation, save AttendanceSubmission, and create/update AttendanceRecord.

    Rate limit: 3 submissions per student per session (non-REJECTED only).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AttendanceSubmissionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        student = request.user

        # Fetch session
        try:
            session = AttendanceSession.objects.select_related('course').get(
                pk=data['session_id']
            )
        except AttendanceSession.DoesNotExist:
            return Response(
                {'error': 'Session not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate session is active and not expired
        now = timezone.now()
        if not session.is_active:
            return Response(
                {'error': 'Session is not active.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if session.expires_at and now > session.expires_at:
            return Response(
                {'error': 'Session has expired.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Also check end_time as fallback
        if session.end_time and now > session.end_time:
            return Response(
                {'error': 'Session has ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate student enrollment
        is_enrolled = CourseEnrollment.objects.filter(
            student=student,
            course=session.course,
            is_active=True
        ).exists()
        if not is_enrolled:
            return Response(
                {'error': 'You are not enrolled in this course.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Rate limit: max 3 submissions per student per session
        existing_submissions = AttendanceSubmission.objects.filter(
            session=session, student=student
        )
        non_rejected_count = existing_submissions.exclude(
            verdict=AttendanceSubmission.VERDICT_REJECTED
        ).count()
        if non_rejected_count >= 3:
            return Response(
                {'error': 'Submission limit reached for this session.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Reject duplicate if a non-REJECTED record already exists
        accepted_record = AttendanceRecord.objects.filter(
            session=session, student=student
        ).exclude(final_verdict=AttendanceSubmission.VERDICT_REJECTED).first()
        if accepted_record:
            return Response(
                {
                    'error': 'Attendance already recorded for this session.',
                    'verdict': accepted_record.final_verdict,
                    'confidenceScore': accepted_record.confidence_score,
                },
                status=status.HTTP_409_CONFLICT
            )

        # Server-side score re-computation
        server_score, server_fail_reasons = _server_recompute_score(session, data)
        verdict, all_fail_reasons = _determine_verdict(
            server_score,
            data['confidence_score'],
            session,
            server_fail_reasons,
            data
        )

        ip_address = _get_client_ip(request)

        with transaction.atomic():
            submission = AttendanceSubmission.objects.create(
                session=session,
                student=student,
                coordinates=data['coordinates'],
                sample_count=data['sample_count'],
                mock_gps_flag=data.get('mock_gps_flag', False),
                network_type=data.get('network_type', AttendanceSubmission.NETWORK_NONE),
                movement_variance=data.get('movement_variance', 0.0),
                suspiciously_still=data.get('suspiciously_still', False),
                collection_duration_ms=data.get('collection_duration_ms', 0),
                confidence_score=data['confidence_score'],
                server_confidence_score=server_score,
                verdict=verdict,
                score_breakdown=data.get('score_breakdown', {}),
                fail_reasons=all_fail_reasons,
                behavioral_flags=data.get('behavioral_flags', {}),
                ip_address=ip_address,
                device_fingerprint=data.get('device_fingerprint', ''),
            )

            # Create or update AttendanceRecord
            AttendanceRecord.objects.update_or_create(
                session=session,
                student=student,
                defaults={
                    'submission': submission,
                    'final_verdict': verdict,
                    'confidence_score': server_score,
                },
            )

        return Response(
            {
                'verdict': verdict,
                'confidenceScore': server_score,
                'message': _verdict_message(verdict),
            },
            status=status.HTTP_201_CREATED
        )


def _verdict_message(verdict):
    messages = {
        AttendanceSubmission.VERDICT_ACCEPTED: 'Attendance accepted.',
        AttendanceSubmission.VERDICT_FLAGGED: 'Attendance flagged for manual review.',
        AttendanceSubmission.VERDICT_REJECTED: 'Attendance rejected.',
    }
    return messages.get(verdict, 'Unknown verdict.')


class SessionConfigView(APIView):
    """
    GET /api/attendance/session/{sessionId}/

    Return session configuration for a given active session.
    Students use this to configure Phase 1-3 on the frontend.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = AttendanceSession.objects.select_related('course').get(
                pk=session_id, is_active=True
            )
        except AttendanceSession.DoesNotExist:
            return Response(
                {'error': 'Active session not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SessionConfigSerializer(session)
        return Response(serializer.data)


class LecturerSessionSubmissionsView(APIView):
    """
    GET /api/attendance/lecturer/session/{sessionId}/submissions/

    Lecturer-only endpoint. Returns all submissions for a session with
    verdict, score, flags. Supports ?verdict= filter.
    """

    permission_classes = [IsAuthenticated, IsLecturer]

    def get(self, request, session_id):
        try:
            session = AttendanceSession.objects.select_related('course').get(pk=session_id)
        except AttendanceSession.DoesNotExist:
            return Response(
                {'error': 'Session not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Restrict to lecturer's own sessions (ADMIN can see all)
        if (
            getattr(request.user, 'role', None) == 'LECTURER'
            and hasattr(session.course, 'lecturer')
            and session.course.lecturer != request.user
        ):
            return Response(
                {'error': 'You do not have permission to view this session.'},
                status=status.HTTP_403_FORBIDDEN
            )

        qs = AttendanceSubmission.objects.filter(session=session).select_related('student')

        verdict_filter = request.query_params.get('verdict')
        if verdict_filter and verdict_filter.upper() in (
            AttendanceSubmission.VERDICT_ACCEPTED,
            AttendanceSubmission.VERDICT_FLAGGED,
            AttendanceSubmission.VERDICT_REJECTED,
        ):
            qs = qs.filter(verdict=verdict_filter.upper())

        serializer = AttendanceSubmissionDetailSerializer(qs, many=True)
        return Response({'count': qs.count(), 'submissions': serializer.data})


class LecturerOverrideView(APIView):
    """
    PATCH /api/attendance/lecturer/override/{submissionId}/

    Lecturer can manually override a FLAGGED submission to ACCEPTED or REJECTED.
    Logs the override with reason and lecturer ID.
    """

    permission_classes = [IsAuthenticated, IsLecturer]

    def patch(self, request, submission_id):
        try:
            submission = AttendanceSubmission.objects.select_related(
                'session__course', 'student'
            ).get(pk=submission_id)
        except AttendanceSubmission.DoesNotExist:
            return Response(
                {'error': 'Submission not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Restrict to lecturer's own sessions (ADMIN can override all)
        if (
            getattr(request.user, 'role', None) == 'LECTURER'
            and hasattr(submission.session.course, 'lecturer')
            and submission.session.course.lecturer != request.user
        ):
            return Response(
                {'error': 'You do not have permission to override this submission.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LecturerOverrideSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_verdict = serializer.validated_data['verdict']
        reason = serializer.validated_data['reason']

        with transaction.atomic():
            submission.verdict = new_verdict
            submission.overridden_by = request.user
            submission.override_reason = reason
            submission.overridden_at = timezone.now()
            submission.save(update_fields=[
                'verdict', 'overridden_by', 'override_reason', 'overridden_at'
            ])

            # Update the AttendanceRecord
            AttendanceRecord.objects.filter(
                session=submission.session, student=submission.student
            ).update(
                final_verdict=new_verdict,
                confidence_score=submission.server_confidence_score,
            )

        return Response(
            {
                'verdict': new_verdict,
                'message': 'Submission overridden to {}.'.format(new_verdict),
            }
        )

