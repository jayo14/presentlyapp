from django.test import TestCase
from django.contrib.auth import get_user_model
from .serializers import OnboardingSerializer
from .models import UserRole

User = get_user_model()

class OnboardingSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            full_name='Test User'
        )

    def test_onboarding_serializer_long_avatar_url(self):
        """Test that OnboardingSerializer accepts an avatar_url longer than 200 characters"""
        long_url = "https://example.com/" + "a" * 300
        data = {
            'avatar_url': long_url,
            'role': UserRole.STUDENT,
            'phone_number': '+2348000000000',
            'onboarding_complete': True
        }
        serializer = OnboardingSerializer(instance=self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.avatar_url, long_url)
        self.assertEqual(len(user.avatar_url), 320)
