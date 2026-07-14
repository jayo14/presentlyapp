from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from institutions.rbac import user_has_permission

from .models import (
    Plan, BillingOwner, BillingOwnerType, Subscription,
    SubscriptionStatus, Payment, PaymentStatus, DepartmentSeat, AccountCredit,
)
from .serializers import (
    PlanSerializer, SubscriptionSerializer, PaymentSerializer,
    DepartmentSeatSerializer, AccountCreditSerializer,
)


def _is_billing_admin(user):
    if getattr(user, 'is_superuser', False):
        return True
    return user_has_permission(user, 'billing.admin')


# ─── Plans ────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_plans_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        plans = Plan.objects.all().order_by('billing_owner_type', 'price_kobo')
        return Response(PlanSerializer(plans, many=True).data)

    serializer = PlanSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_plan_detail_view(request, plan_id):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        plan = Plan.objects.get(id=plan_id)
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = PlanSerializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    plan.is_active = False
    plan.save()
    return Response({'status': 'plan_deactivated'})


# ─── Subscriptions ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_subscriptions_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    qs = Subscription.objects.select_related(
        'billing_owner', 'plan',
        'billing_owner__owner_user',
        'billing_owner__owner_department',
    ).order_by('-created_at')

    status_filter = request.query_params.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter.upper())

    plan_filter = request.query_params.get('plan_code')
    if plan_filter:
        qs = qs.filter(plan__code=plan_filter)

    return Response(SubscriptionSerializer(qs, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_subscription_override_view(request, sub_id):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        sub = Subscription.objects.select_related('billing_owner', 'plan').get(id=sub_id)
    except Subscription.DoesNotExist:
        return Response({'error': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [s.value for s in SubscriptionStatus]:
        return Response({'error': f'Invalid status. Must be one of: {", ".join(s.value for s in SubscriptionStatus)}'},
                        status=status.HTTP_400_BAD_REQUEST)

    sub.status = new_status
    if new_status == SubscriptionStatus.ACTIVE and not sub.current_period_start:
        sub.current_period_start = timezone.now()
        sub.current_period_end = timezone.now() + timezone.timedelta(days=30)
    sub.save()
    return Response(SubscriptionSerializer(sub).data)


# ─── Payments ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    qs = Payment.objects.select_related(
        'billing_owner', 'subscription',
    ).order_by('-created_at')

    status_filter = request.query_params.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter.upper())

    return Response(PaymentSerializer(qs, many=True).data)


# ─── Department Seats ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_seats_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    qs = DepartmentSeat.objects.select_related(
        'subscription', 'user',
        'subscription__plan',
        'subscription__billing_owner',
    ).order_by('-assigned_at')

    active_filter = request.query_params.get('active')
    if active_filter == 'true':
        qs = qs.filter(is_active=True)
    elif active_filter == 'false':
        qs = qs.filter(is_active=False)

    return Response(DepartmentSeatSerializer(qs, many=True).data)


# ─── Account Credits ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_credits_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    qs = AccountCredit.objects.select_related('user').order_by('-created_at')
    return Response(AccountCreditSerializer(qs, many=True).data)


# ─── Stats ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_billing_stats_view(request):
    if not _is_billing_admin(request.user):
        return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()

    active_subs = Subscription.objects.filter(
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        current_period_end__gte=now,
    )
    total_revenue = Payment.objects.filter(
        status=PaymentStatus.SUCCESS,
    ).aggregate(total=Sum('amount_kobo'))['total'] or 0

    subs_by_plan = (
        active_subs.values('plan__code', 'plan__name')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    subs_by_status = (
        Subscription.objects.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    revenue_by_month = (
        Payment.objects.filter(status=PaymentStatus.SUCCESS)
        .annotate(month=TruncMonth('paid_at'))
        .values('month')
        .annotate(total=Sum('amount_kobo'))
        .order_by('month')
    )

    total_users = get_user_model().objects.count()
    users_with_seats = DepartmentSeat.objects.filter(is_active=True).values('user').distinct().count()

    return Response({
        'active_subscriptions': active_subs.count(),
        'total_revenue_kobo': total_revenue,
        'total_revenue_formatted': f'{total_revenue / 100:,.2f}',
        'subscriptions_by_plan': list(subs_by_plan),
        'subscriptions_by_status': list(subs_by_status),
        'revenue_by_month': [
            {'month': r['month'].strftime('%Y-%m') if r['month'] else None, 'total_kobo': r['total']}
            for r in revenue_by_month
        ],
        'total_plans': Plan.objects.count(),
        'active_plans': Plan.objects.filter(is_active=True).count(),
        'total_payments': Payment.objects.count(),
        'successful_payments': Payment.objects.filter(status=PaymentStatus.SUCCESS).count(),
        'total_department_seats': DepartmentSeat.objects.count(),
        'active_department_seats': DepartmentSeat.objects.filter(is_active=True).count(),
        'total_users': total_users,
        'users_with_seats': users_with_seats,
    })
