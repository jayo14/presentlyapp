import logging
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

import requests

def _send_resend_template_email(
    *,
    to_email: str,
    subject: str,
    template_name: str,
    variables: Optional[Dict[str, Any]] = None,
) -> bool:
    """Send an email using Resend API directly (ensuring template support)."""
    try:
        template_id = getattr(settings, 'RESEND_TEMPLATE_MAP', {}).get(template_name)
        api_key = getattr(settings, 'RESEND_API_KEY', None)

        if settings.DEBUG or not api_key:
            logger.info("DEBUG: Email to %s via template %s", to_email, template_id or template_name)
            message = EmailMultiAlternatives(
                subject=subject,
                body=f"E-mail to {to_email} via Resend Template: {template_id or template_name}\nVars: {variables}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email],
            )
            message.send(fail_silently=False)
            return True

        # Call Resend REST API directly to ensure template_id support
        url = "https://api.resend.com/emails"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "template": {
                "id": template_id,
                "variables": variables or {}
            }
        }

        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201, 202]:
            logger.info("Resend Template email sent to %s, res: %s", to_email, response.json())
            return True
        else:
            logger.error("Resend API error (%s): %s", response.status_code, response.text)
            return False

    except Exception as exc:
        logger.error("Template sending failed for %s: %s", to_email, exc, exc_info=True)
        return False


class EmailNotificationService:
    """Service for sending email notifications solely via Resend Hosted Templates."""

    @staticmethod
    def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send email verification OTP notification using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject="Welcome to Presently - Verify Your Email",
            template_name="emails/welcome_otp.html",
            variables={
                "first_name": user_name.split(' ')[0], 
                "otp_code": otp_code,
                "expiry_minutes": "10",
                "verify_url": f"{settings.FRONTEND_URL}/verify-email"
            },
        )

    @staticmethod
    def send_otp_resend(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send OTP resend notification using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject="Your New Verification Code - Presently",
            template_name="emails/welcome_otp.html",
            variables={
                "first_name": user_name.split(' ')[0], 
                "otp_code": otp_code,
                "expiry_minutes": "10",
                "resend_url": f"{settings.FRONTEND_URL}/resend-otp"
            },
        )

    @staticmethod
    def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
        """Send password reset email notification using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject="Password Reset Request - Presently",
            template_name="emails/password_reset.html",
            variables={
                "first_name": user_name.split(' ')[0], 
                "reset_link": reset_link
            },
        )

    @staticmethod
    def send_password_reset_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send password reset OTP notification using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject="Password Reset Verification Code - Presently",
            template_name="emails/password_reset_otp.html",
            variables={
                "first_name": user_name.split(' ')[0], 
                "otp_code": otp_code
            },
        )

    @staticmethod
    def send_new_device_alert(
        user_id: str,
        user_email: str,
        user_name: str,
        device_info: Dict[str, Any],
        ip_address: str,
    ) -> bool:
        """Send new device login alert using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject="New Login Detected - Presently",
            template_name="emails/new_device_alert.html",
            variables={
                "first_name": user_name.split(' ')[0],
                "device_name": device_info.get("device_name", "Unknown Device"),
                "browser": device_info.get("browser", "Unknown"),
                "os": device_info.get("os", "Unknown"),
                "ip_address": ip_address,
                "login_time": device_info.get("login_time", "Just now"),
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
        """Send attendance session created alert using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject=f"New Session Started: {course_code}",
            template_name="emails/attendance_session_created.html",
            variables={
                "first_name": user_name.split(' ')[0],
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
        """Send attendance marked confirmation using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject=f"Attendance Confirmed: {course_code}",
            template_name="emails/attendance_marked.html",
            variables={
                "first_name": user_name.split(' ')[0],
                "course_code": course_code,
                "course_name": course_name,
                "attendance_status": attendance_status,
                "check_in_time": check_in_time,
                "dashboard_url": f"{settings.FRONTEND_URL}/dashboard",
            },
        )

    @staticmethod
    def send_bulk_notification(
        notification_type: str,
        recipients: List[Dict[str, str]],
        payload: Dict[str, Any],
    ) -> bool:
        """Bulk sending using Resend Templates."""
        # Note: Resend bulk API is better for production, but for now we loop
        results = [
            _send_resend_template_email(
                to_email=r.get("email", ""),
                subject=f"Notification: {notification_type}",
                template_name="emails/notification_generic.html",
                variables={
                    "first_name": r.get("name", "Student").split(' ')[0],
                    "notification_type": notification_type,
                    "message": payload.get("message", ""),
                    "action_url": payload.get("action_url"),
                    "action_text": payload.get("action_text"),
                },
            )
            for r in recipients
        ]
        return all(results)

    @staticmethod
    def send_user_invitation(
        user_email: str,
        user_name: str,
        inviter_name: str,
        invitation_link: str,
        institution_name: str,
    ) -> bool:
        """Send user invitation email notification using Resend Template."""
        return _send_resend_template_email(
            to_email=user_email,
            subject=f"You're Invited to Join {institution_name} on Presently",
            template_name="emails/user_invitation.html",
            variables={
                "first_name": user_name.split(' ')[0],
                "inviter_name": inviter_name,
                "invitation_link": invitation_link,
                "institution_name": institution_name,
            },
        )

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
