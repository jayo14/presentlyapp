from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Plan, Subscription, Payment, BillingOwner, DepartmentSeat, AccountCredit
from institutions.models import Department


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class BillingOwnerSerializer(serializers.ModelSerializer):
    owner_user_email = serializers.EmailField(source='owner_user.email', read_only=True, default=None)
    owner_department_name = serializers.CharField(source='owner_department.name', read_only=True, default=None)
    owner_institution_name = serializers.CharField(source='owner_institution.short_name', read_only=True, default=None)

    class Meta:
        model = BillingOwner
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class DepartmentSeatSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, default=None)
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True, default=None)

    class Meta:
        model = DepartmentSeat
        fields = '__all__'


class AccountCreditSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, default=None)

    class Meta:
        model = AccountCredit
        fields = '__all__'


# ─── Admin serializers with full nested details ──────────────────────────

class UserSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    full_name = serializers.CharField()


class AdminBillingOwnerSerializer(serializers.ModelSerializer):
    owner_user = UserSummarySerializer(read_only=True)
    owner_department_name = serializers.CharField(source='owner_department.name', read_only=True, default=None)
    owner_institution_name = serializers.CharField(source='owner_institution.short_name', read_only=True, default=None)

    class Meta:
        model = BillingOwner
        fields = '__all__'


class AdminSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    billing_owner = AdminBillingOwnerSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'


class AdminPaymentSerializer(serializers.ModelSerializer):
    billing_owner = AdminBillingOwnerSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class AdminDepartmentSeatSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True, default=None)

    class Meta:
        model = DepartmentSeat
        fields = '__all__'


class AdminAccountCreditSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = AccountCredit
        fields = '__all__'


class CheckoutRequestSerializer(serializers.Serializer):
    plan_code = serializers.CharField()


class CheckoutResponseSerializer(serializers.Serializer):
    authorization_url = serializers.URLField()
    reference = serializers.CharField()


class CurrentPlanSerializer(serializers.Serializer):
    billing_owner = BillingOwnerSerializer(read_only=True)
    plan = PlanSerializer(read_only=True, allow_null=True)
    status = serializers.CharField(allow_null=True)
    course_limit = serializers.IntegerField(allow_null=True)
    seat_limit = serializers.IntegerField(allow_null=True)
    is_active = serializers.BooleanField()
