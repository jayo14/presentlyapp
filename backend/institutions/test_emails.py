from django.test import TestCase
from django.contrib.auth import get_user_model
from .views import send_verification_email
from rest_framework.test import APIRequestFactory, force_authenticate
from .views import request_password_reset_view, login_view
from unittest.mock import patch

User = get_user_model()

class EmailTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="password123",
            full_name="Test User"
        )
        self.factory = APIRequestFactory()

    def test_send_verification_email(self):
        with patch("utils.email._dispatch_template_email") as mock_dispatch:
            success = send_verification_email(self.user, "123456")

        self.assertTrue(success)
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "verify_email")

    def test_request_password_reset_email(self):
        with patch("utils.email._dispatch_template_email") as mock_dispatch:
            request = self.factory.post('/api/auth/password-reset/', {'email': self.user.email})
            response = request_password_reset_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "reset_password")

    def test_new_device_alert_email(self):
        with patch("utils.email._dispatch_template_email") as mock_dispatch:
            request = self.factory.post('/api/auth/login/', {
                'email': self.user.email,
                'password': 'password123'
            })
            request.META['HTTP_USER_AGENT'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            request.META['REMOTE_ADDR'] = '1.2.3.4'

            response = login_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "login_alert")
