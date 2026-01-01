from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    """Types of notifications"""
    ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER', 'Attendance Reminder'
    SESSION_STARTED = 'SESSION_STARTED', 'Session Started'
    SESSION_ENDING = 'SESSION_ENDING', 'Session Ending Soon'
    ABSENCE_ALERT = 'ABSENCE_ALERT', 'Absence Alert'
    EXAM_CLEARANCE = 'EXAM_CLEARANCE', 'Exam Clearance Status'
    ATTENDANCE_SUMMARY = 'ATTENDANCE_SUMMARY', 'Attendance Summary'
    SYSTEM = 'SYSTEM', 'System Notification'


class Notification(models.Model):
    """User notifications"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    
    # Data payload for rich notifications
    data = models.JSONField(null=True, blank=True)
    
    # Delivery status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # FCM specific
    fcm_message_id = models.CharField(max_length=200, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class FCMDevice(models.Model):
    """FCM device tokens for push notifications"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fcm_devices')
    registration_token = models.TextField(unique=True)
    device_id = models.CharField(max_length=200, null=True, blank=True)
    device_type = models.CharField(max_length=20, choices=[
        ('ANDROID', 'Android'),
        ('IOS', 'iOS'),
        ('WEB', 'Web'),
    ])
    
    # Device info
    device_name = models.CharField(max_length=200, null=True, blank=True)
    browser = models.CharField(max_length=100, null=True, blank=True)
    os_version = models.CharField(max_length=100, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(auto_now=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fcm_devices'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['registration_token']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_type} - {self.device_name or 'Unknown'}"


class NotificationPreference(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Notification type preferences
    attendance_reminders = models.BooleanField(default=True)
    session_alerts = models.BooleanField(default=True)
    absence_warnings = models.BooleanField(default=True)
    exam_clearance_updates = models.BooleanField(default=True)
    attendance_summaries = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    
    # Delivery channels
    push_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
    
    def __str__(self):
        return f"{self.user.email} - Preferences"

