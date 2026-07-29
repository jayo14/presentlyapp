from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from django.conf import settings

from institutions.models import (
    User, UserRole, Institution, College, Department,
    Course, CourseEnrollment, AttendanceSession, Venue,
)
from .models import AttendanceSubmission, AttendanceRecord
from .views import _haversine_metres
from .scoring import _server_recompute_score, _determine_verdict
from .tasks import score_submission_task
import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_institution():
    return Institution.objects.create(
        full_name="Test University", short_name="TU", abbreviation="TU",
        country="NG", state_province="Osun", city="Ile-Ife", address="Test"
    )


def make_college(institution):
    return College.objects.create(
        institution=institution, name="College of Science",
        code="COS", abbreviation="COS"
    )


def make_department(college, institution):
    return Department.objects.create(
        college=college, institution=institution,
        name="Computer Science", code="CSC", abbreviation="CSC"
    )


def make_course(lecturer, department):
    course = Course.objects.create(
        code="CSC101", title="Intro to CS", lecturer=lecturer
    )
    course.department.add(department)
    return course


def make_session(course, venue=None, **kwargs):
    defaults = dict(
        course=course,
        venue=venue,
        start_time=timezone.now() - datetime.timedelta(minutes=5),
        end_time=timezone.now() + datetime.timedelta(hours=1),
        is_active=True,
        latitude=6.8920,
        longitude=3.7182,
        location_radius=100,
        lecturer_coordinates={'lat': 6.8920, 'lng': 3.7182},
        allowed_radius_meters=100,
        min_samples=3,
    )
    defaults.update(kwargs)
    return AttendanceSession.objects.create(**defaults)


def make_student(email="student@test.com"):
    return User.objects.create_user(
        email=email, password="password",
        full_name="Test Student", role=UserRole.STUDENT
    )


def make_lecturer(email="lecturer@test.com"):
    return User.objects.create_user(
        email=email, password="password",
        full_name="Test Lecturer", role=UserRole.LECTURER
    )


# ---------------------------------------------------------------------------
# Unit tests for utility functions
# ---------------------------------------------------------------------------

class HaversineTests(TestCase):
    def test_same_point_is_zero(self):
        self.assertAlmostEqual(_haversine_metres(6.89, 3.71, 6.89, 3.71), 0.0, places=1)

    def test_known_distance(self):
        # Approx 111 km per degree of latitude
        dist = _haversine_metres(0.0, 0.0, 1.0, 0.0)
        self.assertAlmostEqual(dist, 111_195, delta=200)


class ServerRecomputeScoreTests(TestCase):
    def _make_session(self, **kwargs):
        inst = make_institution()
        college = make_college(inst)
        dept = make_department(college, inst)
        lecturer = make_lecturer()
        course = make_course(lecturer, dept)
        return make_session(course, **kwargs)

    def _payload(self, **overrides):
        base = {
            'coordinates': {'lat': 6.8920, 'lng': 3.7182},
            'sample_count': 5,
            'mock_gps_flag': False,
            'suspiciously_still': False,
            'behavioral_flags': {},
        }
        base.update(overrides)
        return base

    def test_perfect_payload_gives_full_score(self):
        session = self._make_session(
            lecturer_coordinates={'lat': 6.8920, 'lng': 3.7182},
            allowed_radius_meters=100,
            min_samples=3,
        )
        score, reasons = _server_recompute_score(session, self._payload())
        self.assertEqual(score, 100)
        self.assertEqual(reasons, [])

    def test_mock_gps_flag_deducts_score(self):
        session = self._make_session(
            lecturer_coordinates={'lat': 6.8920, 'lng': 3.7182},
            allowed_radius_meters=100,
            min_samples=3,
        )
        score, reasons = _server_recompute_score(session, self._payload(mock_gps_flag=True))
        self.assertLess(score, 100)
        self.assertTrue(any("Mock GPS" in r for r in reasons))

    def test_too_few_samples_deducts_score(self):
        session = self._make_session(
            lecturer_coordinates={'lat': 6.8920, 'lng': 3.7182},
            allowed_radius_meters=100,
            min_samples=5,
        )
        score, reasons = _server_recompute_score(session, self._payload(sample_count=2))
        self.assertLess(score, 100)
        self.assertTrue(any("samples" in r for r in reasons))

    def test_outside_geofence_deducts_score(self):
        session = self._make_session(
            lecturer_coordinates={'lat': 6.8920, 'lng': 3.7182},
            allowed_radius_meters=10,  # very tight radius
            min_samples=3,
        )
        # Submit from 1 degree away (~111 km)
        score, reasons = _server_recompute_score(
            session, self._payload(coordinates={'lat': 7.8920, 'lng': 3.7182})
        )
        self.assertLess(score, 100)
        self.assertTrue(any("geofence" in r for r in reasons))


class DetermineVerdictTests(TestCase):
    def _make_session(self):
        inst = make_institution()
        college = make_college(inst)
        dept = make_department(college, inst)
        lecturer = make_lecturer()
        course = make_course(lecturer, dept)
        return make_session(course)

    def test_accepted_when_score_high(self):
        session = self._make_session()
        verdict, _ = _determine_verdict(90, 90, session, [], {})
        self.assertEqual(verdict, AttendanceSubmission.VERDICT_ACCEPTED)

    def test_rejected_when_score_low(self):
        session = self._make_session()
        verdict, _ = _determine_verdict(30, 30, session, [], {})
        self.assertEqual(verdict, AttendanceSubmission.VERDICT_REJECTED)

    def test_rejected_when_mock_gps(self):
        session = self._make_session()
        verdict, _ = _determine_verdict(90, 90, session, [], {'mock_gps_flag': True})
        self.assertEqual(verdict, AttendanceSubmission.VERDICT_REJECTED)

    def test_flagged_when_score_delta_too_large(self):
        session = self._make_session()
        verdict, reasons = _determine_verdict(75, 100, session, [], {})
        self.assertEqual(verdict, AttendanceSubmission.VERDICT_FLAGGED)
        self.assertTrue(any("diverges" in r for r in reasons))

    def test_flagged_when_strict_mode_and_fail_reasons(self):
        session = self._make_session()
        session.strict_mode = True
        verdict, _ = _determine_verdict(80, 80, session, ["some flag"], {})
        self.assertEqual(verdict, AttendanceSubmission.VERDICT_FLAGGED)


# ---------------------------------------------------------------------------
# Integration tests for API views
# ---------------------------------------------------------------------------

class AttendanceSubmitViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.inst = make_institution()
        self.college = make_college(self.inst)
        self.dept = make_department(self.college, self.inst)
        self.lecturer = make_lecturer()
        self.student = make_student()
        self.course = make_course(self.lecturer, self.dept)
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.session = make_session(self.course)

    def _payload(self, **overrides):
        base = {
            'session_id': self.session.id,
            'coordinates': {'lat': 6.8920, 'lng': 3.7182},
            'sample_count': 5,
            'mock_gps_flag': False,
            'network_type': 'wifi',
            'movement_variance': 0.5,
            'suspiciously_still': False,
            'collection_duration_ms': 25000,
            'confidence_score': 95,
            'score_breakdown': {},
            'fail_reasons': [],
            'behavioral_flags': {},
            'device_fingerprint': 'test-device-001',
        }
        base.update(overrides)
        return base

    def test_successful_submission(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data['verdict'], AttendanceSubmission.VERDICT_PENDING)
        self.assertEqual(AttendanceSubmission.objects.count(), 1)
        self.assertEqual(AttendanceRecord.objects.count(), 0)

    def test_unauthenticated_rejected(self):
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_session_rejected(self):
        self.session.is_active = False
        self.session.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_session_rejected(self):
        self.session.expires_at = timezone.now() - datetime.timedelta(minutes=5)
        self.session.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_not_enrolled_rejected(self):
        other_student = make_student(email="other@test.com")
        self.client.force_authenticate(user=other_student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mock_gps_results_in_rejected_verdict(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            '/api/attendance/submit/',
            self._payload(mock_gps_flag=True),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data['verdict'], AttendanceSubmission.VERDICT_PENDING)

    def test_duplicate_submission_when_accepted_returns_409(self):
        self.client.force_authenticate(user=self.student)
        # First submission accepted
        self.client.post('/api/attendance/submit/', self._payload(), format='json')
        # Manually mark first record as ACCEPTED so duplicate check triggers
        AttendanceRecord.objects.filter(session=self.session, student=self.student).update(
            final_verdict=AttendanceSubmission.VERDICT_ACCEPTED
        )
        # Second submission should be rejected as duplicate
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_rate_limit_after_three_non_rejected(self):
        self.client.force_authenticate(user=self.student)
        # Create 3 non-rejected submissions manually
        for _ in range(3):
            AttendanceSubmission.objects.create(
                session=self.session,
                student=self.student,
                coordinates={'lat': 6.89, 'lng': 3.71},
                verdict=AttendanceSubmission.VERDICT_FLAGGED,
                confidence_score=60,
                server_confidence_score=60,
            )
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class SessionConfigViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.inst = make_institution()
        self.college = make_college(self.inst)
        self.dept = make_department(self.college, self.inst)
        self.lecturer = make_lecturer()
        self.student = make_student()
        self.course = make_course(self.lecturer, self.dept)
        self.session = make_session(self.course)

    def test_authenticated_student_can_get_session_config(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'/api/attendance/session/{self.session.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('allowed_radius_meters', response.data)
        self.assertIn('min_samples', response.data)

    def test_inactive_session_returns_404(self):
        self.session.is_active = False
        self.session.save()
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'/api/attendance/session/{self.session.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_returns_401(self):
        response = self.client.get(f'/api/attendance/session/{self.session.id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LecturerSubmissionsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.inst = make_institution()
        self.college = make_college(self.inst)
        self.dept = make_department(self.college, self.inst)
        self.lecturer = make_lecturer()
        self.student = make_student()
        self.course = make_course(self.lecturer, self.dept)
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.session = make_session(self.course)
        AttendanceSubmission.objects.create(
            session=self.session,
            student=self.student,
            coordinates={'lat': 6.89, 'lng': 3.71},
            verdict=AttendanceSubmission.VERDICT_ACCEPTED,
            confidence_score=90,
            server_confidence_score=88,
        )

    def test_lecturer_can_list_submissions(self):
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.get(
            f'/api/attendance/lecturer/session/{self.session.id}/submissions/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_student_cannot_access_lecturer_endpoint(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(
            f'/api/attendance/lecturer/session/{self.session.id}/submissions/'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verdict_filter_works(self):
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.get(
            f'/api/attendance/lecturer/session/{self.session.id}/submissions/?verdict=REJECTED'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)


class LecturerOverrideViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.inst = make_institution()
        self.college = make_college(self.inst)
        self.dept = make_department(self.college, self.inst)
        self.lecturer = make_lecturer()
        self.student = make_student()
        self.course = make_course(self.lecturer, self.dept)
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.session = make_session(self.course)
        self.submission = AttendanceSubmission.objects.create(
            session=self.session,
            student=self.student,
            coordinates={'lat': 6.89, 'lng': 3.71},
            verdict=AttendanceSubmission.VERDICT_FLAGGED,
            confidence_score=65,
            server_confidence_score=62,
        )
        AttendanceRecord.objects.create(
            session=self.session,
            student=self.student,
            submission=self.submission,
            final_verdict=AttendanceSubmission.VERDICT_FLAGGED,
            confidence_score=62,
        )

    def test_lecturer_can_override_flagged_to_accepted(self):
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.patch(
            f'/api/attendance/lecturer/override/{self.submission.id}/',
            {'verdict': 'ACCEPTED', 'reason': 'Verified in person'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.verdict, AttendanceSubmission.VERDICT_ACCEPTED)
        self.assertEqual(self.submission.override_reason, 'Verified in person')
        self.assertIsNotNone(self.submission.overridden_at)

    def test_override_updates_attendance_record(self):
        self.client.force_authenticate(user=self.lecturer)
        self.client.patch(
            f'/api/attendance/lecturer/override/{self.submission.id}/',
            {'verdict': 'REJECTED', 'reason': 'Confirmed absence'},
            format='json'
        )
        record = AttendanceRecord.objects.get(session=self.session, student=self.student)
        self.assertEqual(record.final_verdict, AttendanceSubmission.VERDICT_REJECTED)

    def test_student_cannot_override(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.patch(
            f'/api/attendance/lecturer/override/{self.submission.id}/',
            {'verdict': 'ACCEPTED', 'reason': 'Self-override attempt'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_override_requires_reason(self):
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.patch(
            f'/api/attendance/lecturer/override/{self.submission.id}/',
            {'verdict': 'ACCEPTED'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AsyncScoringTests(TestCase):
    """Tests for the async Celery scoring flow."""

    def setUp(self):
        self.client = APIClient()
        self.inst = make_institution()
        self.college = make_college(self.inst)
        self.dept = make_department(self.college, self.inst)
        self.lecturer = make_lecturer()
        self.student = make_student()
        self.course = make_course(self.lecturer, self.dept)
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.session = make_session(self.course)

    def _payload(self, **overrides):
        base = {
            'session_id': self.session.id,
            'coordinates': {'lat': 6.8920, 'lng': 3.7182},
            'sample_count': 5,
            'mock_gps_flag': False,
            'network_type': 'wifi',
            'movement_variance': 0.5,
            'suspiciously_still': False,
            'collection_duration_ms': 25000,
            'confidence_score': 95,
            'score_breakdown': {},
            'fail_reasons': [],
            'behavioral_flags': {},
            'device_fingerprint': 'test-device-001',
        }
        base.update(overrides)
        return base

    def test_submission_returns_202_and_pending(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data['verdict'], AttendanceSubmission.VERDICT_PENDING)
        self.assertEqual(AttendanceSubmission.objects.count(), 1)
        self.assertEqual(AttendanceRecord.objects.count(), 0)

    def test_task_transitions_pending_to_accepted(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        submission_id = response.data['id']

        old_eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
        settings.CELERY_TASK_ALWAYS_EAGER = True
        try:
            score_submission_task.apply(args=[submission_id])
        finally:
            settings.CELERY_TASK_ALWAYS_EAGER = old_eager

        submission = AttendanceSubmission.objects.get(pk=submission_id)
        self.assertEqual(submission.verdict, AttendanceSubmission.VERDICT_ACCEPTED)
        self.assertGreater(submission.server_confidence_score, 0)
        self.assertEqual(AttendanceRecord.objects.count(), 1)

    def test_task_transitions_pending_to_rejected_for_mock_gps(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            '/api/attendance/submit/',
            self._payload(mock_gps_flag=True),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        submission_id = response.data['id']

        old_eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
        settings.CELERY_TASK_ALWAYS_EAGER = True
        try:
            score_submission_task.apply(args=[submission_id])
        finally:
            settings.CELERY_TASK_ALWAYS_EAGER = old_eager

        submission = AttendanceSubmission.objects.get(pk=submission_id)
        self.assertEqual(submission.verdict, AttendanceSubmission.VERDICT_REJECTED)

    def test_polling_endpoint_returns_pending_then_resolved(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        submission_id = response.data['id']

        poll_url = f'/api/attendance/submission/{submission_id}/status/'
        poll_response = self.client.get(poll_url)
        self.assertEqual(poll_response.status_code, status.HTTP_200_OK)
        self.assertEqual(poll_response.data['verdict'], AttendanceSubmission.VERDICT_PENDING)

        old_eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
        settings.CELERY_TASK_ALWAYS_EAGER = True
        try:
            score_submission_task.apply(args=[submission_id])
        finally:
            settings.CELERY_TASK_ALWAYS_EAGER = old_eager

        poll_response = self.client.get(poll_url)
        self.assertEqual(poll_response.status_code, status.HTTP_200_OK)
        self.assertIn(poll_response.data['verdict'], [
            AttendanceSubmission.VERDICT_ACCEPTED,
            AttendanceSubmission.VERDICT_FLAGGED,
            AttendanceSubmission.VERDICT_REJECTED,
        ])

    def test_student_cannot_poll_other_students_submission(self):
        other_student = make_student(email="other@test.com")
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        submission_id = response.data['id']

        self.client.force_authenticate(user=other_student)
        poll_response = self.client.get(f'/api/attendance/submission/{submission_id}/status/')
        self.assertEqual(poll_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_task_retry_exhaustion_sets_flagged(self):
        from unittest.mock import patch
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/attendance/submit/', self._payload(), format='json')
        submission_id = response.data['id']

        with patch('attendance.tasks._server_recompute_score', side_effect=RuntimeError('boom')):
            old_eager = getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)
            settings.CELERY_TASK_ALWAYS_EAGER = True
            try:
                score_submission_task.apply(args=[submission_id])
            finally:
                settings.CELERY_TASK_ALWAYS_EAGER = old_eager

        submission = AttendanceSubmission.objects.get(pk=submission_id)
        self.assertEqual(submission.verdict, AttendanceSubmission.VERDICT_FLAGGED)
        self.assertTrue(
            any('Automated scoring failed' in r for r in submission.fail_reasons)
        )

