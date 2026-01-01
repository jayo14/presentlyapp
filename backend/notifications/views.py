from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Notification, FCMDevice, NotificationPreference
from .serializers import (
    NotificationSerializer, FCMDeviceSerializer, NotificationPreferenceSerializer,
    SendNotificationSerializer, BroadcastNotificationSerializer
)


class NotificationListView(generics.ListAPIView):
    """List user notifications"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(generics.RetrieveAPIView):
    """Get notification details"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """Mark notification as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        from django.utils import timezone
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read', 'id': pk})


class MarkAllReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from django.utils import timezone
        count = Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read', 'count': count})


class UnreadCountView(APIView):
    """Get unread notification count"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


class FCMDeviceListView(generics.ListAPIView):
    """List FCM devices"""
    permission_classes = [IsAuthenticated]
    serializer_class = FCMDeviceSerializer
    
    def get_queryset(self):
        return FCMDevice.objects.filter(user=self.request.user)


class RegisterFCMDeviceView(APIView):
    """Register FCM device token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = FCMDeviceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FCMDeviceDetailView(generics.RetrieveAPIView):
    """Get FCM device details"""
    permission_classes = [IsAuthenticated]
    serializer_class = FCMDeviceSerializer
    
    def get_queryset(self):
        return FCMDevice.objects.filter(user=self.request.user)


class DeactivateFCMDeviceView(APIView):
    """Deactivate FCM device"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        device = get_object_or_404(FCMDevice, pk=pk, user=request.user)
        device.is_active = False
        device.save()
        return Response({'message': 'FCM device deactivated', 'id': pk})


class NotificationPreferencesView(APIView):
    """Get/Update notification preferences"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        preferences, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data)
    
    def patch(self, request):
        preferences, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendNotificationView(APIView):
    """Send notification to specific users"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from institutions.models import User, UserRole
        # Only admins can send notifications
        if request.user.role != UserRole.ADMIN:
            return Response(
                {'error': 'Only administrators can send notifications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SendNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_ids = serializer.validated_data['user_ids']
        title = serializer.validated_data['title']
        message = serializer.validated_data['message']
        notification_type = serializer.validated_data['notification_type']
        data = serializer.validated_data.get('data')
        
        # Create notifications for specified users
        notifications = []
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                notification = Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    data=data
                )
                notifications.append(notification)
            except User.DoesNotExist:
                pass
        
        return Response({
            'message': 'Notifications sent successfully',
            'recipients': len(notifications)
        })


class BroadcastNotificationView(APIView):
    """Broadcast notification to all users or specific groups"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from institutions.models import User, UserRole
        # Only admins can broadcast notifications
        if request.user.role != UserRole.ADMIN:
            return Response(
                {'error': 'Only administrators can broadcast notifications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BroadcastNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        title = serializer.validated_data['title']
        message = serializer.validated_data['message']
        notification_type = serializer.validated_data['notification_type']
        data = serializer.validated_data.get('data')
        target_role = serializer.validated_data.get('target_role', 'ALL')
        
        # Get target users
        if target_role == 'ALL':
            users = User.objects.filter(is_active=True)
        else:
            users = User.objects.filter(is_active=True, role=target_role)
        
        # Create notifications
        notifications = []
        for user in users:
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                data=data
            )
            notifications.append(notification)
        
        return Response({
            'message': 'Notification broadcasted successfully',
            'recipients': len(notifications)
        })

