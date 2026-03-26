from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserDevice
from .serializers import UserDeviceSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_devices_list_view(request):
    """List all devices for the current user"""
    devices = UserDevice.objects.filter(user=request.user).order_by('-last_seen_at')
    serializer = UserDeviceSerializer(devices, many=True)
    return Response({
        'success': True,
        'devices': serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trust_device_view(request, device_id):
    """Mark a device as trusted"""
    try:
        device = UserDevice.objects.get(id=device_id, user=request.user)
        device.is_trusted = True
        device.save()
        return Response({
            'success': True,
            'message': f"Device '{device.device_name}' is now trusted."
        })
    except UserDevice.DoesNotExist:
        return Response({
            'success': False,
            'error': "Device not found."
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_device_view(request, device_id):
    """Remove/Revoke a device"""
    try:
        device = UserDevice.objects.get(id=device_id, user=request.user)
        device_name = device.device_name
        device.delete()
        return Response({
            'success': True,
            'message': f"Device '{device_name}' has been revoked."
        })
    except UserDevice.DoesNotExist:
        return Response({
            'success': False,
            'error': "Device not found."
        }, status=status.HTTP_404_NOT_FOUND)
