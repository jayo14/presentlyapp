import json

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Plan, BillingOwner, BillingOwnerType, Subscription, SubscriptionStatus, Payment, PaymentStatus
from .serializers import CheckoutRequestSerializer, CurrentPlanSerializer
from .services import get_active_subscription_for_user
from .paystack import initialize_transaction, verify_webhook_signature
from .tasks import handle_charge_success_task, handle_subscription_disable_task, handle_invoice_failed_task


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
