from django.db import models

class UserDevice(models.Model):
    """Track user devices for security"""
    
    user = models.ForeignKey('institutions.User', on_delete=models.CASCADE, related_name='devices')
    device_name = models.CharField(max_length=255)
    user_agent = models.TextField()
    ip_address = models.GenericIPAddressField()
    last_login = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_trusted = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_devices'
        indexes = [
            models.Index(fields=['user', 'ip_address']),
            models.Index(fields=['user', 'user_agent']),
        ]
        unique_together = [['user', 'ip_address', 'user_agent']]
    
    def __str__(self):
        return f"{self.user.email} - {self.device_name}"
