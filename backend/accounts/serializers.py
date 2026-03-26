from rest_framework import serializers
from .models import UserDevice

class UserDeviceSerializer(serializers.ModelSerializer):
    """Serializer for UserDevice model"""
    class Meta:
        model = UserDevice
        fields = [
            'id', 'device_name', 'ip_address', 'geo_country', 'geo_city', 
            'timezone', 'isp', 'lat', 'lon', 'device_fingerprint', 
            'is_trusted', 'last_seen_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_seen_at']
