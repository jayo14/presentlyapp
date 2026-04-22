from django.urls import path
from . import views

app_name = 'system'

urlpatterns = [
    path('stats/', views.SystemStatsView.as_view(), name='stats'),
    path('activity/', views.SystemActivityView.as_view(), name='activity'),
    path('alerts/', views.SystemAlertsView.as_view(), name='alerts'),
    path('logs/', views.SystemLogsView.as_view(), name='logs'),
    path('logs/export/csv/', views.SystemLogsExportCsvView.as_view(), name='logs-export-csv'),
    path('email/overview/', views.EmailDeliveryOverviewView.as_view(), name='email-overview'),
    path('email/logs/', views.EmailDeliveryLogsView.as_view(), name='email-logs'),
    path('email/logs/export/csv/', views.EmailDeliveryLogsExportCsvView.as_view(), name='email-logs-export-csv'),
    path('config/', views.SystemConfigView.as_view(), name='config'),
]
