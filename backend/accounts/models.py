from django.db import models
from django.utils import timezone


class UserDevice(models.Model):
    """Track user devices for security"""

    user = models.ForeignKey('institutions.User', on_delete=models.CASCADE, related_name='devices')
    device_name = models.CharField(max_length=255)
    device_fingerprint = models.CharField(max_length=64, blank=True, null=True)
    user_agent = models.TextField()
    ip_address = models.GenericIPAddressField()

    # GeoIP metadata
    geo_country = models.CharField(max_length=100, blank=True, null=True)
    geo_city = models.CharField(max_length=100, blank=True, null=True)
    geo_timezone = models.CharField(max_length=100, blank=True, null=True)
    geo_isp = models.CharField(max_length=200, blank=True, null=True)
    geo_lat = models.FloatField(blank=True, null=True)
    geo_lon = models.FloatField(blank=True, null=True)

    is_trusted = models.BooleanField(default=False)
    visitor_id = models.CharField(max_length=255, null=True, blank=True)

    last_seen_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_devices'
        indexes = [
            models.Index(fields=['user', 'ip_address']),
            models.Index(fields=['user', 'user_agent']),
            models.Index(fields=['user', 'visitor_id']),
            models.Index(fields=['user', 'device_fingerprint']),
        ]
        unique_together = [['user', 'visitor_id']]

    def __str__(self):
        return f"{self.user.email} - {self.device_name}"


class LoginAttempt(models.Model):
    """Log every login attempt for auditing and anomaly detection"""

    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUS_BLOCKED = 'blocked'
    STATUS_CHOICES = [
        (STATUS_SUCCESS, 'Success'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_BLOCKED, 'Blocked'),
    ]

    user = models.ForeignKey(
        'institutions.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='login_attempts',
    )
    email = models.EmailField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    is_suspicious = models.BooleanField(default=False)
    suspicious_reason = models.CharField(max_length=500, blank=True, null=True)
    geo_country = models.CharField(max_length=100, blank=True, null=True)
    geo_city = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_attempts'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['email']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['status']),
            models.Index(fields=['is_suspicious']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.email} - {self.status} - {self.timestamp}"
