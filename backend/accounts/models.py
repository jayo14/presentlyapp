from django.db import models
from django.utils import timezone


class UserDevice(models.Model):
    """Track user devices for security"""

    user = models.ForeignKey('institutions.User', on_delete=models.CASCADE, related_name='devices')
    device_name = models.CharField(max_length=255)
    user_agent = models.TextField()
    ip_address = models.GenericIPAddressField()

    # GeoIP data
    geo_country = models.CharField(max_length=100, blank=True, default='')
    geo_city = models.CharField(max_length=100, blank=True, default='')
    geo_timezone = models.CharField(max_length=100, blank=True, default='')
    geo_isp = models.CharField(max_length=255, blank=True, default='')
    geo_latitude = models.FloatField(null=True, blank=True)
    geo_longitude = models.FloatField(null=True, blank=True)

    # Device fingerprint (hash of UA + OS + browser combination)
    device_fingerprint = models.CharField(max_length=64, blank=True, default='')

    is_trusted = models.BooleanField(default=False)
    visitor_id = models.CharField(max_length=255, null=True, blank=True)

    # Timestamps
    last_seen_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(auto_now=True)
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


class LoginAttemptLog(models.Model):
    """Log all login attempts (successful and failed) for security auditing"""

    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUS_BLOCKED = 'blocked'
    STATUS_CHOICES = [
        (STATUS_SUCCESS, 'Success'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_BLOCKED, 'Blocked'),
    ]

    REASON_INVALID_CREDENTIALS = 'invalid_credentials'
    REASON_UNVERIFIED_EMAIL = 'unverified_email'
    REASON_RATE_LIMITED = 'rate_limited'
    REASON_NEW_DEVICE = 'new_device'
    REASON_SUSPICIOUS_LOCATION = 'suspicious_location'
    REASON_IMPOSSIBLE_TRAVEL = 'impossible_travel'
    REASON_NORMAL = 'normal'
    REASON_CHOICES = [
        (REASON_INVALID_CREDENTIALS, 'Invalid Credentials'),
        (REASON_UNVERIFIED_EMAIL, 'Unverified Email'),
        (REASON_RATE_LIMITED, 'Rate Limited'),
        (REASON_NEW_DEVICE, 'New Device'),
        (REASON_SUSPICIOUS_LOCATION, 'Suspicious Location'),
        (REASON_IMPOSSIBLE_TRAVEL, 'Impossible Travel'),
        (REASON_NORMAL, 'Normal Login'),
    ]

    user = models.ForeignKey(
        'institutions.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='login_attempts',
    )
    email_attempted = models.EmailField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_FAILED)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, default=REASON_NORMAL)
    geo_country = models.CharField(max_length=100, blank=True, default='')
    geo_city = models.CharField(max_length=100, blank=True, default='')
    is_suspicious = models.BooleanField(default=False)
    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_attempt_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['ip_address', '-created_at']),
            models.Index(fields=['email_attempted', '-created_at']),
        ]

    def __str__(self):
        email = self.user.email if self.user else self.email_attempted
        return f"{email} - {self.status} ({self.created_at})"
