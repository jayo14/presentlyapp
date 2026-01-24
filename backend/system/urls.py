from django.urls import path
from . import views

app_name = 'system'

urlpatterns = [
    path('stats/', views.SystemStatsView.as_view(), name='stats'),
    path('activity/', views.SystemActivityView.as_view(), name='activity'),
    path('alerts/', views.SystemAlertsView.as_view(), name='alerts'),
    path('logs/', views.SystemLogsView.as_view(), name='logs'),
    path('config/', views.SystemConfigView.as_view(), name='config'),
]
