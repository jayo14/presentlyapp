from django.db import models

class UserDevice(models.Model):
    """Track user devices for security with anomaly detection"""
    
    user = models.ForeignKey('institutions.User', on_delete=models.CASCADE, related_name='devices')
    device_name = models.CharField(max_length=255)
    user_agent = models.TextField()
    ip_address = models.GenericIPAddressField()
    
    # GeoIP Data
    geo_country = models.CharField(max_length=100, null=True, blank=True)
    geo_city = models.CharField(max_length=100, null=True, blank=True)
    timezone = models.CharField(max_length=100, null=True, blank=True)
    isp = models.CharField(max_length=255, null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    
    device_fingerprint = models.CharField(max_length=255, null=True, blank=True)
    
    is_trusted = models.BooleanField(default=False)
    last_seen_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_devices'
        indexes = [
            models.Index(fields=['user', 'ip_address']),
            models.Index(fields=['user', 'device_fingerprint']),
            models.Index(fields=['user', 'last_seen_at']),
        ]
        unique_together = [['user', 'device_fingerprint']]
    
    def __str__(self):
        return f"{self.user.email} - {self.device_name}"
