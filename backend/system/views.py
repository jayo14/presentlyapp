import csv
import io
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from .models import SystemLog, FeatureFlag, EmailDeliveryLog
from .feature_flags import get_feature_flag
from .serializers import SystemLogSerializer, EmailDeliveryLogSerializer
from institutions.models import User, AttendanceSession, Venue, UserRole


def _is_admin_user(user) -> bool:
    return bool(user and user.is_authenticated and (getattr(user, 'is_superuser', False) or user.role == UserRole.ADMIN))

class SystemStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_users = User.objects.count()
        active_venues = Venue.objects.filter(is_active=True).count()
        total_sessions = AttendanceSession.objects.count()
        security_alerts = SystemLog.objects.filter(level__in=['warning', 'error']).count()

        return Response({
            'total_users': total_users,
            'active_venues': active_venues,
            'total_sessions': total_sessions,
            'security_alerts': security_alerts,
        })

class SystemActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        activity_data = []

        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            active_users = User.objects.filter(last_login__date=date).count()
            sessions = AttendanceSession.objects.filter(start_time__date=date).count()

            activity_data.append({
                'name': date.strftime('%a'),
                'active': active_users,
                'sessions': sessions
            })

        return Response(activity_data)

class SystemAlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alerts = SystemLog.objects.filter(level__in=['warning', 'error']).order_by('-timestamp')[:5]
        data = []
        for alert in alerts:
            data.append({
                'id': str(alert.id),
                'type': alert.level,
                'title': alert.action,
                'message': alert.details or alert.action,
                'timestamp': alert.timestamp.isoformat()
            })
        return Response(data)


def _apply_log_filters(queryset, params):
    """Shared filter logic for SystemLog querysets."""
    # Full-text search: keyword, user email/ID, action
    search = params.get('search')
    if search:
        queryset = queryset.filter(
            Q(action__icontains=search) |
            Q(user__full_name__icontains=search) |
            Q(user__email__icontains=search) |
            Q(details__icontains=search) |
            Q(ip_address__icontains=search)
        )

    # Event type filter
    event_type = params.get('event_type')
    if event_type:
        queryset = queryset.filter(event_type=event_type)

    # Level (severity) filter — supports comma-separated values
    level = params.get('level')
    if level:
        levels = [l.strip() for l in level.split(',') if l.strip()]
        queryset = queryset.filter(level__in=levels)

    # Role filter
    role = params.get('role')
    if role:
        queryset = queryset.filter(user__role__iexact=role)

    # Date range filters
    date_from = params.get('date_from')
    if date_from:
        queryset = queryset.filter(timestamp__date__gte=date_from)
    date_to = params.get('date_to')
    if date_to:
        queryset = queryset.filter(timestamp__date__lte=date_to)

    # IP address filter
    ip = params.get('ip_address')
    if ip:
        queryset = queryset.filter(ip_address__icontains=ip)

    return queryset


class SystemLogsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SystemLogSerializer
    queryset = SystemLog.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        return _apply_log_filters(queryset, self.request.query_params)


class SystemLogsExportCsvView(APIView):
    """Export system logs as CSV with the same filters as SystemLogsView."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = SystemLog.objects.select_related('user').all()
        queryset = _apply_log_filters(queryset, request.query_params)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Timestamp', 'Level', 'Event Type', 'Action', 'User Name', 'User Email', 'User Role', 'IP Address', 'Details'])

        for log in queryset:
            writer.writerow([
                log.timestamp.isoformat() if log.timestamp else '',
                log.level,
                log.event_type,
                log.action,
                log.user.full_name if log.user else '',
                log.user.email if log.user else '',
                log.user.role if log.user else '',
                log.ip_address or '',
                log.details or '',
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="presently-audit-logs.csv"'
        return response


class SystemConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'payment_gateway_enabled': False,
            'at_risk_alerts_enabled': get_feature_flag('at_risk_alerts', default=True),
        })

    def patch(self, request):
        payload = dict(request.data)

        if 'at_risk_alerts_enabled' in payload:
            if not request.user.is_staff:
                return Response({'error': 'Only staff can update feature flags.'}, status=status.HTTP_403_FORBIDDEN)

            enabled = bool(payload.get('at_risk_alerts_enabled'))
            flag, _ = FeatureFlag.objects.get_or_create(
                key='at_risk_alerts',
                defaults={
                    'name': 'At-Risk Alerts',
                    'description': 'Show at-risk student alerts and bulk reminder actions in lecturer analytics.',
                    'enabled': enabled,
                },
            )
            if flag.enabled != enabled:
                flag.enabled = enabled
                flag.save(update_fields=['enabled', 'updated_at'])

            payload['at_risk_alerts_enabled'] = enabled

        return Response(payload)


def _apply_email_filters(queryset, params):
    provider = params.get('provider')
    if provider:
        queryset = queryset.filter(provider__iexact=provider)

    status_value = params.get('status')
    if status_value:
        queryset = queryset.filter(status=status_value)

    template_key = params.get('template_key')
    if template_key:
        queryset = queryset.filter(template_key__icontains=template_key)

    search = params.get('search')
    if search:
        queryset = queryset.filter(
            Q(subject__icontains=search)
            | Q(template_key__icontains=search)
            | Q(error_message__icontains=search)
            | Q(provider__icontains=search)
        )

    date_from = params.get('date_from')
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)

    date_to = params.get('date_to')
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)

    return queryset


class EmailDeliveryOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin_user(request.user):
            return Response({'error': 'Only administrators can view email analytics.'}, status=status.HTTP_403_FORBIDDEN)

        logs = _apply_email_filters(EmailDeliveryLog.objects.all(), request.query_params)

        total_attempts = logs.count()
        sent_count = logs.filter(status='sent').count()
        failed_count = logs.filter(status='failed').count()
        quota_count = logs.filter(status='quota_exhausted').count()
        throttled_count = logs.filter(status='throttled').count()
        success_rate = round((sent_count / total_attempts * 100), 2) if total_attempts else 0.0

        provider_rows = logs.values('provider', 'status').annotate(total=Count('id')).order_by('provider')
        provider_map = {}
        for row in provider_rows:
            provider = row['provider']
            if provider not in provider_map:
                provider_map[provider] = {
                    'provider': provider,
                    'sent': 0,
                    'failed': 0,
                    'quota_exhausted': 0,
                    'throttled': 0,
                    'total': 0,
                }
            status_key = row['status']
            provider_map[provider][status_key] = row['total']
            provider_map[provider]['total'] += row['total']

        daily_data = (
            logs.annotate(day=TruncDate('created_at'))
            .values('day', 'status')
            .annotate(total=Count('id'))
            .order_by('day')
        )
        trend_map = {}
        for row in daily_data:
            key = row['day'].isoformat() if row['day'] else 'unknown'
            if key not in trend_map:
                trend_map[key] = {'date': key, 'sent': 0, 'failed': 0, 'quota_exhausted': 0, 'throttled': 0}
            trend_map[key][row['status']] = row['total']

        recent_logs = EmailDeliveryLogSerializer(logs[:20], many=True).data

        return Response({
            'summary': {
                'total_attempts': total_attempts,
                'sent_count': sent_count,
                'failed_count': failed_count,
                'quota_exhausted_count': quota_count,
                'throttled_count': throttled_count,
                'success_rate': success_rate,
            },
            'providers': list(provider_map.values()),
            'daily_trends': list(trend_map.values()),
            'recent_logs': recent_logs,
        })


class EmailDeliveryLogsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EmailDeliveryLogSerializer
    queryset = EmailDeliveryLog.objects.all()

    def list(self, request, *args, **kwargs):
        if not _is_admin_user(request.user):
            return Response({'error': 'Only administrators can view email logs.'}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        return _apply_email_filters(queryset, self.request.query_params)


class EmailDeliveryLogsExportCsvView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin_user(request.user):
            return Response({'error': 'Only administrators can export email logs.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = _apply_email_filters(EmailDeliveryLog.objects.all(), request.query_params)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Created At',
            'Provider',
            'Status',
            'Template Key',
            'Subject',
            'Recipient Count',
            'Recipients',
            'Duration (ms)',
            'Error Message',
        ])

        for log in queryset:
            writer.writerow([
                log.created_at.isoformat() if log.created_at else '',
                log.provider,
                log.status,
                log.template_key or '',
                log.subject,
                log.recipient_count,
                '; '.join(log.recipients or []),
                log.duration_ms or '',
                log.error_message or '',
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="presently-email-delivery-logs.csv"'
        return response
