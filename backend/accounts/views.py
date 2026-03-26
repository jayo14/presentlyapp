import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserDevice, LoginAttemptLog
from .serializers import UserDeviceSerializer, LoginAttemptLogSerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_devices_view(request):
    """List all devices registered for the current user."""
    devices = UserDevice.objects.filter(user=request.user).order_by('-last_seen_at')
    serializer = UserDeviceSerializer(devices, many=True)
    return Response({'success': True, 'devices': serializer.data})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_device_view(request, device_id):
    """
    Update a device — currently supports toggling ``is_trusted``.
    Only the device owner may update it.
    """
    device = get_object_or_404(UserDevice, id=device_id, user=request.user)

    trusted = request.data.get('is_trusted')
    if trusted is None:
        return Response(
            {'success': False, 'error': 'is_trusted field is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    device.is_trusted = bool(trusted)
    device.save(update_fields=['is_trusted'])

    serializer = UserDeviceSerializer(device)
    return Response({'success': True, 'device': serializer.data})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def revoke_device_view(request, device_id):
    """Revoke (remove) a device from the current user's trusted device list."""
    device = get_object_or_404(UserDevice, id=device_id, user=request.user)
    device.delete()
    return Response({'success': True, 'message': 'Device removed successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_activity_view(request):
    """Return recent login attempt logs for the current user."""
    logs = LoginAttemptLog.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = LoginAttemptLogSerializer(logs, many=True)
    return Response({'success': True, 'activity': serializer.data})
