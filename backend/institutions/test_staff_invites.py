from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from institutions.models import StaffInvitation, UserRole


@override_settings(FRONTEND_URL='https://getpresently.com.ng', STAFF_INVITE_EXPIRY_HOURS=48)
class StaffInviteEmailFlowTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.admin = self.user_model.objects.create_user(
            email='admin@example.com',
            password='StrongPass123!',
            full_name='Admin User',
            role=UserRole.ADMIN,
            onboarding_complete=True,
            email_verified=True,
        )
        self.client.force_authenticate(user=self.admin)

    @patch('institutions.staff_views.send_welcome_email')
    @patch('institutions.staff_views.send_staff_access_invitation_email')
    def test_staff_invite_uses_staff_access_template(self, mock_staff_invite, mock_welcome):
        payload = {
            'email': 'staff1@example.com',
            'full_name': 'Staff One',
            'permissions': ['system.analytics.view'],
        }

        response = self.client.post('/api/staff/invitations/invite/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(StaffInvitation.objects.filter(email='staff1@example.com').exists())
        mock_staff_invite.assert_called_once()
        mock_welcome.assert_not_called()

    @patch('institutions.staff_views.send_welcome_email')
    @patch('institutions.staff_views.send_staff_access_invitation_email')
    def test_staff_invite_falls_back_to_welcome_on_template_failure(self, mock_staff_invite, mock_welcome):
        mock_staff_invite.side_effect = Exception('template unavailable')

        payload = {
            'email': 'staff2@example.com',
            'full_name': 'Staff Two',
            'permissions': ['system.analytics.view'],
        }

        response = self.client.post('/api/staff/invitations/invite/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_staff_invite.assert_called_once()
        mock_welcome.assert_called_once()
