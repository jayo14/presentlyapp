from django.contrib import admin
from .models import UserDevice, LoginAttempt


@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'ip_address', 'last_seen_at', 'is_trusted', 'geo_country', 'geo_city')
    list_filter = ('is_trusted', 'created_at', 'geo_country')
    search_fields = ('user__email', 'device_name', 'ip_address', 'geo_country', 'geo_city')
    readonly_fields = ('created_at', 'last_seen_at', 'device_fingerprint')


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'status', 'ip_address', 'geo_country', 'geo_city', 'is_suspicious', 'timestamp')
    list_filter = ('status', 'is_suspicious', 'timestamp')
    search_fields = ('email', 'ip_address', 'geo_country')
    readonly_fields = ('timestamp',)