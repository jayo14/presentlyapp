from django.db import transaction
from django.utils import timezone

from .models import (
    Subscription, SubscriptionStatus, BillingOwner,
    BillingOwnerType, DepartmentSeat, AccountCredit,
)


def get_active_subscription_for_user(user):
    dept_seat = DepartmentSeat.objects.filter(
        user=user, is_active=True,
        subscription__status__in=[
            SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING,
        ],
        subscription__current_period_end__gte=timezone.now(),
    ).select_related(
        'subscription', 'subscription__plan', 'subscription__billing_owner',
    ).first()

    if dept_seat:
        return dept_seat.subscription

    billing_owners = BillingOwner.objects.filter(
        owner_user=user, owner_type=BillingOwnerType.SELF
    )

    if not billing_owners.exists():
        return None

    owner = billing_owners.first()
    active = Subscription.objects.filter(
        billing_owner=owner,
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        current_period_end__gte=timezone.now(),
    ).select_related('plan').order_by('-current_period_end').first()

    return active


@transaction.atomic
def transition_billing_owner(user, new_billing_owner):
    old_sub = Subscription.objects.filter(
        billing_owner__owner_user=user,
        billing_owner__owner_type=BillingOwnerType.SELF,
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        current_period_end__gte=timezone.now(),
    ).select_related('plan').first()

    if old_sub:
        now = timezone.now()
        total = (old_sub.current_period_end - old_sub.current_period_start).total_seconds()
        remaining = (old_sub.current_period_end - now).total_seconds()
        if total > 0 and remaining > 0:
            fraction = remaining / total
            unused_kobo = int(old_sub.plan.price_kobo * fraction)
            if unused_kobo > 0:
                AccountCredit.objects.create(
                    user=user,
                    amount_kobo=unused_kobo,
                    reason=f"superseded_by_department: {old_sub.plan.code}",
                )

        old_sub.status = SubscriptionStatus.CANCELED
        old_sub.save(update_fields=['status'])

    sub_for_department = Subscription.objects.filter(
        billing_owner=new_billing_owner,
        status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        current_period_end__gte=timezone.now(),
    ).first()

    if not sub_for_department:
        return None

    seat = DepartmentSeat.objects.filter(
        subscription__billing_owner=new_billing_owner,
        user=user,
    ).first()

    if seat:
        seat.is_active = True
        seat.subscription = sub_for_department
        seat.save(update_fields=['is_active', 'subscription'])
    else:
        seat = DepartmentSeat.objects.create(
            subscription=sub_for_department,
            user=user,
            is_active=True,
        )

    return seat
