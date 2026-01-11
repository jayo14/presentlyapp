import logging
import firebase_admin
from firebase_admin import messaging
from django.conf import settings
from .models import FCMDevice, NotificationPreference
from presently.firebase_config import initialize_firebase

logger = logging.getLogger(__name__)

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
