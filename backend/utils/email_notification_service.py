import logging
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _send_smtp_email(
    *,
    to_email: str,
    subject: str,
    template_name: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
    html_content: Optional[str] = None,
) -> bool:
    """Send an email using Django's SMTP backend."""
    try:
        if html_content is None:
            if not template_name:
                raise ValueError("template_name is required when html_content is not provided")
            html_content = render_to_string(template_name, context or {})

        text_content = strip_tags(html_content)
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        message.attach_alternative(html_content, "text/html")
        message.send(fail_silently=False)
        return True
    except Exception as exc:
        logger.error("SMTP email failed for %s: %s", to_email, exc, exc_info=True)
        return False


class EmailNotificationService:
    """Service for sending email notifications via SMTP."""

    @staticmethod
    def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send email verification OTP notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject="Welcome to Presently - Verify Your Email",
            template_name="emails/welcome_otp.html",
            context={"user": {"full_name": user_name}, "otp_code": otp_code},
        )

    @staticmethod
    def send_otp_resend(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send OTP resend notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject="Your New Verification Code - Presently",
            template_name="emails/welcome_otp.html",
            context={"user": {"full_name": user_name}, "otp_code": otp_code},
        )

    @staticmethod
    def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
        """Send password reset email notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject="Password Reset Request - Presently",
            template_name="emails/password_reset.html",
            context={"user": {"full_name": user_name}, "reset_link": reset_link},
        )

    @staticmethod
    def send_password_reset_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send password reset OTP verification notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject="Password Reset Verification Code - Presently",
            template_name="emails/welcome_otp.html",
            context={"user": {"full_name": user_name}, "otp_code": otp_code},
        )

    @staticmethod
    def send_new_device_alert(
        user_id: str,
        user_email: str,
        user_name: str,
        device_info: Dict[str, Any],
        ip_address: str,
    ) -> bool:
        """Send new device login alert notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject="New Login Detected - Presently",
            template_name="emails/new_device_alert.html",
            context={
                "user": {"full_name": user_name},
                "device_type": device_info.get("device_type", "Unknown"),
                "device_name": device_info.get("device_name", "Unknown"),
                "browser": device_info.get("browser", "Unknown"),
                "os": device_info.get("os", "Unknown"),
                "ip_address": ip_address,
                "login_time": device_info.get("login_time", ""),
            },
        )

    @staticmethod
    def send_user_invitation(
        user_email: str,
        user_name: str,
        inviter_name: str,
        invitation_link: str,
        institution_name: str,
    ) -> bool:
        """Send user invitation email notification."""
        invitation_html = (
            "<html><body>"
            f"<p>Hello {user_name},</p>"
            f"<p>{inviter_name} invited you to join <strong>{institution_name}</strong> on Presently.</p>"
            f"<p><a href=\"{invitation_link}\">Accept Invitation</a></p>"
            "<p>If the button does not work, copy this link into your browser:</p>"
            f"<p>{invitation_link}</p>"
            "</body></html>"
        )
        return _send_smtp_email(
            to_email=user_email,
            subject=f"You're Invited to Join {institution_name} on Presently",
            html_content=invitation_html,
        )

    @staticmethod
    def send_bulk_notification(
        notification_type: str,
        recipients: List[Dict[str, str]],
        payload: Dict[str, Any],
    ) -> bool:
        """Send bulk notifications to multiple users via email."""
        results = [
            _send_smtp_email(
                to_email=r.get("email", ""),
                subject=f"Notification: {notification_type}",
                html_content=f"<html><body><p>Notification {notification_type}</p><p>{payload}</p></body></html>",
            )
            for r in recipients
        ]
        return all(results)

    @staticmethod
    def is_available() -> bool:
        """Check if email notification service is available."""
        return True


def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
    return EmailNotificationService.send_email_verification_otp(user_id, user_email, user_name, otp_code)


def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
    return EmailNotificationService.send_password_reset(user_id, user_email, user_name, reset_link)


def send_new_device_alert(
    user_id: str,
    user_email: str,
    user_name: str,
    device_info: Dict[str, Any],
    ip_address: str,
) -> bool:
    return EmailNotificationService.send_new_device_alert(user_id, user_email, user_name, device_info, ip_address)


def send_user_invitation(
    user_email: str,
    user_name: str,
    inviter_name: str,
    invitation_link: str,
    institution_name: str,
) -> bool:
    return EmailNotificationService.send_user_invitation(
        user_email,
        user_name,
        inviter_name,
        invitation_link,
        institution_name,
    )