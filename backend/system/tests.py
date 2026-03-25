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
