from django.test import TestCase
from django.utils import timezone
from django.contrib.gis.geos import Point
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from .views import AttendanceSessionViewSet, public_check_in_view
from .models import User, AttendanceSession, Course, Venue, Institution, College, Department, Attendance, UserRole
from unittest.mock import patch, MagicMock
import datetime

class CheckInTests(TestCase):
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
            email="student@test.com", password="password", full_name="Test Student", role=UserRole.STUDENT
        )
        self.lecturer = User.objects.create_user(
            email="lecturer@test.com", password="password", full_name="Test Lecturer", role=UserRole.LECTURER
        )
        self.course = Course.objects.create(
            code="CS101", title="Test Course", lecturer=self.lecturer
        )
        self.course.department.add(self.department)
        
        self.venue = Venue.objects.create(
            institution=self.institution, name="Test Venue", 
            location=Point(10.0, 10.0), gps_radius=50
        )
        
        # Active session
        self.session = AttendanceSession.objects.create(
            course=self.course, venue=self.venue,
            start_time=timezone.now() - datetime.timedelta(minutes=10),
            end_time=timezone.now() + datetime.timedelta(minutes=50),
            is_active=True,
            latitude=10.0, longitude=10.0, location_radius=50
        )

    @patch('institutions.views.verify_location')
    def test_check_in_success(self, mock_verify):
        # Mock verification to return True
        mock_verify.return_value = (True, 10.0)
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 10.0, 'longitude': 10.0}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)
        self.assertEqual(Attendance.objects.first().status, 'PRESENT')

    @patch('institutions.views.verify_location')
    def test_check_in_late(self, mock_verify):
        mock_verify.return_value = (True, 10.0)
        
        # Make session started 20 mins ago (late)
        self.session.start_time = timezone.now() - datetime.timedelta(minutes=20)
        self.session.save()
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 10.0, 'longitude': 10.0}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.first().status, 'LATE')

    @patch('institutions.views.verify_location')
    def test_check_in_location_fail(self, mock_verify):
        # Mock verification to return False (too far)
        mock_verify.return_value = (False, 100.0)
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 11.0, 'longitude': 11.0}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('too far', response.data['error'])
        self.assertEqual(Attendance.objects.count(), 0)

    def test_duplicate_check_in(self):
        # Create existing attendance
        Attendance.objects.create(session=self.session, student=self.student)
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/')
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already checked in', response.data['error'])

    @patch('institutions.views.verify_location')
    def test_public_check_in_view(self, mock_verify):
        mock_verify.return_value = (True, 10.0)
        
        request = self.factory.post(f'/api/check-in/{self.session.session_code}/', 
                                   {'latitude': 10.0, 'longitude': 10.0})
        force_authenticate(request, user=self.student)
        
        response = public_check_in_view(request, session_code=self.session.session_code)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)