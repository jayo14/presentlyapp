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


# ---------------------------------------------------------------------------
# Venue display field tests
# ---------------------------------------------------------------------------

class VenueDisplayFieldTests(TestCase):
    """Ensure the new venue_color, venue_opacity and border_width fields work."""

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.create_user(
            email="admin@test.com", password="password", full_name="Admin User", role=UserRole.ADMIN
        )
        self.institution = Institution.objects.create(
            full_name="Test Uni", short_name="TU", abbreviation="TU",
            country="Test", state_province="Test", city="Test", address="Test"
        )

    def _venue_view(self):
        from .views import VenueViewSet
        return VenueViewSet.as_view({'post': 'create', 'get': 'retrieve', 'patch': 'partial_update'})

    def test_create_venue_with_display_fields(self):
        from .views import VenueViewSet
        view = VenueViewSet.as_view({'post': 'create'})
        data = {
            'institution': self.institution.id,
            'name': 'Test Hall',
            'code': 'TH-01',
            'latitude': 10.0,
            'longitude': 10.0,
            'venue_color': '#10b981',
            'venue_opacity': 0.3,
            'border_width': 3,
        }
        request = self.factory.post('/api/venues/', data, format='json')
        force_authenticate(request, user=self.admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['venue_color'], '#10b981')
        self.assertAlmostEqual(float(response.data['venue_opacity']), 0.3, places=4)
        self.assertEqual(response.data['border_width'], 3)

    def test_venue_display_fields_have_defaults(self):
        from .views import VenueViewSet
        view = VenueViewSet.as_view({'post': 'create'})
        data = {
            'institution': self.institution.id,
            'name': 'Default Hall',
            'code': 'DH-01',
            'latitude': 10.0,
            'longitude': 10.0,
        }
        request = self.factory.post('/api/venues/', data, format='json')
        force_authenticate(request, user=self.admin)
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['venue_color'], '#6366f1')
        self.assertAlmostEqual(float(response.data['venue_opacity']), 0.15, places=4)
        self.assertEqual(response.data['border_width'], 2)


# ---------------------------------------------------------------------------
# Geolocation utility tests (point-in-polygon and radius validation)
# ---------------------------------------------------------------------------

class GeolocationUtilsTests(TestCase):
    """Test the geolocation_utils helpers used for attendance location validation."""

    def setUp(self):
        from .geolocation_utils import point_in_polygon, calculate_distance, verify_location
        self.point_in_polygon = point_in_polygon
        self.calculate_distance = calculate_distance
        self.verify_location = verify_location

        # Simple square polygon centred at (10, 10): 0.001° ≈ 111 m sides.
        # geolocation_utils.point_in_polygon expects coordinates as [lng, lat]
        # (GeoJSON convention), which matches how MapLibre stores them after the
        # frontend converts from the backend's [lat, lng] storage format.
        self.square = [
            [9.999, 9.999],
            [10.001, 9.999],
            [10.001, 10.001],
            [9.999, 10.001],
            [9.999, 9.999],
        ]

    # --- pointInPolygon --------------------------------------------------

    def test_point_inside_polygon(self):
        """Centre of the square should be detected as inside."""
        self.assertTrue(self.point_in_polygon((10.0, 10.0), self.square))

    def test_point_outside_polygon(self):
        """A clearly distant point should be outside."""
        self.assertFalse(self.point_in_polygon((11.0, 11.0), self.square))

    def test_point_on_boundary_edge(self):
        """A point very close to the boundary is treated as outside by strict algorithm."""
        # Just slightly outside
        self.assertFalse(self.point_in_polygon((10.002, 10.0), self.square))

    def test_empty_polygon_returns_false(self):
        self.assertFalse(self.point_in_polygon((10.0, 10.0), []))

    def test_polygon_too_few_points_returns_false(self):
        self.assertFalse(self.point_in_polygon((10.0, 10.0), [[10.0, 10.0], [10.1, 10.1]]))

    # --- calculateDistance -----------------------------------------------

    def test_same_point_distance_is_zero(self):
        d = self.calculate_distance(10.0, 10.0, 10.0, 10.0)
        self.assertAlmostEqual(d, 0.0, places=2)

    def test_known_distance(self):
        """0.001° latitude ≈ 111 m."""
        d = self.calculate_distance(10.0, 10.0, 10.001, 10.0)
        self.assertGreater(d, 100)
        self.assertLess(d, 120)

    # --- verifyLocation --------------------------------------------------

    def test_verify_location_inside_polygon(self):
        is_inside, dist = self.verify_location(
            10.0, 10.0, None,
            10.0, 10.0, None,
            self.square, 50
        )
        self.assertTrue(is_inside)

    def test_verify_location_outside_polygon(self):
        is_inside, dist = self.verify_location(
            11.0, 11.0, None,
            10.0, 10.0, None,
            self.square, 50
        )
        self.assertFalse(is_inside)

    def test_verify_location_inside_radius(self):
        """Student within 50 m of centre, no polygon → True."""
        is_inside, dist = self.verify_location(
            10.0, 10.0, None,
            10.0, 10.0, None,
            None, 50
        )
        self.assertTrue(is_inside)
        self.assertAlmostEqual(dist, 0.0, places=1)

    def test_verify_location_outside_radius(self):
        """Student ~156 m away, 50 m radius → False."""
        is_inside, dist = self.verify_location(
            10.0014, 10.0, None,   # ~156 m north
            10.0, 10.0, None,
            None, 50
        )
        self.assertFalse(is_inside)
        self.assertGreater(dist, 50)
