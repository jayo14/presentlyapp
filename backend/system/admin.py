from django.contrib import admin

from .models import FeatureFlag, SystemLog, SystemMetricsSnapshot


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


@admin.register(SystemMetricsSnapshot)
class SystemMetricsSnapshotAdmin(admin.ModelAdmin):
	list_display = (
		'collected_at',
		'db_latency_ms',
		'active_django_sessions',
		'notification_queue',
		'emails_sent_today',
		'storage_used_pct',
	)
	readonly_fields = (
		'server_start_time',
		'uptime_seconds',
		'db_latency_ms',
		'active_django_sessions',
		'storage_total_mb',
		'storage_used_mb',
		'storage_used_pct',
		'notification_queue',
		'emails_sent_today',
		'collected_at',
	)
	ordering = ('-collected_at',)
