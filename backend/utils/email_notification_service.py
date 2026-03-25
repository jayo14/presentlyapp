from typing import Any, Dict, List

from django.conf import settings

from utils.email import (
    send_attendance_confirmed_email,
    send_login_alert_email,
    send_newsletter_welcome_email,
    send_reset_password_email,
    send_session_live_email,
    send_verify_email,
    send_welcome_email,
)


class EmailNotificationService:
    """Backward-compatible wrappers around the Resend template email helpers."""

    @staticmethod
    def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        send_verify_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            otp_code=otp_code,
            expiry_minutes=10,
            verify_url=f"{settings.FRONTEND_URL}/verify-email",
            resend_url=f"{settings.FRONTEND_URL}/resend-otp",
        )
        return True

    @staticmethod
    def send_otp_resend(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        return EmailNotificationService.send_email_verification_otp(user_id, user_email, user_name, otp_code)

    @staticmethod
    def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
        send_reset_password_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            reset_url=reset_link,
            expiry_minutes=30,
            request_ip="",
            request_browser="",
            request_location="",
        )
        return True

    @staticmethod
    def send_password_reset_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        send_verify_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            otp_code=otp_code,
            expiry_minutes=10,
            verify_url=f"{settings.FRONTEND_URL}/reset-password",
            resend_url=f"{settings.FRONTEND_URL}/forgot-password",
        )
        return True

    @staticmethod
    def send_new_device_alert(
        user_id: str,
        user_email: str,
        user_name: str,
        device_info: Dict[str, Any],
        ip_address: str,
    ) -> bool:
        send_login_alert_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            device_name=device_info.get("device_name", "Unknown Device"),
            browser_name=device_info.get("browser", "Unknown Browser"),
            login_location=ip_address,
            login_time=device_info.get("login_time", ""),
            ip_address=ip_address,
            confirm_url=f"{settings.FRONTEND_URL}/security/devices",
            secure_url=f"{settings.FRONTEND_URL}/security",
        )
        return True

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
        send_session_live_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            course_code=course_code,
            course_name=course_name,
            lecturer_name="Lecturer",
            room_location=venue_name,
            session_time=start_time,
            minutes_remaining=0,
            closes_at=end_time,
            mark_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        return True

    @staticmethod
    def send_attendance_marked(
        user_email: str,
        user_name: str,
        course_code: str,
        course_name: str,
        attendance_status: str,
        check_in_time: str,
    ) -> bool:
        send_attendance_confirmed_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            course_code=course_code,
            course_name=course_name,
            arrival_time=check_in_time,
            check_in_method=attendance_status,
            location_label="Campus",
            streak_label="Attendance",
            streak_message="Attendance has been recorded.",
            streak_percent=0,
            history_url=f"{settings.FRONTEND_URL}/attendance/history",
            report_url=f"{settings.FRONTEND_URL}/attendance/report",
        )
        return True

    @staticmethod
    def send_bulk_notification(
        notification_type: str,
        recipients: List[Dict[str, str]],
        payload: Dict[str, Any],
    ) -> bool:
        for recipient in recipients:
            send_newsletter_welcome_email(
                to=recipient.get("email", ""),
                first_name=recipient.get("name", "Student").split(" ")[0],
                edition_label=notification_type,
                featured_title=payload.get("action_text", "Notification"),
                featured_excerpt=payload.get("message", ""),
                featured_url=payload.get("action_url", f"{settings.FRONTEND_URL}/dashboard"),
                dashboard_url=f"{settings.FRONTEND_URL}/dashboard",
                unsubscribe_url=f"{settings.FRONTEND_URL}/unsubscribe",
            )
        return True

    @staticmethod
    def send_user_invitation(
        user_email: str,
        user_name: str,
        inviter_name: str,
        invitation_link: str,
        institution_name: str,
    ) -> bool:
        send_welcome_email(
            to=user_email,
            first_name=user_name.split(" ")[0],
            dashboard_url=invitation_link,
        )
        return True

    @staticmethod
    def is_available() -> bool:
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
