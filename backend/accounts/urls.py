from django.urls import path
from .views import user_devices_list_view, trust_device_view, revoke_device_view

urlpatterns = [
    path('devices/', user_devices_list_view, name='user-devices-list'),
    path('devices/<int:device_id>/trust/', trust_device_view, name='trust-device'),
    path('devices/<int:device_id>/revoke/', revoke_device_view, name='revoke-device'),
]
