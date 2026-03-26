from rest_framework import serializers

from .models import UserDevice, LoginAttemptLog


class UserDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDevice
        fields = [
            'id',
            'device_name',
            'user_agent',
            'ip_address',
            'geo_country',
            'geo_city',
            'geo_timezone',
            'geo_isp',
            'device_fingerprint',
            'is_trusted',
            'visitor_id',
            'last_seen_at',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'device_name',
            'user_agent',
            'ip_address',
            'geo_country',
            'geo_city',
            'geo_timezone',
            'geo_isp',
            'device_fingerprint',
            'visitor_id',
            'last_seen_at',
            'created_at',
        ]


class LoginAttemptLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginAttemptLog
        fields = [
            'id',
            'ip_address',
            'user_agent',
            'status',
            'reason',
            'geo_country',
            'geo_city',
            'is_suspicious',
            'created_at',
        ]
        read_only_fields = fields
