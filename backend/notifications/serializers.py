from rest_framework import serializers
from .models import Notification, FCMDevice, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'data',
            'is_read', 'read_at', 'is_sent', 'sent_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sent_at', 'is_sent']


class FCMDeviceSerializer(serializers.ModelSerializer):
    """Serializer for FCMDevice model"""
    
    class Meta:
        model = FCMDevice
        fields = [
            'id', 'registration_token', 'device_id', 'device_type',
            'device_name', 'browser', 'os_version',
            'is_active', 'last_used_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_used_at', 'created_at', 'updated_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'attendance_reminders', 'session_alerts', 'absence_warnings',
            'exam_clearance_updates', 'attendance_summaries', 'system_notifications',
            'push_notifications', 'email_notifications',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending notifications"""
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        help_text="List of user IDs to send notification to"
    )
    title = serializers.CharField(max_length=200, required=True)
    message = serializers.TextField(required=True)
    notification_type = serializers.ChoiceField(
        choices=Notification._meta.get_field('notification_type').choices,
        required=True
    )
    data = serializers.JSONField(required=False, allow_null=True)


class BroadcastNotificationSerializer(serializers.Serializer):
    """Serializer for broadcasting notifications"""
    title = serializers.CharField(max_length=200, required=True)
    message = serializers.TextField(required=True)
    notification_type = serializers.ChoiceField(
        choices=Notification._meta.get_field('notification_type').choices,
        required=True
    )
    data = serializers.JSONField(required=False, allow_null=True)
    target_role = serializers.ChoiceField(
        choices=['ALL', 'STUDENT', 'LECTURER', 'ADMIN', 'CLASS_REP'],
        required=False,
        default='ALL',
        help_text="Target user role for broadcast"
    )
