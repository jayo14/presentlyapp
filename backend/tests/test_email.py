from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from utils import email as email_utils


@override_settings(
    RESEND_API_KEY="re_test",
    DEFAULT_FROM_EMAIL="Presently <noreply@getpresently.com.ng>",
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
            to="student@example.com",
            variables={"first_name": "Ada"},
        )

        payload = mock_send.call_args[0][0]
        self.assertEqual(payload["to"], ["student@example.com"])

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
            to="student@example.com",
            variables={"first_name": "Ada"},
        )

        params = mock_send.call_args[0][0]["params"]
        self.assertIn("year", params)
        self.assertEqual(params["support_url"], "https://getpresently.com.ng/support")
        self.assertEqual(params["privacy_url"], "https://getpresently.com.ng/privacy")
        self.assertEqual(params["institution_url"], "https://getpresently.com.ng")


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
        email_utils.send_welcome_email("a@example.com", "Ada", "https://app/dashboard")
        mock_dispatch.assert_called_once_with(
            template_key="welcome",
            to="a@example.com",
            variables={"first_name": "Ada", "dashboard_url": "https://app/dashboard"},
        )

    @patch("utils.email._dispatch_template_email")
    def test_send_verify_email(self, mock_dispatch):
        email_utils.send_verify_email("a@example.com", "Ada", "123456", 10, "v", "r")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "verify_email")
        self.assertEqual(
            mock_dispatch.call_args.kwargs["variables"],
            {
                "first_name": "Ada",
                "otp_code": "123456",
                "expiry_minutes": 10,
                "verify_url": "v",
                "resend_url": "r",
            },
        )

    @patch("utils.email._dispatch_template_email")
    def test_send_login_alert_email(self, mock_dispatch):
        email_utils.send_login_alert_email("a@example.com", "Ada", "d", "b", "l", "t", "ip", "c", "s")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "login_alert")

    @patch("utils.email._dispatch_template_email")
    def test_send_reset_password_email(self, mock_dispatch):
        email_utils.send_reset_password_email("a@example.com", "Ada", "u", 30, "ip", "browser", "loc")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "reset_password")

    @patch("utils.email._dispatch_template_email")
    def test_send_session_live_email(self, mock_dispatch):
        email_utils.send_session_live_email(["a@example.com"], "Ada", "CSC101", "Course", "Lecturer", "Hall", "10:00", 20, "10:20", "m")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "session_live")

    @patch("utils.email._dispatch_template_email")
    def test_send_newsletter_welcome_email(self, mock_dispatch):
        email_utils.send_newsletter_welcome_email("a@example.com", "Ada", "E1", "T", "E", "u", "d", "un")
        self.assertEqual(mock_dispatch.call_args.kwargs["template_key"], "newsletter_welcome")

    @patch("utils.email._dispatch_template_email")
    def test_send_attendance_confirmed_email(self, mock_dispatch):
        email_utils.send_attendance_confirmed_email(
            "a@example.com",
            "Ada",
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
