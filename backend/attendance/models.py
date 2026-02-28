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
    inside_polygon = models.BooleanField(default=False)
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
