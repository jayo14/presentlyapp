from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notification management
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='notification-read'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='notifications-mark-all-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='notifications-unread-count'),
    
    # FCM Device management
    path('devices/', views.FCMDeviceListView.as_view(), name='device-list'),
    path('devices/register/', views.RegisterFCMDeviceView.as_view(), name='device-register'),
    path('devices/<int:pk>/', views.FCMDeviceDetailView.as_view(), name='device-detail'),
    path('devices/<int:pk>/deactivate/', views.DeactivateFCMDeviceView.as_view(), name='device-deactivate'),
    
    # Notification preferences
    path('preferences/', views.NotificationPreferencesView.as_view(), name='preferences'),
    
    # Send notifications (admin/lecturer only)
    path('send/', views.SendNotificationView.as_view(), name='send-notification'),
    path('broadcast/', views.BroadcastNotificationView.as_view(), name='broadcast-notification'),
]
