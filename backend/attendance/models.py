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
