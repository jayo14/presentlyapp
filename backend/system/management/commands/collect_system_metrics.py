"""
Management command: collect_system_metrics

Measures real platform health values and persists them as a
SystemMetricsSnapshot row. Designed to be called:

  • By a Celery beat schedule (recommended in production)
  • By a cron job:  */2 * * * * /path/to/venv/bin/python manage.py collect_system_metrics
  • On demand:      python manage.py collect_system_metrics

The admin dashboard endpoint reads the latest snapshot, giving the
frontend real values without running expensive queries on every request.
"""

import time
import shutil
import os
from datetime import datetime, timezone as dt_tz

from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone
from django.conf import settings
from django.core.cache import cache


# Cache key where we store the server process start timestamp (seconds since epoch).
SERVER_START_CACHE_KEY = "presently:server_start_epoch"
# How many snapshot rows to retain (older ones get pruned).
MAX_SNAPSHOTS = 500


def _get_or_set_server_start() -> datetime:
    """
    Return the datetime when this Django process started.
    On first call we set the cache; subsequent calls read it back.
    Falls back to 'now' if the cache is unavailable.
    """
    cached = cache.get(SERVER_START_CACHE_KEY)
    if cached is None:
        # First time: record current time as the process start.
        epoch = time.time()
        cache.set(SERVER_START_CACHE_KEY, epoch, timeout=None)  # persist indefinitely
        cached = epoch
    return datetime.fromtimestamp(float(cached), tz=dt_tz.utc)


def _measure_db_latency_ms() -> float:
    """Execute a trivial round-trip query and return elapsed time in ms."""
    start = time.perf_counter()
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()
    return round((time.perf_counter() - start) * 1000, 2)


def _measure_storage() -> tuple[float, float, float]:
    """
    Return (total_mb, used_mb, used_pct) for the partition that contains
    MEDIA_ROOT (or BASE_DIR as fallback).
    """
    root = getattr(settings, 'MEDIA_ROOT', None) or getattr(settings, 'BASE_DIR', '/')
    try:
        usage = shutil.disk_usage(str(root))
        total_mb = usage.total / (1024 ** 2)
        used_mb  = usage.used  / (1024 ** 2)
        used_pct = round((usage.used / usage.total) * 100, 1) if usage.total else 0.0
        return round(total_mb, 1), round(used_mb, 1), used_pct
    except Exception:
        return 0.0, 0.0, 0.0


def _count_active_sessions() -> int:
    """Count non-expired Django sessions as a proxy for connected users."""
    try:
        from django.contrib.sessions.models import Session
        return Session.objects.filter(expire_date__gt=timezone.now()).count()
    except Exception:
        return 0


def _count_notification_queue() -> int:
    try:
        from notifications.models import Notification
        return Notification.objects.filter(is_read=False).count()
    except Exception:
        return 0


def _count_emails_sent_today() -> int:
    try:
        from system.models import EmailDeliveryLog
        return EmailDeliveryLog.objects.filter(
            created_at__date=timezone.now().date(),
            status='sent',
        ).count()
    except Exception:
        return 0


class Command(BaseCommand):
    help = "Collect real platform health metrics and save a SystemMetricsSnapshot."

    def handle(self, *args, **options):
        from system.models import SystemMetricsSnapshot

        server_start = _get_or_set_server_start()
        uptime_seconds = int((timezone.now() - server_start).total_seconds())
        db_latency_ms = _measure_db_latency_ms()
        storage_total_mb, storage_used_mb, storage_used_pct = _measure_storage()
        active_sessions = _count_active_sessions()
        notif_queue = _count_notification_queue()
        emails_today = _count_emails_sent_today()

        snapshot = SystemMetricsSnapshot.objects.create(
            server_start_time=server_start,
            uptime_seconds=uptime_seconds,
            db_latency_ms=db_latency_ms,
            active_django_sessions=active_sessions,
            storage_total_mb=storage_total_mb,
            storage_used_mb=storage_used_mb,
            storage_used_pct=storage_used_pct,
            notification_queue=notif_queue,
            emails_sent_today=emails_today,
        )

        # Prune old rows to keep the table lean
        old_ids = (
            SystemMetricsSnapshot.objects
            .order_by('-collected_at')
            .values_list('id', flat=True)[MAX_SNAPSHOTS:]
        )
        if old_ids:
            SystemMetricsSnapshot.objects.filter(id__in=list(old_ids)).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"[collect_system_metrics] snapshot #{snapshot.id} saved — "
                f"uptime {uptime_seconds}s, DB {db_latency_ms}ms, "
                f"storage {storage_used_pct}%, queue {notif_queue}"
            )
        )
