"""
Novu integration service for all email and notification sending.
This module handles all notification triggers using Novu instead of Django's send_mail.
Uses the novu-py v3 SDK (pip install novu-py).
"""

import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Initialize Novu API
novu_client = None
NOVU_AVAILABLE = False
ResponseValidationError = None  # Will be set if novu_py is available

try:
    novu_secret_key = os.environ.get('NOVU_SECRET_KEY')
    if novu_secret_key:
        import novu_py
        from novu_py import Novu
        from novu_py.models.responsevalidationerror import ResponseValidationError
        novu_client = Novu(secret_key=novu_secret_key)
        NOVU_AVAILABLE = True
        logger.info("Novu notification service initialized.")
    else:
        logger.warning("NOVU_SECRET_KEY not set. Notification features will be disabled.")
except ImportError:
    logger.warning("Novu package not installed. Notification features will be disabled.")


def _trigger(workflow_id: str, subscriber_id: str, email: str, payload: Dict[str, Any]) -> bool:
    """
    Internal helper to trigger a Novu workflow.
    Handles ResponseValidationError (e.g. workflow not yet created in Novu dashboard)
    cleanly without a full traceback.
    """
    if not NOVU_AVAILABLE or novu_client is None:
        return False

    try:
        import novu_py as _novu_py
        novu_client.trigger(
            trigger_event_request_dto=_novu_py.TriggerEventRequestDto(
                workflow_id=workflow_id,
                to={
                    "subscriber_id": subscriber_id,
                    "email": email,
                },
                payload=payload,
            )
        )
        return True

    except Exception as e:
        # ResponseValidationError means Novu returned an error (e.g. 422 = workflow not found).
        # Log a clean warning rather than a full traceback — the app continues to work fine.
        error_class = type(e).__name__
        if "ResponseValidationError" in error_class or "ValidationError" in error_class:
            logger.warning(
                "Novu workflow '%s' trigger failed (workflow may not exist in dashboard yet): %s",
                workflow_id, e
            )
        else:
            logger.error(
                "Novu trigger failed for workflow '%s': %s",
                workflow_id, e, exc_info=True
            )
        return False


class NovuService:
    """Service for sending notifications through Novu."""

    @staticmethod
    def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send email verification OTP notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping email verification OTP notification.")
            return False

        success = _trigger(
            workflow_id="auth-email-verification",
            subscriber_id=str(user_id),
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "otp_code": otp_code,
                "expires_in": 900  # 15 minutes
            }
        )
        if success:
            logger.info("Email verification OTP sent to %s", user_email)
        return success

    @staticmethod
    def send_otp_resend(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send OTP resend notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping OTP resend notification.")
            return False

        success = _trigger(
            workflow_id="auth-otp-resend",
            subscriber_id=str(user_id),
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "otp_code": otp_code,
                "expires_in": 900  # 15 minutes
            }
        )
        if success:
            logger.info("OTP resend notification sent to %s", user_email)
        return success

    @staticmethod
    def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
        """Send password reset email notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping password reset notification.")
            return False

        success = _trigger(
            workflow_id="auth-password-reset",
            subscriber_id=str(user_id),
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "reset_link": reset_link,
                "expires_in": 86400  # 24 hours
            }
        )
        if success:
            logger.info("Password reset email sent to %s", user_email)
        return success

    @staticmethod
    def send_password_reset_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """Send password reset OTP verification notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping password reset OTP notification.")
            return False

        success = _trigger(
            workflow_id="auth-password-reset-otp",
            subscriber_id=str(user_id),
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "otp_code": otp_code,
                "expires_in": 600  # 10 minutes
            }
        )
        if success:
            logger.info("Password reset OTP sent to %s", user_email)
        return success

    @staticmethod
    def send_new_device_alert(user_id: str, user_email: str, user_name: str,
                              device_info: Dict[str, Any], ip_address: str) -> bool:
        """Send new device login alert notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping new device alert notification.")
            return False

        success = _trigger(
            workflow_id="security-new-device-alert",
            subscriber_id=str(user_id),
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "device_type": device_info.get('device_type', 'Unknown'),
                "device_name": device_info.get('device_name', 'Unknown'),
                "browser": device_info.get('browser', 'Unknown'),
                "os": device_info.get('os', 'Unknown'),
                "ip_address": ip_address,
                "login_time": device_info.get('login_time', '')
            }
        )
        if success:
            logger.info("New device alert sent to %s", user_email)
        return success

    @staticmethod
    def send_user_invitation(user_email: str, user_name: str, inviter_name: str,
                             invitation_link: str, institution_name: str) -> bool:
        """Send user invitation email notification."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping user invitation notification.")
            return False

        success = _trigger(
            workflow_id="onboarding-user-invitation",
            subscriber_id=user_email,
            email=user_email,
            payload={
                "user_email": user_email,
                "user_name": user_name,
                "inviter_name": inviter_name,
                "invitation_link": invitation_link,
                "institution_name": institution_name
            }
        )
        if success:
            logger.info("User invitation sent to %s", user_email)
        return success

    @staticmethod
    def send_bulk_notification(notification_type: str, recipients: List[Dict[str, str]],
                               payload: Dict[str, Any]) -> bool:
        """Send bulk notifications to multiple users."""
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping bulk notification.")
            return False

        results = [
            _trigger(
                workflow_id=notification_type,
                subscriber_id=r.get("subscriberId", ""),
                email=r.get("email", ""),
                payload=payload
            )
            for r in recipients
        ]
        if all(results):
            logger.info("Bulk notification (%s) sent to %d recipients", notification_type, len(recipients))
        return all(results)

    @staticmethod
    def is_available() -> bool:
        """Check if Novu service is available."""
        return NOVU_AVAILABLE


# Convenience functions for backward compatibility
def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
    """Send email verification OTP."""
    return NovuService.send_email_verification_otp(user_id, user_email, user_name, otp_code)


def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
    """Send password reset email."""
    return NovuService.send_password_reset(user_id, user_email, user_name, reset_link)


def send_new_device_alert(user_id: str, user_email: str, user_name: str,
                          device_info: Dict[str, Any], ip_address: str) -> bool:
    """Send new device login alert."""
    return NovuService.send_new_device_alert(user_id, user_email, user_name, device_info, ip_address)


def send_user_invitation(user_email: str, user_name: str, inviter_name: str,
                         invitation_link: str, institution_name: str) -> bool:
    """Send user invitation email."""
    return NovuService.send_user_invitation(user_email, user_name, inviter_name, invitation_link, institution_name)
