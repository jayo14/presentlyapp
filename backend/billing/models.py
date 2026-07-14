from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class BillingOwnerType(models.TextChoices):
    SELF = 'SELF', 'Self'
    DEPARTMENT = 'DEPARTMENT', 'Department'
    INSTITUTION = 'INSTITUTION', 'Institution'


class PlanInterval(models.TextChoices):
    MONTHLY = 'MONTHLY', 'Monthly'
    YEARLY = 'YEARLY', 'Yearly'
    ONE_TIME = 'ONE_TIME', 'One Time'
    CUSTOM = 'CUSTOM', 'Custom'


class SubscriptionStatus(models.TextChoices):
    TRIALING = 'TRIALING', 'Trialing'
    ACTIVE = 'ACTIVE', 'Active'
    PAST_DUE = 'PAST_DUE', 'Past Due'
    CANCELED = 'CANCELED', 'Canceled'
    EXPIRED = 'EXPIRED', 'Expired'


class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'


class Plan(models.Model):
    code = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    billing_owner_type = models.CharField(
        max_length=20, choices=BillingOwnerType.choices, default=BillingOwnerType.SELF
    )
    price_kobo = models.IntegerField()
    interval = models.CharField(max_length=20, choices=PlanInterval.choices)
    seat_limit = models.IntegerField(null=True, blank=True)
    course_limit = models.IntegerField(null=True, blank=True)
    features = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'billing_plans'
        ordering = ['price_kobo']

    def __str__(self):
        return f"{self.name} ({self.code})"


class BillingOwner(models.Model):
    owner_type = models.CharField(max_length=20, choices=BillingOwnerType.choices)
    owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='billing_owners'
    )
    owner_department = models.ForeignKey(
        'institutions.Department', on_delete=models.CASCADE,
        null=True, blank=True, related_name='billing_owners'
    )
    owner_institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.CASCADE,
        null=True, blank=True, related_name='billing_owners'
    )

    class Meta:
        db_table = 'billing_owners'
        indexes = [
            models.Index(fields=['owner_type']),
        ]

    def clean(self):
        fks = [
            bool(self.owner_user),
            bool(self.owner_department),
            bool(self.owner_institution),
        ]
        if sum(fks) != 1:
            raise ValidationError(
                'Exactly one of owner_user, owner_department, or owner_institution must be set.'
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.owner_user:
            return f"SELF:{self.owner_user.email}"
        if self.owner_department:
            return f"DEPT:{self.owner_department.name}"
        if self.owner_institution:
            return f"INST:{self.owner_institution.short_name}"
        return f"BillingOwner:{self.id}"


class Subscription(models.Model):
    billing_owner = models.ForeignKey(
        BillingOwner, on_delete=models.CASCADE, related_name='subscriptions'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.TRIALING)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    paystack_subscription_code = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'billing_subscriptions'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['billing_owner', 'status']),
        ]

    def available_seats(self):
        if self.plan.seat_limit is None:
            return None
        used = self.seats.filter(is_active=True).count()
        remaining = self.plan.seat_limit - used
        return max(remaining, 0)

    def __str__(self):
        return f"{self.billing_owner} -> {self.plan.code} ({self.status})"


class DepartmentSeat(models.Model):
    subscription = models.ForeignKey(
        Subscription, on_delete=models.CASCADE, related_name='seats'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='department_seats'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'billing_department_seats'
        unique_together = [['subscription', 'user']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.email} -> {self.subscription.plan.code}"


class AccountCredit(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='account_credits'
    )
    amount_kobo = models.IntegerField()
    reason = models.CharField(max_length=200)
    consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'billing_account_credits'

    def __str__(self):
        return f"{self.user.email}: {self.amount_kobo}k ({'consumed' if self.consumed else 'available'})"


class Payment(models.Model):
    subscription = models.ForeignKey(
        Subscription, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payments'
    )
    billing_owner = models.ForeignKey(
        BillingOwner, on_delete=models.CASCADE, related_name='payments'
    )
    amount_kobo = models.IntegerField()
    currency = models.CharField(max_length=3, default='NGN')
    paystack_reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    raw_webhook_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'billing_payments'
        indexes = [
            models.Index(fields=['paystack_reference']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.paystack_reference} - {self.amount_kobo}k ({self.status})"
