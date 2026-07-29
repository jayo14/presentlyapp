from django.db import models
from django.conf import settings


class AttendanceAttemptLog(models.Model):
    """Logs all attendance attempts (even failed ones) for security auditing"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_attempts'
    )
    session = models.ForeignKey(
        'institutions.AttendanceSession',
        on_delete=models.CASCADE,
        related_name='attempts',
        null=True,
        blank=True
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    accuracy = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    drift_avg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    inside_polygon = models.BooleanField(default=False)
    is_mocked = models.BooleanField(default=False, help_text="Mock location provider flag detected")
    visitor_id = models.CharField(max_length=255, null=True, blank=True, help_text="Unique hardware fingerprint (visitorId)")
    device_id = models.CharField(max_length=255, null=True, blank=True, help_text="Mobile device identifier")
    webgl_renderer = models.CharField(max_length=255, null=True, blank=True, help_text="WebGL Renderer (emulator detection)")
    motion_detected = models.BooleanField(default=False, help_text="Did the device sensors detect physical movement?")
    ip_city = models.CharField(max_length=255, null=True, blank=True, help_text="City inferred from IP address")
    trust_score = models.IntegerField(default=0, help_text="Calculated fraud confidence score (0-100)")

    rejected_reason = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_attempt_logs'
        ordering = ['-created_at']

    def __str__(self):
        status = "Success" if not self.rejected_reason else f"Failed: {self.rejected_reason}"
        return f"{self.student.email} - {status} at {self.created_at}"


class AttendanceSubmission(models.Model):
    """Raw GPS-verified attendance submission from the mobile app"""

    VERDICT_PENDING = 'PENDING'
    VERDICT_ACCEPTED = 'ACCEPTED'
    VERDICT_FLAGGED = 'FLAGGED'
    VERDICT_REJECTED = 'REJECTED'
    VERDICT_CHOICES = [
        (VERDICT_PENDING, 'Pending'),
        (VERDICT_ACCEPTED, 'Accepted'),
        (VERDICT_FLAGGED, 'Flagged'),
        (VERDICT_REJECTED, 'Rejected'),
    ]

    NETWORK_WIFI = 'wifi'
    NETWORK_CELLULAR = 'cellular'
    NETWORK_NONE = 'none'
    NETWORK_CHOICES = [
        (NETWORK_WIFI, 'WiFi'),
        (NETWORK_CELLULAR, 'Cellular'),
        (NETWORK_NONE, 'None'),
    ]

    session = models.ForeignKey(
        'institutions.AttendanceSession',
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_submissions'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    # GPS payload
    coordinates = models.JSONField(help_text="{lat, lng, accuracyMeters}")
    sample_count = models.IntegerField(default=0)
    mock_gps_flag = models.BooleanField(default=False)
    network_type = models.CharField(max_length=20, choices=NETWORK_CHOICES, default=NETWORK_NONE)
    movement_variance = models.FloatField(default=0.0)
    suspiciously_still = models.BooleanField(default=False)
    collection_duration_ms = models.IntegerField(default=0)

    # Scoring
    confidence_score = models.IntegerField(default=0, help_text="Client-submitted score (0-100)")
    server_confidence_score = models.IntegerField(default=0, help_text="Server-recomputed score (0-100)")
    verdict = models.CharField(max_length=10, choices=VERDICT_CHOICES, default=VERDICT_REJECTED)
    score_breakdown = models.JSONField(default=dict, blank=True)
    fail_reasons = models.JSONField(default=list, blank=True)

    # Behavioral flags from Phase 2
    behavioral_flags = models.JSONField(
        default=dict, blank=True,
        help_text="{appBackgrounded, backgroundDurationMs, locationExitCount, windowRestartCount, tapPatternSuspicious}"
    )

    # Device / network metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_fingerprint = models.CharField(max_length=512, blank=True, null=True)

    # Override tracking
    overridden_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='submission_overrides'
    )
    override_reason = models.TextField(blank=True, null=True)
    overridden_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'attendance_submissions'
        indexes = [
            models.Index(fields=['session', 'student']),
            models.Index(fields=['verdict']),
            models.Index(fields=['submitted_at']),
        ]
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.email} → session {self.session_id} [{self.verdict}]"


class AttendanceRecord(models.Model):
    """Clean attendance output model — derived from AttendanceSubmission after server-side validation.
    This is what lecturers see."""

    VERDICT_CHOICES = AttendanceSubmission.VERDICT_CHOICES

    session = models.ForeignKey(
        'institutions.AttendanceSession',
        on_delete=models.CASCADE,
        related_name='records'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    submission = models.OneToOneField(
        AttendanceSubmission,
        on_delete=models.CASCADE,
        related_name='record',
        null=True, blank=True
    )
    final_verdict = models.CharField(max_length=10, choices=VERDICT_CHOICES)
    confidence_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_records'
        unique_together = [['session', 'student']]
        indexes = [
            models.Index(fields=['session', 'final_verdict']),
            models.Index(fields=['student']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} → session {self.session_id} [{self.final_verdict}]"

