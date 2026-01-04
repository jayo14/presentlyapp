from django.contrib import admin
from .models import UserDevice

@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'ip_address', 'last_login', 'is_trusted')
    list_filter = ('is_trusted', 'created_at')
    search_fields = ('user__email', 'device_name', 'ip_address')
    readonly_fields = ('created_at', 'last_login')