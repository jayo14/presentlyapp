from django.test import TestCase

from institutions.serializers import VenueSerializer
from system.models import FeatureFlag


class StrictVenuePayloadFeatureFlagTests(TestCase):
    def setUp(self):
        self.boundary = [
            [6.0, 3.0],
            [6.1, 3.1],
            [6.2, 3.2],
            [6.3, 3.3],
        ]

    def test_boundary_limit_not_enforced_when_flag_disabled(self):
        FeatureFlag.objects.create(
            key='strict_venue_payload_validation',
            name='Strict Venue Payload Validation',
            enabled=False,
        )
        FeatureFlag.objects.create(
            key='venue_max_boundary_points',
            name='Venue Max Boundary Points',
            int_value=3,
        )

        serializer = VenueSerializer(data={'name': 'Test Hall', 'boundary_coordinates': self.boundary})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_boundary_limit_enforced_when_flag_enabled(self):
        FeatureFlag.objects.create(
            key='strict_venue_payload_validation',
            name='Strict Venue Payload Validation',
            enabled=True,
        )
        FeatureFlag.objects.create(
            key='venue_max_boundary_points',
            name='Venue Max Boundary Points',
            int_value=3,
        )

        serializer = VenueSerializer(data={'name': 'Test Hall', 'boundary_coordinates': self.boundary})
        self.assertFalse(serializer.is_valid())
        self.assertIn('boundary_coordinates', serializer.errors)

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from institutions.models import User, UserRole

class SystemConfigViewTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='password123',
            full_name='Admin User',
            role=UserRole.ADMIN,
            is_staff=True
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_get_config_includes_pricing_enabled(self):
        url = reverse('config')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('pricing_enabled', response.data)

    def test_patch_config_updates_pricing_enabled(self):
        url = reverse('config')
        # Initial set
        response = self.client.patch(url, {'pricing_enabled': False}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pricing_enabled'], False)

        # Verify in GET
        response = self.client.get(url)
        self.assertEqual(response.data['pricing_enabled'], False)

        # Toggle back
        response = self.client.patch(url, {'pricing_enabled': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pricing_enabled'], True)
