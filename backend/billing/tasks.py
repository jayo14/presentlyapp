import logging

from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from django.db import transaction

from utils.tasks import IdempotentTask, task_idempotency_key

logger = logging.getLogger(__name__)


# Two-layer idempotency:
#   1. Cache lock (fast path) – rejects near-simultaneous duplicate webhook deliveries
#      before they hit the DB.  The lock is intentionally *not* deleted on success;
#      letting it expire naturally keeps the race window closed.
#   2. DB get_or_create (authoritative) – guarantees exactly-once semantics even if
#      the cache is evicted or unavailable, because the Payment row is the source of
#      truth.  Both layers must exist; the cache guard alone is not enough because
#      cache is volatile, and the DB guard alone is slower under a retry storm.
@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
)
@IdempotentTask(
    key_func=lambda self, event_data: task_idempotency_key(
        "handle_charge_success", event_data.get("data", {}).get("reference", "")
    ),
    timeout=300,
)
def handle_charge_success_task(self, event_data):
    from .models import Payment, PaymentStatus, Subscription, SubscriptionStatus, Plan, BillingOwner

    data = event_data.get('data', {})
    reference = data.get('reference')
    if not reference:
        return

    with transaction.atomic():
        payment, created = Payment.objects.select_for_update().get_or_create(
            paystack_reference=reference,
            defaults={
                'amount_kobo': data.get('amount', 0),
                'status': PaymentStatus.SUCCESS,
                'paid_at': timezone.now(),
                'raw_webhook_payload': event_data,
            },
        )
        if not created:
            return

        metadata = data.get('metadata', {})
        plan_code = metadata.get('plan_code')
        billing_owner_id = metadata.get('billing_owner_id')

        if plan_code and billing_owner_id:
            try:
                plan = Plan.objects.get(code=plan_code, is_active=True)
                billing_owner = BillingOwner.objects.get(id=billing_owner_id)
                payment.billing_owner = billing_owner
                payment.save(update_fields=['billing_owner'])

                sub = Subscription.objects.filter(
                    billing_owner=billing_owner,
                    plan=plan,
                    status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
                ).first()

                if sub:
                    sub.status = SubscriptionStatus.ACTIVE
                    sub.save(update_fields=['status'])
                else:
                    now = timezone.now()
                    Subscription.objects.create(
                        billing_owner=billing_owner,
                        plan=plan,
                        status=SubscriptionStatus.ACTIVE,
                        current_period_start=now,
                        current_period_end=now + timezone.timedelta(days=30),
                    )
            except (Plan.DoesNotExist, BillingOwner.DoesNotExist):
                pass


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
)
@IdempotentTask(
    key_func=lambda self, event_data: task_idempotency_key(
        "handle_subscription_disable", event_data.get("data", {}).get("subscription_code", "")
    ),
    timeout=300,
)
def handle_subscription_disable_task(self, event_data):
    from .models import Subscription, SubscriptionStatus

    data = event_data.get('data', {})
    sub_code = data.get('subscription_code')
    if not sub_code:
        return

    Subscription.objects.filter(
        paystack_subscription_code=sub_code,
        status=SubscriptionStatus.ACTIVE,
    ).update(status=SubscriptionStatus.CANCELED)


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
)
@IdempotentTask(
    key_func=lambda self, event_data: task_idempotency_key(
        "handle_invoice_failed", event_data.get("data", {}).get("subscription_code", "")
    ),
    timeout=300,
)
def handle_invoice_failed_task(self, event_data):
    from .models import Subscription, SubscriptionStatus

    data = event_data.get('data', {})
    sub_code = data.get('subscription_code')
    if not sub_code:
        return

    Subscription.objects.filter(
        paystack_subscription_code=sub_code,
        status=SubscriptionStatus.ACTIVE,
    ).update(status=SubscriptionStatus.PAST_DUE)
