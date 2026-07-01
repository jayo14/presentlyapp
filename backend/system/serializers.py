from rest_framework import serializers
from .models import SystemLog, EmailDeliveryLog, SystemMetricsSnapshot

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


class SystemMetricsSnapshotSerializer(serializers.ModelSerializer):
    server_uptime_pct = serializers.SerializerMethodField()

    class Meta:
        model = SystemMetricsSnapshot
        fields = [
            'id',
            'server_start_time',
            'uptime_seconds',
            'server_uptime_pct',
            'db_latency_ms',
            'active_django_sessions',
            'storage_total_mb',
            'storage_used_mb',
            'storage_used_pct',
            'notification_queue',
            'emails_sent_today',
            'collected_at',
        ]

    def get_server_uptime_pct(self, obj):
        # Normalize uptime to a 30-day window so the dashboard can render it as a percentage.
        seconds_in_30_days = 30 * 24 * 60 * 60
        if not obj.uptime_seconds:
            return 0.0
        return round(min((obj.uptime_seconds / seconds_in_30_days) * 100, 100.0), 2)
