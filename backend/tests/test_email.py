import os
import sys
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "presently.settings")

import django
django.setup()

from django.test import SimpleTestCase, override_settings

from utils import email as email_utils


@override_settings(
    RESEND_API_KEY="re_test",
    DEFAULT_FROM_EMAIL="noreply@getpresently.com.ng",
    FRONTEND_URL="https://getpresently.com.ng",
    SUPPORT_URL="https://getpresently.com.ng/support",
    PRIVACY_URL="https://getpresently.com.ng/privacy",
    INSTITUTION_URL="https://getpresently.com.ng",
    RESEND_TEMPLATES={
        "welcome": "tmpl_welcome",
        "verify_email": "tmpl_verify",
        "login_alert": "tmpl_login",
        "reset_password": "tmpl_reset",
        "session_live": "tmpl_session",
        "newsletter_welcome": "tmpl_newsletter",
        "attendance_confirmed": "tmpl_attendance",
    },
)
class SendTemplateEmailTests(SimpleTestCase):
    @patch("utils.email.resend.Emails.send")
    def test_string_recipient_converted_to_list(self, mock_send):
        mock_send.return_value = {"id": "email_123"}

        email_utils.send_template_email(
            template_key="welcome",
            to="ayobamidayo2007@gmail.com",
            variables={"first_name": "John"},
        )

        payload = mock_send.call_args[0][0]
        self.assertEqual(payload["to"], ["ayobamidayo2007@gmail.com"])

    def test_invalid_template_key_raises_value_error(self):
        with self.assertRaises(ValueError):
            email_utils.send_template_email(
                template_key="missing",
                to="student@example.com",
                variables={"first_name": "Ada"},
            )

    @patch("utils.email.resend.Emails.send")
    def test_default_params_are_injected(self, mock_send):
        mock_send.return_value = {"id": "email_123"}

        email_utils.send_template_email(
            template_key="welcome",
            to="ayobamidayo2007@gmail.com",
            variables={"first_name": "John"},
        )

        params = mock_send.call_args[0][0]["params"]
        self.assertIn("year", params)
        self.assertEqual(params["support_url"], "https://getpresently.com.ng/support")
        self.assertEqual(params["privacy_url"], "https://getpresently.com.ng/privacy")
        self.assertEqual(params["institution_url"], "https://getpresently.com.ng")

    @patch("utils.email.resend.Emails.send")
    def test_retries_with_compat_template_payload(self, mock_send):
        mock_send.side_effect = [
            Exception("Missing `html` or `text` field."),
            {"id": "email_compat"},
        ]

        result = email_utils.send_template_email(
            template_key="welcome",
            to="ayobamidayo2007@gmail.com",
            variables={"first_name": "John"},
        )

        self.assertEqual(result, {"id": "email_compat"})
        self.assertEqual(mock_send.call_count, 2)
        compat_payload = mock_send.call_args_list[1][0][0]
        self.assertIn("template", compat_payload)
        self.assertEqual(compat_payload["template"]["id"], "tmpl_welcome")
        self.assertIn("variables", compat_payload["template"])


@override_settings(
    RESEND_TEMPLATES={
        "welcome": "tmpl_welcome",
        "verify_email": "tmpl_verify",
        "login_alert": "tmpl_login",
        "reset_password": "tmpl_reset",
        "session_live": "tmpl_session",
        "newsletter_welcome": "tmpl_newsletter",
        "attendance_confirmed": "tmpl_attendance",
    }
)
class EmailHelperTests(SimpleTestCase):
    @patch("utils.email._dispatch_template_email")
    def test_send_welcome_email(self, mock_dispatch):
        email_utils.send_welcome_email("ayobamidayo2007@gmail.com", "John", "https://app/dashboard")
        mock_dispatch.assert_called_once_with(
            template_key="welcome",
            to="ayobamidayo2007@gmail.com",
            variables={"first_name": "John", "dashboard_url": "https://app/dashboard"},
        )

    @patch("utils.email._dispatch_template_email")
    def test_send_verify_email(self, mock_dispatch):
        email_utils.send_verify_email("ayobamidayo2007@gmail.com", "John", "123456", 10, "v", "r")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "verify_email")
        self.assertEqual(
            mock_dispatch.call_args.kwargs["variables"],
            {
                "first_name": "John",
                "otp_code": "123456",
                "expiry_minutes": 10,
                "verify_url": "v",
                "resend_url": "r",
            },
        )

    @patch("utils.email._dispatch_template_email")
    def test_send_login_alert_email(self, mock_dispatch):
        email_utils.send_login_alert_email("ayobamidayo2007@gmail.com", "John", "d", "b", "l", "t", "ip", "c", "s")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "login_alert")

    @patch("utils.email._dispatch_template_email")
    def test_send_reset_password_email(self, mock_dispatch):
        email_utils.send_reset_password_email("ayobamidayo2007@gmail.com", "John", "u", 30, "ip", "browser", "loc")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "reset_password")

    @patch("utils.email._dispatch_template_email")
    def test_send_session_live_email(self, mock_dispatch):
        email_utils.send_session_live_email(["ayobamidayo2007@gmail.com"], "John", "CSC101", "Course", "Lecturer", "Hall", "10:00", 20, "10:20", "m")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "session_live")

    @patch("utils.email._dispatch_template_email")
    def test_send_newsletter_welcome_email(self, mock_dispatch):
        email_utils.send_newsletter_welcome_email("ayobamidayo2007@gmail.com", "John", "E1", "T", "E", "u", "d", "un")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "newsletter_welcome")

    @patch("utils.email._dispatch_template_email")
    def test_send_attendance_confirmed_email(self, mock_dispatch):
        email_utils.send_attendance_confirmed_email(
            "ayobamidayo2007@gmail.com",
            "John",
            "CSC101",
            "Course",
            "10:01",
            "QR",
            "Hall",
            "Week 2",
            "Great",
            82,
            "h",
            "r",
        )
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "attendance_confirmed")


@override_settings(
    RESEND_TEMPLATES={
        "welcome": "tmpl_welcome",
    },
)
class EmailDispatchTests(SimpleTestCase):
    @patch("utils.email.send_template_email")
    def test_dispatch_sends_synchronously(self, mock_send_template_email):
        mock_send_template_email.return_value = {"id": "email_sync"}

        result = email_utils.send_welcome_email("ayobamidayo2007@gmail.com", "John", "https://app/dashboard")

        self.assertEqual(result, {"id": "email_sync"})
        mock_send_template_email.assert_called_once()
