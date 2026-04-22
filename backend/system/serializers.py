from rest_framework import serializers
from .models import SystemLog, EmailDeliveryLog

class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = SystemLog
        fields = [
            'id', 'event_type', 'level', 'action', 'user_name', 'user_email',
            'user_role', 'ip_address', 'details', 'timestamp',
        ]


class EmailDeliveryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailDeliveryLog
        fields = [
            'id',
            'provider',
            'status',
            'template_key',
            'subject',
            'recipients',
            'recipient_count',
            'error_message',
            'provider_response',
            'duration_ms',
            'created_at',
        ]
