from django.test import TestCase
from django.core.exceptions import ValidationError

from .models import Plan, BillingOwner, BillingOwnerType, PlanInterval


class PlanModelTest(TestCase):
    def test_create_plan(self):
        plan = Plan.objects.create(
            code='lecturer_pro_monthly',
            name='Lecturer Pro Monthly',
            price_kobo=300000,
            interval=PlanInterval.MONTHLY,
            course_limit=100,
        )
        self.assertEqual(str(plan), 'Lecturer Pro Monthly (lecturer_pro_monthly)')
        self.assertEqual(plan.price_kobo, 300000)


class BillingOwnerModelTest(TestCase):
    def test_exactly_one_owner_required(self):
        with self.assertRaises(ValidationError):
            owner = BillingOwner(owner_type=BillingOwnerType.SELF)
            owner.clean()

    def test_create_self_owner_requires_user_fk(self):
        with self.assertRaises(ValidationError):
            BillingOwner.objects.create(owner_type=BillingOwnerType.SELF)
