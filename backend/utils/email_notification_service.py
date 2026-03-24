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
            template_name="emails/password_reset_otp.html",
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
        return _send_smtp_email(
            to_email=user_email,
            subject=f"You're Invited to Join {institution_name} on Presently",
            template_name="emails/user_invitation.html",
            context={
                "user_name": user_name,
                "inviter_name": inviter_name,
                "invitation_link": invitation_link,
                "institution_name": institution_name,
            },
        )

    @staticmethod
    def send_attendance_session_created(
        user_email: str,
        user_name: str,
        course_code: str,
        course_name: str,
        start_time: str,
        end_time: str,
        venue_name: str,
    ) -> bool:
        """Send attendance session created notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject=f"New Session Started: {course_code} - {course_name}",
            template_name="emails/attendance_session_created.html",
            context={
                "user_name": user_name,
                "course_code": course_code,
                "course_name": course_name,
                "start_time": start_time,
                "end_time": end_time,
                "venue_name": venue_name,
                "dashboard_url": f"{settings.FRONTEND_URL}/dashboard",
            },
        )

    @staticmethod
    def send_attendance_marked(
        user_email: str,
        user_name: str,
        course_code: str,
        course_name: str,
        attendance_status: str,
        check_in_time: str,
    ) -> bool:
        """Send attendance marked confirmation notification."""
        return _send_smtp_email(
            to_email=user_email,
            subject=f"Attendance Confirmed: {course_code}",
            template_name="emails/attendance_marked.html",
            context={
                "user_name": user_name,
                "course_code": course_code,
                "course_name": course_name,
                "attendance_status": attendance_status,
                "check_in_time": check_in_time,
            },
        )

    @staticmethod
    def send_bulk_notification(
        notification_type: str,
        recipients: List[Dict[str, str]],
        payload: Dict[str, Any],
    ) -> bool:
        """Send bulk notifications to multiple users via email."""
        # For bulk, we'll use a simple fallback for now but could be expanded to use a generic template
        results = [
            _send_smtp_email(
                to_email=r.get("email", ""),
                subject=f"Notification: {notification_type}",
                html_content=f"<html><body style='font-family:Lexend,sans-serif;padding:32px;background:#fdfcf7;'><div style='background:white;padding:32px;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);'><h2 style='color:#0f172a;'>{notification_type}</h2><p style='color:#475569;'>{payload.get('message', '')}</p></div></body></html>",
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


def send_attendance_session_created(
    user_email: str,
    user_name: str,
    course_code: str,
    course_name: str,
    start_time: str,
    end_time: str,
    venue_name: str,
) -> bool:
    return EmailNotificationService.send_attendance_session_created(
        user_email, user_name, course_code, course_name, start_time, end_time, venue_name
    )


def send_attendance_marked(
    user_email: str,
    user_name: str,
    course_code: str,
    course_name: str,
    attendance_status: str,
    check_in_time: str,
) -> bool:
    return EmailNotificationService.send_attendance_marked(
        user_email, user_name, course_code, course_name, attendance_status, check_in_time
    )