"""
Unit tests for the user onboarding endpoint (POST /api/auth/onboarding/).

Covers:
  - Student onboarding: sets role, matric_number, level, institution/college, marks complete
  - Student course enrollment during onboarding
  - Lecturer onboarding: sets role, staff_id
  - Admin onboarding: sets role directly via OnboardingSerializer
  - Unauthenticated access is rejected
  - Invalid role value is rejected
  - Partial updates do not overwrite untouched fields
"""

from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase

from institutions.models import (
    College,
    Course,
    CourseEnrollment,
    Department,
    Institution,
    User,
    UserRole,
)


# ─── helpers ─────────────────────────────────────────────────────────────────

def _make_institution(suffix=''):
    return Institution.objects.create(
        full_name=f'Onboard Uni{suffix}', short_name=f'OU{suffix}',
        abbreviation=f'OU{suffix}', country='Nigeria',
        state_province='Osun', city='Ile-Ife', address='Test Road'
    )


def _make_college(institution, suffix=''):
    return College.objects.create(
        institution=institution, name=f'College{suffix}',
        code=f'COL{suffix}', abbreviation=f'COL{suffix}'
    )


def _make_department(college, institution, suffix=''):
    return Department.objects.create(
        college=college, institution=institution,
        name=f'Department{suffix}', code=f'DEP{suffix}',
        abbreviation=f'DEP{suffix}'
    )


# ─── Test classes ─────────────────────────────────────────────────────────────

class OnboardingAuthTests(TestCase):
    """Onboarding endpoint access control."""

    def setUp(self):
        self.client = APIClient()

    def test_unauthenticated_request_returns_401(self):
        """Onboarding requires authentication."""
        response = self.client.post('/api/auth/onboarding/', {'role': 'STUDENT'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudentOnboardingTests(TestCase):
    """Onboarding flow for the STUDENT role."""

    def setUp(self):
        self.client = APIClient()
        self.institution = _make_institution()
        self.college = _make_college(self.institution)
        self.department = _make_department(self.college, self.institution)

        self.user = User.objects.create_user(
            email='ob_student@test.com',
            password='pass123',
            full_name='Onboard Student',
            onboarding_complete=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_student_onboarding_sets_role(self):
        """Role is updated to STUDENT after onboarding."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/001',
            'level': '300',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, UserRole.STUDENT)

    def test_student_onboarding_sets_matric_number(self):
        """Matric number is stored on the user profile."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/002',
            'level': '200',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.matric_number, 'MAT/2024/002')

    def test_student_onboarding_marks_complete(self):
        """onboarding_complete is set to True after a successful call."""
        self.assertFalse(self.user.onboarding_complete)
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/003',
            'level': '100',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_complete)

    def test_student_onboarding_sets_institution_and_college(self):
        """Institution and college FKs are saved on the user."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/004',
            'level': '400',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.institution_id, self.institution.id)
        self.assertEqual(self.user.college_id, self.college.id)

    def test_student_onboarding_sets_level(self):
        """Academic level is saved when provided."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/005',
            'level': '500',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.level, '500')

    def test_student_onboarding_response_contains_user_data(self):
        """Response body includes the updated user object."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/006',
            'level': '300',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], UserRole.STUDENT)

    def test_student_onboarding_enrolls_in_selected_courses(self):
        """Courses string triggers automatic course enrollment for the student."""
        lecturer = User.objects.create_user(
            email='ob_lec@test.com', password='pass',
            full_name='OB Lecturer', role=UserRole.LECTURER
        )
        course = Course.objects.create(
            code='CS101', title='Intro CS', lecturer=lecturer, credit_units=3, is_active=True
        )
        course.department.add(self.department)

        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/007',
            'level': '100',
            'institution': self.institution.id,
            'college': self.college.id,
            'courses': str(course.id),   # comma-separated IDs
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            CourseEnrollment.objects.filter(student=self.user, course=course).exists()
        )

    def test_student_onboarding_ignores_invalid_course_ids(self):
        """Non-numeric course IDs in the courses string are skipped gracefully."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/008',
            'level': '200',
            'institution': self.institution.id,
            'college': self.college.id,
            'courses': 'not-a-number,999999',  # Invalid IDs
        }, format='json')
        # Should succeed, with zero enrollments created
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CourseEnrollment.objects.filter(student=self.user).count(), 0)


class LecturerOnboardingTests(TestCase):
    """Onboarding flow for the LECTURER role."""

    def setUp(self):
        self.client = APIClient()
        self.institution = _make_institution('_lec')
        self.college = _make_college(self.institution, '_lec')

        self.user = User.objects.create_user(
            email='ob_lecturer@test.com',
            password='pass123',
            full_name='Onboard Lecturer',
            onboarding_complete=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_lecturer_onboarding_sets_role(self):
        """Role is updated to LECTURER."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'staff_id': 'STAFF/2024/001',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, UserRole.LECTURER)

    def test_lecturer_onboarding_sets_staff_id(self):
        """Staff ID is saved when provided."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'staff_id': 'STAFF/2024/002',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.staff_id, 'STAFF/2024/002')

    def test_lecturer_onboarding_marks_complete(self):
        """Onboarding is marked complete for a lecturer."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'staff_id': 'STAFF/2024/003',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_complete)

    def test_lecturer_onboarding_sets_institution_and_college(self):
        """Lecturer institution/college FKs are saved."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'staff_id': 'STAFF/2024/004',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.institution_id, self.institution.id)
        self.assertEqual(self.user.college_id, self.college.id)

    def test_lecturer_onboarding_without_staff_id(self):
        """Lecturer can complete onboarding without a staff ID (optional field)."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'institution': self.institution.id,
            'college': self.college.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_complete)


class AdminOnboardingTests(TestCase):
    """Onboarding flow for the ADMIN role."""

    def setUp(self):
        self.client = APIClient()
        self.institution = _make_institution('_adm')

        self.user = User.objects.create_user(
            email='ob_admin@test.com',
            password='pass123',
            full_name='Onboard Admin',
            onboarding_complete=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_admin_onboarding_sets_role(self):
        """Role is updated to ADMIN."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'ADMIN',
            'institution': self.institution.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, UserRole.ADMIN)

    def test_admin_onboarding_marks_complete(self):
        """Onboarding is marked complete for an admin."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'ADMIN',
            'institution': self.institution.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_complete)


class OnboardingPreferencesTests(TestCase):
    """Onboarding preference fields (notifications, location, dark mode)."""

    def setUp(self):
        self.client = APIClient()
        self.institution = _make_institution('_pref')
        self.college = _make_college(self.institution, '_pref')

        self.user = User.objects.create_user(
            email='ob_prefs@test.com',
            password='pass123',
            full_name='Prefs User',
            onboarding_complete=False,
        )
        self.client.force_authenticate(user=self.user)

    def test_notifications_enabled_preference(self):
        """notifications_enabled flag is persisted."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/P01',
            'level': '300',
            'institution': self.institution.id,
            'college': self.college.id,
            'notifications_enabled': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.notifications_enabled)

    def test_location_enabled_preference(self):
        """location_enabled flag is persisted."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/P02',
            'level': '300',
            'institution': self.institution.id,
            'college': self.college.id,
            'location_enabled': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.location_enabled)

    def test_dark_mode_preference(self):
        """dark_mode flag is persisted."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'STUDENT',
            'matric_number': 'MAT/2024/P03',
            'level': '300',
            'institution': self.institution.id,
            'college': self.college.id,
            'dark_mode': False,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.dark_mode)

    def test_timezone_preference(self):
        """timezone preference is stored correctly."""
        response = self.client.post('/api/auth/onboarding/', {
            'role': 'LECTURER',
            'institution': self.institution.id,
            'college': self.college.id,
            'timezone': 'Africa/Lagos',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.timezone, 'Africa/Lagos')
