from django.db import models
from django.utils.translation import gettext_lazy as _
from institutions.models import User

class SystemLog(models.Model):
    EVENT_TYPES = (
        ('AUTH', 'Authentication'),
        ('SYSTEM', 'System'),
        ('CONFIG', 'Configuration'),
        ('SECURITY', 'Security'),
        ('ERROR', 'Error'),
    )

    LEVELS = (
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    )

    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='SYSTEM')
    level = models.CharField(max_length=10, choices=LEVELS, default='info')
    action = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level.upper()}] {self.action} - {self.timestamp}"