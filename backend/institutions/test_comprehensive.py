"""
Comprehensive unit tests for the Presently backend.

Covers:
  - Authentication: registration, login, logout, JWT tokens, OTP email verification
  - Student role: dashboard analytics, course enrollment, attendance check-in
  - Lecturer role: session creation, session management, end session
  - Admin role: user management, institution management, RBAC
  - Full attendance flow: lecturer creates session → student checks in
"""

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, APIClient, force_authenticate
from rest_framework import status
from unittest.mock import patch, MagicMock
import datetime
import json

# ─── Shared model imports ─────────────────────────────────────────────────────
from institutions.models import (
    User, Institution, College, Department, Course, CourseEnrollment,
    AttendanceSession, Attendance, Venue, UserRole, EmailVerificationOTP
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_institution(suffix=''):
    return Institution.objects.create(
        full_name=f'Test University{suffix}',
        short_name=f'TU{suffix}',
        abbreviation=f'TU{suffix}',
        country='Nigeria', state_province='Osun', city='Ile-Ife',
        address='PMB 13, Ile-Ife'
    )


def make_college(institution, suffix=''):
    return College.objects.create(
        institution=institution,
        name=f'College of Science{suffix}',
        code=f'COS{suffix}',
        abbreviation=f'COS{suffix}'
    )


def make_department(college, institution, suffix=''):
    return Department.objects.create(
        college=college, institution=institution,
        name=f'Computer Science{suffix}',
        code=f'CS{suffix}',
        abbreviation=f'CS{suffix}'
    )


def make_venue(institution):
    return Venue.objects.create(
        institution=institution,
        name='Main Lecture Hall',
        code='MLH',
        latitude=7.5197,
        longitude=4.5267,
        gps_radius=100,
        verification_radius=100
    )


def make_active_session(course, venue, start_offset_minutes=-5, duration_minutes=60):
    start = timezone.now() + datetime.timedelta(minutes=start_offset_minutes)
    end = start + datetime.timedelta(minutes=duration_minutes)
    return AttendanceSession.objects.create(
        course=course,
        venue=venue,
        start_time=start,
        end_time=end,
        is_active=True,
        latitude=7.5197,
        longitude=4.5267,
        location_radius=100
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. Authentication Tests
# ─────────────────────────────────────────────────────────────────────────────

class RegistrationTests(TestCase):
    """Tests for user registration endpoint."""

    def setUp(self):
        self.client = APIClient()

    @patch('institutions.views.send_verification_email')
    def test_registration_success(self, mock_email):
        """New user can register successfully."""
        mock_email.return_value = True
        response = self.client.post('/api/auth/register/', {
            'email': 'newuser@test.com',
            'full_name': 'New User',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['email'], 'newuser@test.com')
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())

    @patch('institutions.views.send_verification_email')
    def test_registration_password_mismatch(self, mock_email):
        """Registration fails when passwords don't match."""
        mock_email.return_value = True
        response = self.client.post('/api/auth/register/', {
            'email': 'mismatch@test.com',
            'full_name': 'Mismatch User',
            'password': 'Pass1234!',
            'password2': 'Different1234!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    @patch('institutions.views.send_verification_email')
    def test_registration_duplicate_email(self, mock_email):
        """Registration fails for duplicate email."""
        mock_email.return_value = True
        User.objects.create_user(
            email='existing@test.com', password='pass', full_name='Existing'
        )
        response = self.client.post('/api/auth/register/', {
            'email': 'existing@test.com',
            'full_name': 'Duplicate',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(TestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='login@test.com',
            password='testpass123',
            full_name='Login User',
            role=UserRole.STUDENT,
            onboarding_complete=True,
            email_verified=True,
        )

    def test_login_success(self):
        """Valid credentials return JWT tokens."""
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_login_invalid_password(self):
        """Invalid password returns 400."""
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'wrongpassword',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_login_nonexistent_email(self):
        """Non-existent email returns 400."""
        response = self.client.post('/api/auth/login/', {
            'email': 'ghost@test.com',
            'password': 'anypass',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_user_info(self):
        """Login response includes role and onboarding status."""
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.data['user']['role'], UserRole.STUDENT)
        self.assertTrue(response.data['user']['onboarding_complete'])

    @patch('institutions.views.send_verification_email')
    def test_unverified_login_sends_otp_and_requires_verification(self, mock_send_verification_email):
        """Unverified users should receive OTP and be routed to verification instead of full login."""
        mock_send_verification_email.return_value = True
        self.user.email_verified = False
        self.user.save(update_fields=['email_verified'])

        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'testpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['requires_email_verification'])
        self.assertNotIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], 'login@test.com')
        mock_send_verification_email.assert_called_once()

    @patch('institutions.views.send_verification_email')
    def test_unverified_login_handles_otp_send_failure_gracefully(self, mock_send_verification_email):
        """Login should still direct unverified users to OTP page when auto-send fails."""
        mock_send_verification_email.side_effect = Exception('email provider down')
        self.user.email_verified = False
        self.user.save(update_fields=['email_verified'])

        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'testpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['requires_email_verification'])
        self.assertTrue(response.data['otp_send_failed'])


class LogoutTests(TestCase):
    """Tests for the logout endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='logout@test.com',
            password='pass',
            full_name='Logout User',
        )

    def test_logout_requires_authentication(self):
        """Unauthenticated logout returns 401."""
        response = self.client.post('/api/auth/logout/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_success(self):
        """Authenticated user can log out."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/logout/', {}, format='json')
        # Should return 200 or 205 (reset content)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT])


class CurrentUserTests(TestCase):
    """Tests for GET /auth/me/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='me@test.com',
            password='pass',
            full_name='Me User',
            role=UserRole.STUDENT,
            onboarding_complete=True,
        )

    def test_get_current_user_authenticated(self):
        """Authenticated user can retrieve their profile."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'me@test.com')
        self.assertEqual(response.data['user']['role'], UserRole.STUDENT)

    def test_get_current_user_unauthenticated(self):
        """Unauthenticated request returns 401."""
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Student Role Tests
# ─────────────────────────────────────────────────────────────────────────────

class StudentDashboardTests(TestCase):
    """Tests for the student analytics/dashboard view."""

    def setUp(self):
        self.client = APIClient()
        self.institution = make_institution()
        self.college = make_college(self.institution)
        self.department = make_department(self.college, self.institution)

        self.student = User.objects.create_user(
            email='student@test.com', password='pass',
            full_name='Student User', role=UserRole.STUDENT,
            institution=self.institution, college=self.college,
            onboarding_complete=True,
        )
        self.lecturer = User.objects.create_user(
            email='lecturer@test.com', password='pass',
            full_name='Lecturer User', role=UserRole.LECTURER,
            onboarding_complete=True,
        )
        self.course = Course.objects.create(
            code='CS301', title='Data Structures', lecturer=self.lecturer,
            credit_units=3
        )
        self.course.department.add(self.department)
        CourseEnrollment.objects.create(
            student=self.student, course=self.course, is_active=True
        )

    def test_student_dashboard_returns_200(self):
        """Student dashboard returns HTTP 200."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/analytics/dashboard/student/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_dashboard_contains_enrolled_courses(self):
        """Dashboard includes enrolled courses."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/analytics/dashboard/student/')
        self.assertIn('enrolled_courses', response.data)
        self.assertEqual(len(response.data['enrolled_courses']), 1)
        self.assertEqual(response.data['enrolled_courses'][0]['course_code'], 'CS301')

    def test_student_dashboard_contains_attendance_stats(self):
        """Dashboard includes attendance statistics."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/analytics/dashboard/student/')
        self.assertIn('attendance_stats', response.data)
        stats = response.data['attendance_stats']
        self.assertIn('average_attendance', stats)
        self.assertIn('total_present', stats)
        self.assertIn('total_absent', stats)

    def test_lecturer_cannot_access_student_dashboard(self):
        """Lecturer is rejected from the student-only analytics endpoint."""
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.get('/api/analytics/dashboard/student/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_dashboard_returns_401(self):
        """Unauthenticated request is rejected."""
        response = self.client.get('/api/analytics/dashboard/student/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudentEnrollmentTests(TestCase):
    """Tests for course enrollment by students."""

    def setUp(self):
        self.client = APIClient()
        self.institution = make_institution('_enroll')
        self.college = make_college(self.institution, '_enroll')
        self.department = make_department(self.college, self.institution, '_enroll')

        self.student = User.objects.create_user(
            email='enroll_student@test.com', password='pass',
            full_name='Enroll Student', role=UserRole.STUDENT,
            institution=self.institution, college=self.college,
            department=self.department.code, onboarding_complete=True,
        )
        self.lecturer = User.objects.create_user(
            email='enroll_lecturer@test.com', password='pass',
            full_name='Enroll Lecturer', role=UserRole.LECTURER,
        )
        self.course = Course.objects.create(
            code='CS401', title='Algorithms', lecturer=self.lecturer, credit_units=3
        )
        self.course.department.add(self.department)

    def test_student_can_list_enrollments(self):
        """Student can list their own course enrollments."""
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/course-enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_enrollment_list_returns_401(self):
        """Unauthenticated request is rejected."""
        response = self.client.get('/api/course-enrollments/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Lecturer Role Tests
# ─────────────────────────────────────────────────────────────────────────────

class LecturerSessionTests(TestCase):
    """Tests for attendance session management by lecturers."""

    def setUp(self):
        self.client = APIClient()
        self.institution = make_institution('_lec')
        self.college = make_college(self.institution, '_lec')
        self.department = make_department(self.college, self.institution, '_lec')

        self.lecturer = User.objects.create_user(
            email='lec@test.com', password='pass',
            full_name='Dr. Lecturer', role=UserRole.LECTURER,
            onboarding_complete=True,
        )
        self.student = User.objects.create_user(
            email='lec_student@test.com', password='pass',
            full_name='Lec Student', role=UserRole.STUDENT,
            institution=self.institution, college=self.college,
            onboarding_complete=True,
        )
        self.course = Course.objects.create(
            code='CS501', title='Operating Systems', lecturer=self.lecturer, credit_units=3
        )
        self.course.department.add(self.department)
        self.venue = make_venue(self.institution)

        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)

    @patch('institutions.views.AttendanceSessionViewSet.perform_create')
    def test_lecturer_can_create_session(self, mock_perform_create):
        """Lecturer can create an attendance session."""
        def side_effect(serializer):
            serializer.save()
        mock_perform_create.side_effect = side_effect

        self.client.force_authenticate(user=self.lecturer)
        start = timezone.now() + datetime.timedelta(minutes=1)
        end = start + datetime.timedelta(hours=1)
        response = self.client.post('/api/sessions/', {
            'course': self.course.id,
            'venue': self.venue.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AttendanceSession.objects.count(), 1)
        self.assertEqual(AttendanceSession.objects.first().course_id, self.course.id)

    def test_student_cannot_create_session(self):
        """Student is rejected when trying to create a session."""
        self.client.force_authenticate(user=self.student)
        start = timezone.now() + datetime.timedelta(minutes=1)
        end = start + datetime.timedelta(hours=1)
        response = self.client.post('/api/sessions/', {
            'course': self.course.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
        }, format='json')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_401_UNAUTHORIZED,
        ])

    def test_lecturer_can_list_their_sessions(self):
        """Lecturer can list sessions for their courses."""
        make_active_session(self.course, self.venue)
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.get('/api/sessions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_lecturer_can_end_a_session(self):
        """Lecturer can manually end an active session."""
        session = make_active_session(self.course, self.venue)
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.post(f'/api/sessions/{session.id}/end/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session.refresh_from_db()
        self.assertFalse(session.is_active)

    def test_other_lecturer_cannot_end_session(self):
        """A different lecturer cannot end another lecturer's session."""
        other_lecturer = User.objects.create_user(
            email='other_lec@test.com', password='pass',
            full_name='Other Lecturer', role=UserRole.LECTURER
        )
        session = make_active_session(self.course, self.venue)
        self.client.force_authenticate(user=other_lecturer)
        response = self.client.post(f'/api/sessions/{session.id}/end/')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        ])


# ─────────────────────────────────────────────────────────────────────────────
# 4. Admin Role Tests
# ─────────────────────────────────────────────────────────────────────────────

class AdminTests(TestCase):
    """Tests for admin-only CRUD operations."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@test.com', password='pass',
            full_name='Admin User', role=UserRole.ADMIN,
            is_staff=True, onboarding_complete=True,
        )
        self.student = User.objects.create_user(
            email='admin_student@test.com', password='pass',
            full_name='Admin Student', role=UserRole.STUDENT,
            onboarding_complete=True,
        )
        self.institution = make_institution('_admin')

    # ── Institution management ────────────────────────────────────────────────

    def test_admin_can_create_institution(self):
        """Admin can create an institution."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/institutions/', {
            'full_name': 'New Test University',
            'short_name': 'NTU',
            'abbreviation': 'NTU',
            'country': 'Nigeria',
            'state_province': 'Lagos',
            'city': 'Lagos',
            'address': '1 University Road',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_create_institution(self):
        """Non-admin user cannot create an institution."""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/institutions/', {
            'full_name': 'Unauthorized Uni',
            'short_name': 'UU',
            'abbreviation': 'UU',
            'country': 'Nigeria',
            'state_province': 'Lagos',
            'city': 'Lagos',
            'address': '1 Road',
        }, format='json')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_401_UNAUTHORIZED,
        ])

    def test_admin_can_list_institutions(self):
        """Admin can list all institutions."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/institutions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_delete_institution(self):
        """Admin can delete an institution."""
        inst = make_institution('_to_delete')
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/institutions/{inst.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # ── Venue management ──────────────────────────────────────────────────────

    def test_admin_can_create_venue(self):
        """Admin can create a venue."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/venues/', {
            'institution': self.institution.id,
            'name': 'Test Hall',
            'code': 'TH-01',
            'latitude': 7.5197,
            'longitude': 4.5267,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_create_venue(self):
        """Non-admin cannot create a venue."""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/venues/', {
            'institution': self.institution.id,
            'name': 'Unauthorized Hall',
            'code': 'UH-01',
            'latitude': 7.0,
            'longitude': 4.0,
        }, format='json')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_401_UNAUTHORIZED,
        ])


# ─────────────────────────────────────────────────────────────────────────────
# 5. Full Attendance Flow Tests
# ─────────────────────────────────────────────────────────────────────────────

class FullAttendanceFlowTests(TestCase):
    """
    End-to-end attendance flow tests (API level):
      1. Lecturer creates an attendance session
      2. Student checks in via session check-in endpoint
      3. Attendance record is verified
    """

    def setUp(self):
        self.client = APIClient()
        self.factory = APIRequestFactory()

        self.institution = make_institution('_flow')
        self.college = make_college(self.institution, '_flow')
        self.department = make_department(self.college, self.institution, '_flow')

        self.lecturer = User.objects.create_user(
            email='flow_lec@test.com', password='pass',
            full_name='Flow Lecturer', role=UserRole.LECTURER,
            onboarding_complete=True,
        )
        self.student = User.objects.create_user(
            email='flow_student@test.com', password='pass',
            full_name='Flow Student', role=UserRole.STUDENT,
            institution=self.institution, college=self.college,
            onboarding_complete=True,
        )
        self.course = Course.objects.create(
            code='CS601', title='Computer Networks', lecturer=self.lecturer, credit_units=3
        )
        self.course.department.add(self.department)
        CourseEnrollment.objects.create(
            student=self.student, course=self.course, is_active=True
        )
        self.venue = make_venue(self.institution)

    @patch('institutions.views.AttendanceSessionViewSet.perform_create')
    @patch('institutions.attendance_logic.verify_location')
    def test_full_attendance_flow(self, mock_verify, mock_perform_create):
        """
        Full flow: lecturer creates session → student checks in → PRESENT.
        """
        # Step 1: Lecturer creates session
        mock_perform_create.side_effect = lambda serializer: serializer.save()

        self.client.force_authenticate(user=self.lecturer)
        start = timezone.now() - datetime.timedelta(minutes=5)
        end = timezone.now() + datetime.timedelta(minutes=55)
        create_resp = self.client.post('/api/sessions/', {
            'course': self.course.id,
            'venue': self.venue.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
        }, format='json')
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        session_id = create_resp.data['id']
        session_code = create_resp.data['session_code']

        # Step 2: Student checks in (mock location as valid)
        mock_verify.return_value = (True, 5.0)
        self.client.force_authenticate(user=self.student)
        checkin_resp = self.client.post(
            f'/api/sessions/{session_id}/check_in/',
            {'latitude': 7.5197, 'longitude': 4.5267, 'code': session_code},
            format='json'
        )
        self.assertEqual(checkin_resp.status_code, status.HTTP_201_CREATED)

        # Step 3: Verify attendance record was created
        attendance = Attendance.objects.filter(session_id=session_id, student=self.student)
        self.assertEqual(attendance.count(), 1)
        self.assertEqual(attendance.first().status, 'PRESENT')

    @patch('institutions.views.AttendanceSessionViewSet.perform_create')
    @patch('institutions.attendance_logic.verify_location')
    def test_student_marked_late_after_grace_period(self, mock_verify, mock_perform_create):
        """Student checking in after the grace period (>15 min) is marked LATE."""
        mock_perform_create.side_effect = lambda serializer: serializer.save()
        mock_verify.return_value = (True, 5.0)

        # Create session that started 20 min ago
        session = AttendanceSession.objects.create(
            course=self.course,
            venue=self.venue,
            start_time=timezone.now() - datetime.timedelta(minutes=20),
            end_time=timezone.now() + datetime.timedelta(minutes=40),
            is_active=True,
            latitude=7.5197,
            longitude=4.5267,
            location_radius=100,
        )

        from institutions.views import AttendanceSessionViewSet
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{session.id}/check_in/',
            {'latitude': 7.5197, 'longitude': 4.5267, 'code': session.session_code},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=session.id)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        attendance = Attendance.objects.get(session=session, student=self.student)
        self.assertEqual(attendance.status, 'LATE')

    @patch('institutions.attendance_logic.verify_location')
    def test_duplicate_check_in_rejected(self, mock_verify):
        """Student cannot check in twice for the same session."""
        mock_verify.return_value = (True, 5.0)

        session = make_active_session(self.course, self.venue)
        # First check-in
        Attendance.objects.create(
            session=session, student=self.student,
            latitude=7.5197, longitude=4.5267,
            accuracy=10.0, location_verified=True,
        )

        from institutions.views import AttendanceSessionViewSet
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{session.id}/check_in/',
            {'latitude': 7.5197, 'longitude': 4.5267, 'code': session.session_code},
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=session.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already checked in', response.data['error'].lower())

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_location_too_far(self, mock_verify):
        """Student too far from venue is rejected."""
        mock_verify.return_value = (False, 500.0)

        session = make_active_session(self.course, self.venue)

        from institutions.views import AttendanceSessionViewSet
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{session.id}/check_in/',
            {'latitude': 10.0, 'longitude': 10.0, 'code': session.session_code},
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=session.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('too far', response.data['error'].lower())
        self.assertEqual(Attendance.objects.count(), 0)

    @patch('institutions.attendance_logic.verify_location')
    def test_public_check_in_endpoint(self, mock_verify):
        """Student can check in via the public /check-in/<code>/ endpoint."""
        mock_verify.return_value = (True, 5.0)

        session = make_active_session(self.course, self.venue)

        from institutions.views import public_check_in_view
        request = self.factory.post(
            f'/api/check-in/{session.session_code}/',
            {'latitude': 7.5197, 'longitude': 4.5267},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = public_check_in_view(request, session_code=session.session_code)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.filter(session=session, student=self.student).count(), 1)


# ─────────────────────────────────────────────────────────────────────────────
# 6. RBAC / Permission Tests
# ─────────────────────────────────────────────────────────────────────────────

class RBACTests(TestCase):
    """Role-based access control tests."""

    def setUp(self):
        self.client = APIClient()
        self.institution = make_institution('_rbac')
        self.college = make_college(self.institution, '_rbac')
        self.department = make_department(self.college, self.institution, '_rbac')

        self.student = User.objects.create_user(
            email='rbac_student@test.com', password='pass',
            full_name='RBAC Student', role=UserRole.STUDENT,
            onboarding_complete=True,
        )
        self.lecturer = User.objects.create_user(
            email='rbac_lecturer@test.com', password='pass',
            full_name='RBAC Lecturer', role=UserRole.LECTURER,
            onboarding_complete=True,
        )
        self.admin = User.objects.create_user(
            email='rbac_admin@test.com', password='pass',
            full_name='RBAC Admin', role=UserRole.ADMIN,
            is_staff=True, onboarding_complete=True,
        )

    def test_unauthenticated_cannot_list_sessions(self):
        """Unauthenticated users cannot list sessions."""
        response = self.client.get('/api/sessions/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_list_sessions(self):
        """Students can list sessions (read access)."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/sessions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_delete_session(self):
        """Students cannot delete attendance sessions."""
        course = Course.objects.create(code='CS901', title='Test', lecturer=self.lecturer, credit_units=3)
        venue = make_venue(self.institution)
        session = make_active_session(course, venue)

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(f'/api/sessions/{session.id}/')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        ])

    def test_admin_can_list_users(self):
        """Admin can list all users."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_list_users(self):
        """Students cannot list the user roster."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/users/')
        self.assertIn(response.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        ])
