import datetime
import logging
from typing import Any

from django.conf import settings
from presently.email_failover import send_templated_email_with_failover

logger = logging.getLogger(__name__)


def _default_template_params() -> dict[str, str]:
    frontend_url = getattr(settings, "FRONTEND_URL", "https://getpresently.com.ng")
    return {
        "year": str(datetime.date.today().year),
        "support_url": getattr(settings, "SUPPORT_URL", f"{frontend_url}/support"),
        "privacy_url": getattr(settings, "PRIVACY_URL", f"{frontend_url}/privacy"),
        "institution_url": getattr(settings, "INSTITUTION_URL", frontend_url),
    }


def send_template_email(
    template_key: str,
    to: str | list[str],
    variables: dict[str, Any],
    subject: str | None = None,
    from_email: str | None = None,
    raise_on_error: bool = False,
) -> dict:
    """
    Sends an email using the multi-provider failover sender.
    Returns a standardized send result dictionary.
    """
    recipients = [to] if isinstance(to, str) else list(to)
    params = {**_default_template_params(), **(variables or {})}

    response = send_templated_email_with_failover(
        template_key=template_key,
        to=recipients,
        variables=params,
        subject=subject,
        from_email=from_email,
        raise_on_error=raise_on_error,
    )

    if response.get("success"):
        logger.info(
            "Template email sent",
            extra={
                "template_key": template_key,
                "to": recipients,
                "provider": response.get("provider"),
            },
        )
    else:
        logger.error(
            "Template email failed after failover attempts",
            extra={"template_key": template_key, "to": recipients, "error": response.get("error")},
        )

    return response


def _dispatch_template_email(
    template_key: str,
    to: str | list[str],
    variables: dict[str, Any],
    subject: str | None = None,
    from_email: str | None = None,
    raise_on_error: bool = False,
) -> dict:
    return send_template_email(
        template_key=template_key,
        to=to,
        variables=variables,
        subject=subject,
        from_email=from_email,
        raise_on_error=raise_on_error,
    )


def send_welcome_email(to: str, first_name: str, dashboard_url: str) -> dict:
    return _dispatch_template_email(
        template_key="welcome",
        to=to,
        variables={
            "first_name": first_name,
            "dashboard_url": dashboard_url,
        },
    )


def send_verify_email(
    to: str,
    first_name: str,
    otp_code: str,
    expiry_minutes: int,
    verify_url: str,
    resend_url: str,
) -> dict:
    return _dispatch_template_email(
        template_key="verify_email",
        to=to,
        variables={
            "first_name": first_name,
            "otp_code": otp_code,
            "expiry_minutes": expiry_minutes,
            "verify_url": verify_url,
            "resend_url": resend_url,
        },
    )


def send_login_alert_email(
    to: str,
    first_name: str,
    device_name: str,
    browser_name: str,
    login_location: str,
    login_time: str,
    ip_address: str,
    confirm_url: str,
    secure_url: str,
) -> dict:
    return _dispatch_template_email(
        template_key="login_alert",
        to=to,
        variables={
            "first_name": first_name,
            "device_name": device_name,
            "browser_name": browser_name,
            "login_location": login_location,
            "login_time": login_time,
            "ip_address": ip_address,
            "confirm_url": confirm_url,
            "secure_url": secure_url,
        },
    )


def send_reset_password_email(
    to: str,
    first_name: str,
    reset_url: str,
    expiry_minutes: int,
    request_ip: str,
    request_browser: str,
    request_location: str,
) -> dict:
    return _dispatch_template_email(
        template_key="reset_password",
        to=to,
        variables={
            "first_name": first_name,
            "reset_url": reset_url,
            "expiry_minutes": expiry_minutes,
            "request_ip": request_ip,
            "request_browser": request_browser,
            "request_location": request_location,
        },
    )


def send_session_live_email(
    to: str | list[str],
    first_name: str,
    course_code: str,
    course_name: str,
    lecturer_name: str,
    room_location: str,
    session_time: str,
    minutes_remaining: int,
    closes_at: str,
    mark_url: str,
) -> dict:
    return _dispatch_template_email(
        template_key="session_live",
        to=to,
        variables={
            "first_name": first_name,
            "course_code": course_code,
            "course_name": course_name,
            "lecturer_name": lecturer_name,
            "room_location": room_location,
            "session_time": session_time,
            "minutes_remaining": minutes_remaining,
            "closes_at": closes_at,
            "mark_url": mark_url,
        },
    )


def send_newsletter_welcome_email(
    to: str,
    first_name: str,
    edition_label: str,
    featured_title: str,
    featured_excerpt: str,
    featured_url: str,
    dashboard_url: str,
    unsubscribe_url: str,
) -> dict:
    return _dispatch_template_email(
        template_key="newsletter_welcome",
        to=to,
        variables={
            "first_name": first_name,
            "edition_label": edition_label,
            "featured_title": featured_title,
            "featured_excerpt": featured_excerpt,
            "featured_url": featured_url,
            "dashboard_url": dashboard_url,
            "unsubscribe_url": unsubscribe_url,
        },
    )


def send_attendance_confirmed_email(
    to: str,
    first_name: str,
    course_code: str,
    course_name: str,
    arrival_time: str,
    check_in_method: str,
    location_label: str,
    streak_label: str,
    streak_message: str,
    streak_percent: int,
    history_url: str,
    report_url: str,
) -> dict:
    return _dispatch_template_email(
        template_key="attendance_confirmed",
        to=to,
        variables={
            "first_name": first_name,
            "course_code": course_code,
            "course_name": course_name,
            "arrival_time": arrival_time,
            "check_in_method": check_in_method,
            "location_label": location_label,
            "streak_label": streak_label,
            "streak_message": streak_message,
            "streak_percent": streak_percent,
            "history_url": history_url,
            "report_url": report_url,
        },
    )


def send_staff_access_invitation_email(
    to: str,
    first_name: str,
    inviter_name: str,
    role_name: str,
    invitation_url: str,
    expires_in_hours: int,
) -> dict:
    return _dispatch_template_email(
        template_key="staff_access_invitation",
        to=to,
        variables={
            "first_name": first_name,
            "inviter_name": inviter_name,
            "role_name": role_name,
            "invitation_url": invitation_url,
            "invite_url": invitation_url,
            "dashboard_url": invitation_url,
            "expires_in_hours": expires_in_hours,
        },
    )
