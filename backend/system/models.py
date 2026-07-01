from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.cache import cache
from institutions.models import User


class FeatureFlag(models.Model):
    """Runtime feature flags and thresholds editable from Django admin."""

    key = models.CharField(max_length=120, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    enabled = models.BooleanField(default=False)
    int_value = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']

    def __str__(self):
        return f"{self.key} ({'on' if self.enabled else 'off'})"

    def save(self, *args, **kwargs):
        result = super().save(*args, **kwargs)
        cache.delete(f"feature_flag:bool:{self.key}")
        cache.delete(f"feature_flag:int:{self.key}")
        return result

    def delete(self, *args, **kwargs):
        cache.delete(f"feature_flag:bool:{self.key}")
        cache.delete(f"feature_flag:int:{self.key}")
        return super().delete(*args, **kwargs)

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


class EmailDeliveryLog(models.Model):
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('quota_exhausted', 'Quota Exhausted'),
        ('throttled', 'Throttled'),
    )

    provider = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='failed')
    template_key = models.CharField(max_length=120, blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, default='')
    recipients = models.JSONField(default=list, blank=True)
    recipient_count = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True, default='')
    provider_response = models.JSONField(default=dict, blank=True)
    duration_ms = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider']),
            models.Index(fields=['status']),
            models.Index(fields=['template_key']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.provider} [{self.status}] {self.subject}".strip()


class SystemMetricsSnapshot(models.Model):
    """
    Periodic snapshot of platform health metrics.
    Written by the `collect_system_metrics` management command (run via cron or
    Celery beat). The admin dashboard reads the most-recent row instead of
    hard-coding values.
    """
    # ── Uptime ────────────────────────────────────────────────────────────
    server_start_time = models.DateTimeField(
        null=True, blank=True,
        help_text="When the current Django process started (stored in cache on first request)."
    )
    uptime_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Seconds the server has been running since server_start_time."
    )

    # ── Database latency ─────────────────────────────────────────────────
    db_latency_ms = models.FloatField(
        default=0.0,
        help_text="Round-trip time for a trivial DB query in milliseconds."
    )

    # ── Realtime / active sessions ───────────────────────────────────────
    active_django_sessions = models.PositiveIntegerField(
        default=0,
        help_text="Number of non-expired Django sessions (proxy for realtime users)."
    )

    # ── Storage ──────────────────────────────────────────────────────────
    storage_total_mb = models.FloatField(
        default=0.0,
        help_text="Total disk space of the partition that holds MEDIA_ROOT (MB)."
    )
    storage_used_mb = models.FloatField(
        default=0.0,
        help_text="Used disk space on that partition (MB)."
    )
    storage_used_pct = models.FloatField(
        default=0.0,
        help_text="storage_used_mb / storage_total_mb * 100."
    )

    # ── Notification queue ───────────────────────────────────────────────
    notification_queue = models.PositiveIntegerField(
        default=0,
        help_text="Unread notifications at snapshot time."
    )

    # ── Emails ───────────────────────────────────────────────────────────
    emails_sent_today = models.PositiveIntegerField(
        default=0,
        help_text="Successful email deliveries recorded today."
    )

    # ── Metadata ─────────────────────────────────────────────────────────
    collected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-collected_at']
        get_latest_by = 'collected_at'
        verbose_name = 'System Metrics Snapshot'
        verbose_name_plural = 'System Metrics Snapshots'

    def __str__(self):
        return f"Snapshot @ {self.collected_at:%Y-%m-%d %H:%M:%S} — DB {self.db_latency_ms:.1f}ms"
