import json

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from institutions.models import Department
from institutions.rbac import user_has_permission

from .models import (
    Plan, BillingOwner, BillingOwnerType, Subscription,
    SubscriptionStatus, Payment, PaymentStatus, DepartmentSeat,
)
from .serializers import (
    CheckoutRequestSerializer, CurrentPlanSerializer,
    DepartmentSeatSerializer,
)
from .services import get_active_subscription_for_user, transition_billing_owner
from .paystack import initialize_transaction, verify_webhook_signature
from .tasks import (
    handle_charge_success_task, handle_subscription_disable_task,
    handle_invoice_failed_task,
)


def _user_can_manage_department_billing(user, department):
    if not user or not user.is_authenticated:
        return False
    if getattr(user, 'is_superuser', False):
        return True
    if user_has_permission(user, 'billing.department.manage'):
        return True
    return False


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_view(request):
    serializer = CheckoutRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    plan_code = serializer.validated_data['plan_code']

    try:
        plan = Plan.objects.get(code=plan_code, is_active=True)
    except Plan.DoesNotExist:
        return Response({'error': 'Invalid plan code.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user

    with transaction.atomic():
        billing_owner, _ = BillingOwner.objects.get_or_create(
            owner_type=BillingOwnerType.SELF,
            owner_user=user,
        )

    callback_url = request.build_absolute_uri('/api/billing/checkout/callback/')
    metadata = {
        'plan_code': plan.code,
        'billing_owner_id': str(billing_owner.id),
        'user_id': str(user.id),
    }

    try:
        paystack_resp = initialize_transaction(
            email=user.email,
            amount_kobo=plan.price_kobo,
            callback_url=callback_url,
            metadata=metadata,
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to initialize payment. Please try again.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({
        'authorization_url': paystack_resp['data']['authorization_url'],
        'reference': paystack_resp['data']['reference'],
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def webhook_view(request):
    signature = request.headers.get('x-paystack-signature')
    raw_body = request.body

    if not verify_webhook_signature(raw_body, signature):
        return Response({'error': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

    event = json.loads(raw_body)
    event_type = event.get('event')

    if event_type == 'charge.success':
        handle_charge_success_task.delay(event)
    elif event_type == 'subscription.disable':
        handle_subscription_disable_task.delay(event)
    elif event_type == 'invoice.payment_failed':
        handle_invoice_failed_task.delay(event)

    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    sub = get_active_subscription_for_user(user)

    if sub:
        plan = sub.plan
        serializer = CurrentPlanSerializer({
            'billing_owner': sub.billing_owner,
            'plan': plan,
            'status': sub.status,
            'course_limit': plan.course_limit,
            'seat_limit': plan.seat_limit,
            'is_active': True,
        })
    else:
        serializer = CurrentPlanSerializer({
            'billing_owner': None,
            'plan': None,
            'status': 'FREE',
            'course_limit': 1,
            'seat_limit': None,
            'is_active': True,
        })

    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def department_subscribe_view(request, department_id):
    try:
        department = Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return Response({'error': 'Department not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not _user_can_manage_department_billing(request.user, department):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    plan_code = request.data.get('plan_code')
    if not plan_code:
        return Response({'error': 'plan_code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = Plan.objects.get(
            code=plan_code, is_active=True,
            billing_owner_type=BillingOwnerType.DEPARTMENT,
        )
    except Plan.DoesNotExist:
        return Response({'error': 'Invalid department plan code.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        billing_owner, _ = BillingOwner.objects.get_or_create(
            owner_type=BillingOwnerType.DEPARTMENT,
            owner_department=department,
        )

        now = timezone.now()
        sub, _ = Subscription.objects.get_or_create(
            billing_owner=billing_owner,
            plan=plan,
            status=SubscriptionStatus.ACTIVE,
            defaults={
                'current_period_start': now,
                'current_period_end': now + timezone.timedelta(days=365),
            },
        )

    callback_url = request.build_absolute_uri('/api/billing/checkout/callback/')
    metadata = {
        'plan_code': plan.code,
        'billing_owner_id': str(billing_owner.id),
        'department_id': str(department.id),
    }

    try:
        paystack_resp = initialize_transaction(
            email=request.user.email,
            amount_kobo=plan.price_kobo,
            callback_url=callback_url,
            metadata=metadata,
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to initialize payment. Please try again.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({
        'authorization_url': paystack_resp['data']['authorization_url'],
        'reference': paystack_resp['data']['reference'],
        'subscription_id': sub.id,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def department_assign_seat_view(request, department_id):
    try:
        department = Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return Response({'error': 'Department not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not _user_can_manage_department_billing(request.user, department):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_user = get_user_model().objects.get(id=user_id)
    except get_user_model().DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    billing_owner = BillingOwner.objects.filter(
        owner_type=BillingOwnerType.DEPARTMENT,
        owner_department=department,
    ).first()

    if not billing_owner:
        return Response(
            {'error': 'Department has no subscription. Subscribe first.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    sub = Subscription.objects.filter(
        billing_owner=billing_owner,
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        current_period_end__gte=timezone.now(),
    ).select_related('plan').first()

    if not sub:
        return Response(
            {'error': 'No active subscription for this department.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    available = sub.available_seats()
    if available is not None and available < 1:
        return Response(
            {
                'error': 'No available seats. Upgrade your plan.',
                'code': 'plan_limit_exceeded',
                'seat_limit': sub.plan.seat_limit,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    if target_user.department_id != department.id:
        return Response(
            {'error': 'User does not belong to this department.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    seat = transition_billing_owner(target_user, billing_owner)

    if not seat:
        return Response(
            {'error': 'Could not assign seat. No active subscription.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(DepartmentSeatSerializer(seat).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def department_revoke_seat_view(request, department_id, user_id):
    try:
        department = Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return Response({'error': 'Department not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not _user_can_manage_department_billing(request.user, department):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        target_user = get_user_model().objects.get(id=user_id)
    except get_user_model().DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    updated = DepartmentSeat.objects.filter(
        user=target_user,
        subscription__billing_owner__owner_department=department,
        is_active=True,
    ).update(is_active=False)

    if not updated:
        return Response(
            {'error': 'No active seat found for this user.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response({'status': 'seat_revoked'})
