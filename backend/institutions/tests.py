from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from .views import AttendanceSessionViewSet, public_check_in_view
from .models import User, AttendanceSession, Course, Venue, Institution, College, Department, Attendance, UserRole, CourseEnrollment
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
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)
        self.course.department.add(self.department)
        
        self.venue = Venue.objects.create(
            institution=self.institution, name="Test Venue", 
            latitude=10.0, longitude=10.0, gps_radius=50
        )
        
        # Active session
        self.session = AttendanceSession.objects.create(
            course=self.course, venue=self.venue,
            start_time=timezone.now() - datetime.timedelta(minutes=10),
            end_time=timezone.now() + datetime.timedelta(minutes=50),
            is_active=True,
            latitude=10.0, longitude=10.0, location_radius=50
        )

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_success(self, mock_verify):
        # Mock verification to return True
        mock_verify.return_value = (True, 10.0)
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 10.0, 'longitude': 10.0, 'code': self.session.session_code}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)
        self.assertEqual(Attendance.objects.first().status, 'PRESENT')

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_late(self, mock_verify):
        mock_verify.return_value = (True, 10.0)
        
        # Make session started 20 mins ago (late)
        self.session.start_time = timezone.now() - datetime.timedelta(minutes=20)
        self.session.save()
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 10.0, 'longitude': 10.0, 'code': self.session.session_code}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.first().status, 'LATE')

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_location_fail(self, mock_verify):
        # Mock verification to return False (too far)
        mock_verify.return_value = (False, 100.0)
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 11.0, 'longitude': 11.0, 'code': self.session.session_code}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('too far', response.data['error'])
        self.assertEqual(Attendance.objects.count(), 0)

    @patch('institutions.attendance_logic.verify_location')
    def test_duplicate_check_in(self, mock_verify):
        mock_verify.return_value = (True, 10.0)
        # Create existing attendance
        Attendance.objects.create(
            session=self.session,
            student=self.student,
            latitude=10.0,
            longitude=10.0,
            accuracy=10.0,
            location_verified=True
        )
        
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        data = {'latitude': 10.0, 'longitude': 10.0, 'code': self.session.session_code}
        request = self.factory.post(f'/api/sessions/{self.session.id}/check_in/', data)
        force_authenticate(request, user=self.student)
        
        response = view(request, pk=self.session.id)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already checked in', response.data['error'])

    @patch('institutions.attendance_logic.verify_location')
    def test_public_check_in_view(self, mock_verify):
        mock_verify.return_value = (True, 10.0)
        
        request = self.factory.post(f'/api/check-in/{self.session.session_code}/', 
                                   {'latitude': 10.0, 'longitude': 10.0})
        force_authenticate(request, user=self.student)
        
        response = public_check_in_view(request, session_code=self.session.session_code)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_multi_sample_stable(self, mock_verify):
        """Multi-sample stable window should succeed."""
        mock_verify.return_value = (True, 10.0)
        base_ts = 1700000000000
        samples = [
            {'latitude': 10.0, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts + i * 1000}
            for i in range(8)
        ]
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{self.session.id}/check_in/',
            data={'samples': samples, 'code': self.session.session_code},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=self.session.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_rejects_location_jump(self, mock_verify):
        """A sudden jump > 50m between samples should be rejected."""
        mock_verify.return_value = (True, 10.0)
        base_ts = 1700000000000
        # Second sample is ~0.001° lat ≈ ~111m jump
        samples = [
            {'latitude': 10.0, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts},
            {'latitude': 10.001, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts + 1000},
        ]
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{self.session.id}/check_in/',
            data={'samples': samples, 'code': self.session.session_code},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=self.session.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('jump', response.data['error'].lower())

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_rejects_excessive_drift(self, mock_verify):
        """Cumulative drift > 15m from the window start should be rejected."""
        mock_verify.return_value = (True, 10.0)
        base_ts = 1700000000000
        # Drift of ~0.0002° lat per step ≈ 22m total drift after 2 steps
        samples = [
            {'latitude': 10.0, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts},
            {'latitude': 10.0001, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts + 5000},
            {'latitude': 10.0002, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts + 10000},
        ]
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{self.session.id}/check_in/',
            data={'samples': samples, 'code': self.session.session_code},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=self.session.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('drift', response.data['error'].lower())

    @patch('institutions.attendance_logic.verify_location')
    def test_check_in_rejects_high_speed(self, mock_verify):
        """Movement at > 2.5 m/s between samples should be rejected."""
        mock_verify.return_value = (True, 10.0)
        base_ts = 1700000000000
        # 0.00005° lat ≈ 5.5m in 1 second → ~5.5 m/s (exceeds 2.5 m/s)
        samples = [
            {'latitude': 10.0, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts},
            {'latitude': 10.00005, 'longitude': 10.0, 'accuracy': 10, 'timestamp': base_ts + 1000},
        ]
        view = AttendanceSessionViewSet.as_view({'post': 'check_in'})
        request = self.factory.post(
            f'/api/sessions/{self.session.id}/check_in/',
            data={'samples': samples, 'code': self.session.session_code},
            format='json'
        )
        force_authenticate(request, user=self.student)
        response = view(request, pk=self.session.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('speed', response.data['error'].lower())
