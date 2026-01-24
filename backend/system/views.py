from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
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
            day_start = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))

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

class SystemLogsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SystemLogSerializer
    queryset = SystemLog.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
            
        search = self.request.query_params.get('search')
        if search:
             queryset = queryset.filter(
                Q(action__icontains=search) | 
                Q(user__full_name__icontains=search) |
                Q(details__icontains=search)
            )
            
        return queryset

class SystemConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'payment_gateway_enabled': False
        })
    
    def patch(self, request):
        return Response(request.data)
