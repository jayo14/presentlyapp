import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings
from .models import FCMDevice, NotificationPreference

logger = logging.getLogger(__name__)

def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    if not firebase_admin._apps:
        try:
            # Try to load from file path
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
            
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
            else:
                # Try to load from environment variable JSON
                service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
                if service_account_json:
                    service_account_dict = json.loads(service_account_json)
                    cred = credentials.Certificate(service_account_dict)
                else:
                    logger.warning("Firebase credentials not found. Push notifications will not work.")
                    return False
            
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            return False
    return True

# Initialize on module import
initialize_firebase()

class NotificationService:
    """Service for handling push notifications"""
    
    @staticmethod
    def send_push_notification(user, title, message, data=None, notification_type=None):
        """
        Send push notification to a user's active devices.
        
        Args:
            user: User instance
            title: Notification title
            message: Notification body
            data: Optional dictionary of data to send
            notification_type: Type of notification (for preferences check)
        """
        # Check if Firebase is initialized
        if not firebase_admin._apps:
            if not initialize_firebase():
                return
        
        # Check user preferences
        try:
            prefs = NotificationPreference.objects.get(user=user)
            if not prefs.push_notifications:
                logger.info(f"Push notifications disabled for user {user.email}")
                return
                
            # Check specific notification type preference if provided
            # Map notification types to preference fields
            type_map = {
                'ATTENDANCE_REMINDER': prefs.attendance_reminders,
                'SESSION_STARTED': prefs.session_alerts,
                'SESSION_ENDING': prefs.session_alerts,
                'ABSENCE_ALERT': prefs.absence_warnings,
                'EXAM_CLEARANCE': prefs.exam_clearance_updates,
                'ATTENDANCE_SUMMARY': prefs.attendance_summaries,
                'SYSTEM': prefs.system_notifications,
            }
            
            if notification_type and notification_type in type_map:
                if not type_map[notification_type]:
                    logger.info(f"{notification_type} notifications disabled for user {user.email}")
                    return
                    
        except NotificationPreference.DoesNotExist:
            # Default to allowed if no preferences set
            pass

        # Get active devices
        devices = FCMDevice.objects.filter(user=user, is_active=True)
        if not devices.exists():
            return

        # Prepare payload
        # Ensure data values are strings (FCM requirement for data payload)
        formatted_data = {}
        if data:
            for k, v in data.items():
                formatted_data[str(k)] = str(v)
        
        # Add internal type for frontend routing if needed
        if notification_type:
            formatted_data['type'] = str(notification_type)

        # Send to each device
        # We send individually to handle invalid tokens per device
        for device in devices:
            try:
                msg = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=message,
                    ),
                    data=formatted_data,
                    token=device.registration_token,
                )
                
                response = messaging.send(msg)
                logger.info(f"Push notification sent to device {device.id} for user {user.email}: {response}")
                
                # Update last used timestamp
                device.last_used_at = timezone.now()
                device.save(update_fields=['last_used_at'])
                
            except messaging.UnregisteredError:
                logger.info(f"Device {device.id} token unregistered, deactivating.")
                device.is_active = False
                device.save()
            except Exception as e:
                logger.error(f"Failed to send push notification to device {device.id}: {e}")

from django.utils import timezone
