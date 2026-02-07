from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from .views import StudentDashboardAnalyticsView
from institutions.models import User, Course, CourseEnrollment, Institution, College, Department, UserRole


class StudentDashboardAnalyticsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        
        # Setup basic data
        self.institution = Institution.objects.create(
            full_name="Test Uni", short_name="TU", abbreviation="TU",
            country="Test", state_province="Test", city="Test", address="Test"
        )
        self.college = College.objects.create(
            institution=self.institution, name="Test College", code="TC", abbreviation="TC"
        )
        self.department = Department.objects.create(
            college=self.college, institution=self.institution, 
            name="Test Dept", code="TD", abbreviation="TD"
        )
        self.student = User.objects.create_user(
            email="student@test.com", password="password", 
            full_name="Test Student", role=UserRole.STUDENT,
            institution=self.institution, college=self.college
        )
        self.lecturer = User.objects.create_user(
            email="lecturer@test.com", password="password", 
            full_name="Test Lecturer", role=UserRole.LECTURER
        )
        self.course = Course.objects.create(
            code="CS101", title="Test Course", lecturer=self.lecturer
        )
        self.course.department.add(self.department)
        
    def test_student_dashboard_with_enrollment(self):
        """Test that student dashboard correctly handles enrollment with enrolled_at field"""
        # Create an enrollment
        enrollment = CourseEnrollment.objects.create(
            student=self.student,
            course=self.course,
            is_active=True
        )
        
        # Verify enrollment has enrolled_at field
        self.assertIsNotNone(enrollment.enrolled_at)
        
        view = StudentDashboardAnalyticsView.as_view()
        request = self.factory.get('/api/analytics/student/dashboard/')
        force_authenticate(request, user=self.student)
        
        response = view(request)
        
        # Should succeed without AttributeError
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('enrolled_courses', response.data)
        self.assertEqual(len(response.data['enrolled_courses']), 1)
        
        # Check that enrolled_at is properly serialized
        enrolled_course = response.data['enrolled_courses'][0]
        self.assertIn('enrolled_at', enrolled_course)
        self.assertIsNotNone(enrolled_course['enrolled_at'])
    
    def test_student_dashboard_non_student_role(self):
        """Test that non-student users get proper error"""
        view = StudentDashboardAnalyticsView.as_view()
        request = self.factory.get('/api/analytics/student/dashboard/')
        force_authenticate(request, user=self.lecturer)
        
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
