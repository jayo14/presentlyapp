from rest_framework import serializers
from .models import Plan, Subscription, Payment, BillingOwner


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class BillingOwnerSerializer(serializers.ModelSerializer):
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
