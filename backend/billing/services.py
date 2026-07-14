from django.utils import timezone
from .models import Subscription, SubscriptionStatus, BillingOwner, BillingOwnerType


def get_active_subscription_for_user(user):
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
