from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Notification)
def send_push_notification_on_save(sender, instance, created, **kwargs):
    """
    Trigger push notification when a new Notification is created.
    """
    if created and not instance.is_sent:
        try:
            NotificationService.send_push_notification(
                user=instance.user,
                title=instance.title,
                message=instance.message,
                data=instance.data,
                notification_type=instance.notification_type
            )
            
            # Update instance to mark as sent (though is_sent usually refers to email/push delivery)
            # We can mark it here if we consider the attempt sufficient, 
            # or rely on the service to return success status. 
            # For now, let's mark it as processed.
            Notification.objects.filter(pk=instance.pk).update(
                is_sent=True,
                sent_at=instance.created_at  # using created_at as approx sent time
            )
            
        except Exception as e:
            logger.error(f"Error in push notification signal: {e}")
