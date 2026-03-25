from django.contrib import admin

from .models import FeatureFlag, SystemLog


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
	list_display = ('key', 'name', 'enabled', 'int_value', 'updated_at')
	list_filter = ('enabled',)
	search_fields = ('key', 'name', 'description')
	ordering = ('key',)


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
	list_display = ('timestamp', 'level', 'event_type', 'action', 'user', 'ip_address')
	list_filter = ('level', 'event_type')
	search_fields = ('action', 'details', 'user__email', 'user__full_name')
	readonly_fields = ('timestamp',)
