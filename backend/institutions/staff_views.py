import hashlib
import secrets

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from institutions.models import (
    RBACPermission,
    StaffInvitation,
    StaffProfile,
    StaffRole,
    User,
    UserPermission,
    UserRole,
)
from institutions.rbac import PERMISSION_GROUPS, get_user_effective_permissions, seed_permissions_and_roles, user_has_permission
from institutions.serializers import (
    RBACPermissionSerializer,
    StaffAcceptInviteSerializer,
    StaffInvitationSerializer,
    StaffInviteRequestSerializer,
    StaffPermissionUpdateSerializer,
    StaffProfileSerializer,
    StaffRoleSerializer,
)
from utils.email import send_welcome_email


def _admin_or_staff_manager(user) -> bool:
    return bool(user and user.is_authenticated and (user.role == UserRole.ADMIN or user_has_permission(user, 'system.staff.manage')))


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _upsert_user_permissions(user: User, selected_codes: list[str], actor: User) -> None:
    selected_set = set(selected_codes)
    all_perms = list(RBACPermission.objects.all())

    for perm in all_perms:
        UserPermission.objects.update_or_create(
            user=user,
            permission=perm,
            defaults={
                'allowed': perm.codename in selected_set,
                'created_by': actor,
            },
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_permissions_catalog_view(request):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    seed_permissions_and_roles()
    permissions_qs = RBACPermission.objects.all()
    permissions_data = RBACPermissionSerializer(permissions_qs, many=True).data
    roles_data = StaffRoleSerializer(StaffRole.objects.filter(is_active=True), many=True).data

    return Response(
        {
            'success': True,
            'groups': PERMISSION_GROUPS,
            'permissions': permissions_data,
            'roles': roles_data,
        }
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_roles_view(request):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    seed_permissions_and_roles()
    roles = StaffRole.objects.filter(is_active=True)
    return Response({'success': True, 'roles': StaffRoleSerializer(roles, many=True).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_profiles_view(request):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    seed_permissions_and_roles()

    search = (request.query_params.get('search') or '').strip().lower()
    status_filter = (request.query_params.get('status') or '').strip().upper()
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))

    qs = StaffProfile.objects.select_related('user', 'role').order_by('-updated_at')

    if status_filter:
        qs = qs.filter(status=status_filter)

    if search:
        qs = qs.filter(Q(user__full_name__icontains=search) | Q(user__email__icontains=search))

    paginator = Paginator(qs, page_size)
    current_page = paginator.get_page(page)
    items = list(current_page.object_list)
    serializer = StaffProfileSerializer(items, many=True)

    return Response(
        {
            'success': True,
            'results': serializer.data,
            'count': paginator.count,
            'page': current_page.number,
            'total_pages': paginator.num_pages,
        }
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_invitations_view(request):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    status_filter = (request.query_params.get('status') or '').strip().upper()
    qs = StaffInvitation.objects.select_related('role', 'invited_by').order_by('-created_at')
    if status_filter:
        qs = qs.filter(status=status_filter)

    return Response({'success': True, 'results': StaffInvitationSerializer(qs, many=True).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_invite_view(request):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    serializer = StaffInviteRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    payload = serializer.validated_data

    seed_permissions_and_roles()

    role = None
    if payload.get('role_id'):
        role = StaffRole.objects.filter(id=payload['role_id'], is_active=True).first()

    invite_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(invite_token)
    expires_at = timezone.now() + timezone.timedelta(hours=int(getattr(settings, 'STAFF_INVITE_EXPIRY_HOURS', 48)))

    invitation = StaffInvitation.objects.create(
        email=payload['email'].lower().strip(),
        full_name=payload['full_name'].strip(),
        role=role,
        custom_permissions=payload.get('permissions', []),
        token_hash=token_hash,
        status=StaffInvitation.STATUS_PENDING,
        invited_by=request.user,
        expires_at=expires_at,
    )

    invite_link = f"{settings.FRONTEND_URL}/accept-invite?token={invite_token}"
    send_welcome_email(
        to=invitation.email,
        first_name=invitation.full_name.split(' ')[0],
        dashboard_url=invite_link,
    )

    return Response(
        {
            'success': True,
            'message': 'Invitation sent successfully.',
            'invitation': StaffInvitationSerializer(invitation).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_resend_invite_view(request, invitation_id: int):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    invitation = StaffInvitation.objects.filter(id=invitation_id).first()
    if not invitation:
        return Response({'success': False, 'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)

    if invitation.status == StaffInvitation.STATUS_REVOKED:
        return Response({'success': False, 'error': 'Cannot resend a revoked invitation'}, status=status.HTTP_400_BAD_REQUEST)

    invite_token = secrets.token_urlsafe(32)
    invitation.token_hash = _hash_token(invite_token)
    invitation.status = StaffInvitation.STATUS_PENDING
    invitation.expires_at = timezone.now() + timezone.timedelta(hours=int(getattr(settings, 'STAFF_INVITE_EXPIRY_HOURS', 48)))
    invitation.save(update_fields=['token_hash', 'status', 'expires_at', 'updated_at'])

    invite_link = f"{settings.FRONTEND_URL}/accept-invite?token={invite_token}"
    send_welcome_email(
        to=invitation.email,
        first_name=invitation.full_name.split(' ')[0],
        dashboard_url=invite_link,
    )

    return Response({'success': True, 'message': 'Invitation resent successfully.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_revoke_invite_view(request, invitation_id: int):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    invitation = StaffInvitation.objects.filter(id=invitation_id).first()
    if not invitation:
        return Response({'success': False, 'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)

    invitation.status = StaffInvitation.STATUS_REVOKED
    invitation.revoked_at = timezone.now()
    invitation.save(update_fields=['status', 'revoked_at', 'updated_at'])

    return Response({'success': True, 'message': 'Invitation revoked.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def staff_accept_invite_view(request):
    serializer = StaffAcceptInviteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    token = serializer.validated_data['token']
    raw_password = serializer.validated_data['password']
    validate_password(raw_password)

    invitation = StaffInvitation.objects.select_related('role').filter(token_hash=_hash_token(token)).first()
    if not invitation:
        return Response({'success': False, 'error': 'Invalid invitation token'}, status=status.HTTP_400_BAD_REQUEST)

    if invitation.status == StaffInvitation.STATUS_REVOKED:
        return Response({'success': False, 'error': 'Invitation has been revoked'}, status=status.HTTP_400_BAD_REQUEST)

    if invitation.status == StaffInvitation.STATUS_ACCEPTED:
        return Response({'success': False, 'error': 'Invitation has already been accepted'}, status=status.HTTP_400_BAD_REQUEST)

    if invitation.expires_at < timezone.now():
        invitation.status = StaffInvitation.STATUS_EXPIRED
        invitation.save(update_fields=['status', 'updated_at'])
        return Response({'success': False, 'error': 'Invitation has expired'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user, _ = User.objects.get_or_create(
            email=invitation.email,
            defaults={
                'full_name': invitation.full_name,
                'role': UserRole.ADMIN,
                'is_active': True,
                'email_verified': True,
                'email_verified_at': timezone.now(),
                'onboarding_complete': True,
            },
        )

        user.full_name = invitation.full_name
        user.role = UserRole.ADMIN
        user.is_active = True
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.onboarding_complete = True
        user.set_password(raw_password)
        user.save()

        profile, _ = StaffProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': invitation.role,
                'status': StaffProfile.STATUS_ACTIVE,
                'invited_by': invitation.invited_by,
                'invited_at': invitation.created_at,
                'invitation_accepted_at': timezone.now(),
                'last_active_at': timezone.now(),
            },
        )
        profile.role = invitation.role
        profile.status = StaffProfile.STATUS_ACTIVE
        profile.invitation_accepted_at = timezone.now()
        profile.last_active_at = timezone.now()
        profile.save()

        if invitation.custom_permissions is not None:
            _upsert_user_permissions(user, invitation.custom_permissions, invitation.invited_by or user)

        invitation.status = StaffInvitation.STATUS_ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.invited_user = user
        invitation.save(update_fields=['status', 'accepted_at', 'invited_user', 'updated_at'])

    return Response({'success': True, 'message': 'Invitation accepted successfully.'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def staff_update_view(request, user_id):
    if not _admin_or_staff_manager(request.user):
        return Response({'success': False, 'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    user = User.objects.filter(id=user_id).first()
    if not user:
        return Response({'success': False, 'error': 'Staff user not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = StaffPermissionUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    payload = serializer.validated_data

    profile, _ = StaffProfile.objects.get_or_create(user=user)

    if 'role_id' in payload:
        role = StaffRole.objects.filter(id=payload.get('role_id')).first() if payload.get('role_id') else None
        profile.role = role

    if 'status' in payload:
        profile.status = payload['status']
        if payload['status'] in [StaffProfile.STATUS_SUSPENDED, StaffProfile.STATUS_REVOKED]:
            profile.deactivated_at = timezone.now()
            user.is_active = payload['status'] != StaffProfile.STATUS_REVOKED
            user.save(update_fields=['is_active', 'updated_at'])

    profile.save()

    if 'permissions' in payload:
        _upsert_user_permissions(user, payload['permissions'], request.user)

    return Response(
        {
            'success': True,
            'message': 'Staff profile updated successfully.',
            'staff': StaffProfileSerializer(profile).data,
            'effective_permissions': get_user_effective_permissions(user),
        }
    )
