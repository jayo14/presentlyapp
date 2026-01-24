from rest_framework import serializers
from .models import SystemLog

class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = SystemLog
        fields = ['id', 'event_type', 'level', 'action', 'user_name', 'user_role', 'ip_address', 'details', 'timestamp']
