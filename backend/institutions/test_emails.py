from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model
from .views import send_verification_email
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from rest_framework.test import APIRequestFactory, force_authenticate
from .views import request_password_reset_view, login_view

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
        # Clear outbox
        mail.outbox = []

        success = send_verification_email(self.user, "123456")

        self.assertTrue(success)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Welcome to Presently - Verify Your Email")
        self.assertIn("123456", mail.outbox[0].alternatives[0][0])
        self.assertEqual(mail.outbox[0].to, [self.user.email])

    def test_request_password_reset_email(self):
        # Clear outbox
        mail.outbox = []

        request = self.factory.post('/api/auth/password-reset/', {'email': self.user.email})
        response = request_password_reset_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Password Reset Request - Presently")
        self.assertIn("Reset Password", mail.outbox[0].alternatives[0][0])

    def test_new_device_alert_email(self):
        # Clear outbox
        mail.outbox = []

        request = self.factory.post('/api/auth/login/', {
            'email': self.user.email,
            'password': 'password123'
        })
        request.META['HTTP_USER_AGENT'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        request.META['REMOTE_ADDR'] = '1.2.3.4'

        response = login_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "New Login Detected - Presently")
        self.assertIn("Mac OS X", mail.outbox[0].alternatives[0][0])
        self.assertIn("1.2.3.4", mail.outbox[0].alternatives[0][0])
