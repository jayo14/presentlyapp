from django.test import TestCase
from .models import CourseTopic, Resource
from institutions.models import Institution, Course, User
import uuid

class ContentModelTest(TestCase):
    def setUp(self):
        self.institution = Institution.objects.create(
            full_name="Test Institution",
            short_name="TI",
            abbreviation="TI-TEST",
            country="Nigeria",
            state_province="Lagos",
            city="Lagos",
            address="Test Address"
        )
        self.course = Course.objects.create(
            code="CS101",
            title="Intro to CS"
        )
        self.user = User.objects.create_user(
            email="test@example.com",
            password="password123",
            full_name="Test User"
        )

    def test_create_topic(self):
        topic = CourseTopic.objects.create(
            course=self.course,
            title="Variables",
            order_index=1
        )
        self.assertEqual(topic.title, "Variables")
        self.assertEqual(topic.course.code, "CS101")

    def test_create_resource(self):
        topic = CourseTopic.objects.create(course=self.course, title="Variables")
        resource = Resource.objects.create(
            topic=topic,
            owner=self.user,
            title="Intro PDF",
            resource_type="PDF"
        )
        self.assertEqual(resource.title, "Intro PDF")
        self.assertEqual(resource.topic.title, "Variables")
