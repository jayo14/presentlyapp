from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from institutions.models import User, UserRole
from .models import FeatureFlag, SystemMetricsSnapshot
from .views import AdminDashboardView, SystemHealthView
from institutions.serializers import VenueSerializer


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


class SystemHealthEndpointTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin = User.objects.create_user(
            email='admin@test.com',
            password='password',
            full_name='Test Admin',
            role=UserRole.ADMIN,
        )

    def test_health_endpoint_returns_latest_snapshot(self):
        SystemMetricsSnapshot.objects.create(
            uptime_seconds=3600,
            db_latency_ms=14.5,
            active_django_sessions=7,
            storage_used_pct=41.2,
            notification_queue=3,
            emails_sent_today=18,
        )
        latest = SystemMetricsSnapshot.objects.create(
            uptime_seconds=86400,
            db_latency_ms=8.75,
            active_django_sessions=23,
            storage_used_pct=55.5,
            notification_queue=11,
            emails_sent_today=42,
        )

        request = self.factory.get('/api/system/health/')
        force_authenticate(request, user=self.admin)

        response = SystemHealthView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['platform_health']['realtime_connections'], latest.active_django_sessions)
        self.assertEqual(response.data['platform_health']['notification_queue'], latest.notification_queue)
        self.assertEqual(response.data['platform_health']['emails_sent_today'], latest.emails_sent_today)
        self.assertEqual(response.data['platform_health']['db_latency_ms'], latest.db_latency_ms)
        self.assertEqual(response.data['platform_health']['storage_used_pct'], latest.storage_used_pct)
        self.assertEqual(response.data['latest_snapshot']['id'], latest.id)

    def test_dashboard_platform_health_uses_latest_snapshot(self):
        latest = SystemMetricsSnapshot.objects.create(
            uptime_seconds=43200,
            db_latency_ms=6.25,
            active_django_sessions=19,
            storage_used_pct=62.4,
            notification_queue=9,
            emails_sent_today=27,
        )

        request = self.factory.get('/api/system/dashboard/')
        force_authenticate(request, user=self.admin)

        response = AdminDashboardView.as_view()(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['platform_health']['realtime_connections'], latest.active_django_sessions)
        self.assertEqual(response.data['platform_health']['notification_queue'], latest.notification_queue)
        self.assertEqual(response.data['platform_health']['emails_sent_today'], latest.emails_sent_today)
        self.assertEqual(response.data['platform_health']['db_latency_ms'], latest.db_latency_ms)
        self.assertEqual(response.data['platform_health']['storage_used_pct'], latest.storage_used_pct)
