from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import User, Institution, Department, Course, UserRole, College
from notifications.models import Notification, FCMDevice
import uuid

class NotificationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.institution = Institution.objects.create(full_name="Test University", short_name="TU", abbreviation="TU", country="Test", state_province="Test", city="Test", address="Test")
        self.user = User.objects.create_user(
            email="student@test.com",
            password="password123",
            full_name="Test Student",
            role=UserRole.STUDENT,
            institution=self.institution
        )
        self.client.force_authenticate(user=self.user)

    def test_register_fcm_device(self):
        url = reverse('notifications:device-register')
        data = {
            'registration_token': 'test_token',
            'device_type': 'ANDROID',
            'device_name': 'Test Pixel'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FCMDevice.objects.count(), 1)

        # Test idempotency
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FCMDevice.objects.count(), 1)

    def test_notification_list(self):
        Notification.objects.all().delete()
        Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="Test Message",
            notification_type="SYSTEM"
        )
        url = reverse('notifications:notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_mark_as_read(self):
        n = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="Test Message",
            notification_type="SYSTEM"
        )
        url = reverse('notifications:notification-read', args=[n.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        n.refresh_from_db()
        self.assertTrue(n.is_read)

class CourseRegistrationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.institution = Institution.objects.create(full_name="Test Univ", short_name="TU2", abbreviation="TU2", country="Test", state_province="Test", city="Test", address="Test")
        self.college = College.objects.create(name="Eng", code="ENG2", abbreviation="ENG2", institution=self.institution)
        self.department = Department.objects.create(name="CS", code="CS2", abbreviation="CS2", college=self.college, institution=self.institution)

        self.student = User.objects.create_user(
            email="student2@test.com",
            password="password123",
            full_name="Test Student 2",
            role=UserRole.STUDENT,
            institution=self.institution
        )
        self.course = Course.objects.create(code="CS202", title="Intro to CS 2", level="100", semester="FIRST")
        self.course.department.add(self.department)
        self.client.force_authenticate(user=self.student)

    def test_search_course(self):
        url = reverse('course-search')
        response = self.client.get(url, {'code': 'CS202'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_register_course(self):
        # Try manual path if reverse fails or returns wrong url
        url = reverse('course-register', args=[self.course.id])
        response = self.client.post(url)

        if response.status_code != 200:
             print(f"DEBUG: Status {response.status_code}, Error: {response.data}")
             print(f"DEBUG: Student Inst: {self.student.institution}")
             print(f"DEBUG: Course Inst: {self.course.institution}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_enrolled'])

        from institutions.models import CourseEnrollment, AuditLog
        self.assertTrue(CourseEnrollment.objects.filter(student=self.student, course=self.course, is_active=True).exists())
        self.assertTrue(AuditLog.objects.filter(user=self.student, action='COURSE_REGISTRATION').exists())

    def test_drop_course(self):
        from institutions.models import CourseEnrollment
        CourseEnrollment.objects.create(student=self.student, course=self.course, is_active=True)

        url = reverse('course-drop', args=[self.course.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_enrolled'])
        self.assertFalse(CourseEnrollment.objects.get(student=self.student, course=self.course).is_active)
