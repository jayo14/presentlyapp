"""
Novu integration service for all email and notification sending.
This module handles all notification triggers using Novu instead of Django's send_mail.
"""

import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Initialize Novu API
try:
    novu_secret_key = os.environ.get('NOVU_SECRET_KEY')
    if novu_secret_key:
        from novu.api import EventApi
        novu_client = EventApi(api_key=novu_secret_key)
        NOVU_AVAILABLE = True
    else:
        novu_client = None
        NOVU_AVAILABLE = False
        logger.warning("NOVU_SECRET_KEY not set. Notification features will be disabled.")
except ImportError:
    novu_client = None
    NOVU_AVAILABLE = False
    logger.warning("Novu package not installed. Notification features will be disabled.")


class NovuService:
    """Service for sending notifications through Novu."""
    
    @staticmethod
    def send_email_verification_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """
        Send email verification OTP notification.
        
        Args:
            user_id: Unique user identifier
            user_email: User's email address
            user_name: User's full name
            otp_code: OTP code to verify
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping email verification OTP notification.")
            return False
        
        try:
            novu_client.trigger(
                name="auth-email-verification",
                recipients=[{"subscriberId": str(user_id), "email": user_email}],
                payload={
                    "user_email": user_email,
                    "user_name": user_name,
                    "otp_code": otp_code,
                    "expires_in": 900  # 15 minutes
                }
            )
            logger.info(f"Email verification OTP sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email verification OTP via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_otp_resend(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """
        Send OTP resend notification.
        
        Args:
            user_id: Unique user identifier
            user_email: User's email address
            user_name: User's full name
            otp_code: OTP code to verify
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping OTP resend notification.")
            return False
        
        try:
            novu_client.trigger(
                name="auth-otp-resend",
                recipients=[{"subscriberId": str(user_id), "email": user_email}],
                payload={
                    "user_email": user_email,
                    "user_name": user_name,
                    "otp_code": otp_code,
                    "expires_in": 900  # 15 minutes
                }
            )
            logger.info(f"OTP resend notification sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send OTP resend via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_password_reset(user_id: str, user_email: str, user_name: str, reset_link: str) -> bool:
        """
        Send password reset email notification.
        
        Args:
            user_id: Unique user identifier
            user_email: User's email address
            user_name: User's full name
            reset_link: Password reset link
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping password reset notification.")
            return False
        
        try:
            novu_client.trigger(
                name="auth-password-reset",
                recipients=[{"subscriberId": str(user_id), "email": user_email}],
                payload={
                    "user_email": user_email,
                    "user_name": user_name,
                    "reset_link": reset_link,
                    "expires_in": 86400  # 24 hours
                }
            )
            logger.info(f"Password reset email sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_password_reset_otp(user_id: str, user_email: str, user_name: str, otp_code: str) -> bool:
        """
        Send password reset OTP verification notification.
        
        Args:
            user_id: Unique user identifier
            user_email: User's email address
            user_name: User's full name
            otp_code: OTP code for password reset verification
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping password reset OTP notification.")
            return False
        
        try:
            novu_client.trigger(
                name="auth-password-reset-otp",
                recipients=[{"subscriberId": str(user_id), "email": user_email}],
                payload={
                    "user_email": user_email,
                    "user_name": user_name,
                    "otp_code": otp_code,
                    "expires_in": 600  # 10 minutes
                }
            )
            logger.info(f"Password reset OTP sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset OTP via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_new_device_alert(user_id: str, user_email: str, user_name: str, 
                              device_info: Dict[str, Any], ip_address: str) -> bool:
        """
        Send new device login alert notification.
        
        Args:
            user_id: Unique user identifier
            user_email: User's email address
            user_name: User's full name
            device_info: Dictionary containing device details
            ip_address: IP address of the login
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping new device alert notification.")
            return False
        
        try:
            novu_client.trigger(
                name="security-new-device-alert",
                recipients=[{"subscriberId": str(user_id), "email": user_email}],
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
            logger.info(f"New device alert sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send new device alert via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_user_invitation(user_email: str, user_name: str, inviter_name: str, 
                            invitation_link: str, institution_name: str) -> bool:
        """
        Send user invitation email notification.
        
        Args:
            user_email: Email address of user being invited
            user_name: Name of user being invited
            inviter_name: Name of the person sending the invitation
            invitation_link: Link to accept invitation
            institution_name: Name of the institution
            
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping user invitation notification.")
            return False
        
        try:
            novu_client.trigger(
                name="onboarding-user-invitation",
                recipients=[{"subscriberId": user_email, "email": user_email}],
                payload={
                    "user_email": user_email,
                    "user_name": user_name,
                    "inviter_name": inviter_name,
                    "invitation_link": invitation_link,
                    "institution_name": institution_name
                }
            )
            logger.info(f"User invitation sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send user invitation via Novu: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def send_bulk_notification(notification_type: str, recipients: List[Dict[str, str]], 
                               payload: Dict[str, Any]) -> bool:
        """
        Send bulk notifications to multiple users.
        
        Args:
            notification_type: Type of notification (Novu template name)
            recipients: List of recipient dicts with 'subscriberId' and optionally 'email'
            payload: Notification payload data
            
        Returns:
            bool: True if all notifications were sent successfully, False otherwise
        """
        if not NOVU_AVAILABLE:
            logger.warning("Novu is not available. Skipping bulk notification.")
            return False
        
        try:
            novu_client.trigger(
                name=notification_type,
                recipients=recipients,
                payload=payload
            )
            logger.info(f"Bulk notification ({notification_type}) sent to {len(recipients)} recipients")
            return True
        except Exception as e:
            logger.error(f"Failed to send bulk notification via Novu: {str(e)}", exc_info=True)
            return False
    
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
