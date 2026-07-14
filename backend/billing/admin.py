from django.contrib import admin
from .models import Plan, BillingOwner, Subscription, Payment, AccountCredit, DepartmentSeat


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'price_kobo', 'interval', 'is_active']
    search_fields = ['code', 'name']


@admin.register(BillingOwner)
class BillingOwnerAdmin(admin.ModelAdmin):
    list_display = ['owner_type', 'owner_user', 'owner_department', 'owner_institution']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['billing_owner', 'plan', 'status', 'current_period_start', 'current_period_end']
    list_filter = ['status']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['paystack_reference', 'amount_kobo', 'currency', 'status', 'paid_at']
    list_filter = ['status']


@admin.register(AccountCredit)
class AccountCreditAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount_kobo', 'reason', 'consumed', 'created_at']


@admin.register(DepartmentSeat)
class DepartmentSeatAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription', 'is_active', 'assigned_at']
    list_filter = ['is_active']
