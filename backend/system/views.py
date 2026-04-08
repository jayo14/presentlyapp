import csv
import io
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from .models import SystemLog
from .serializers import SystemLogSerializer
from institutions.models import User, AttendanceSession, Venue

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
            'payment_gateway_enabled': False
        })

    def patch(self, request):
        return Response(request.data)
