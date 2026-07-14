from django.db import migrations


DEPARTMENT_PLANS = [
    {
        'code': 'dept_starter',
        'name': 'Department Starter',
        'billing_owner_type': 'DEPARTMENT',
        'price_kobo': 20_000_000,
        'interval': 'YEARLY',
        'seat_limit': 10,
        'course_limit': None,
        'features': {
            'analytics': True,
            'csv_export': True,
            'pdf_export': True,
            'ai_insights': False,
            'white_label': False,
            'priority_support': False,
        },
    },
    {
        'code': 'dept_growth',
        'name': 'Department Growth',
        'billing_owner_type': 'DEPARTMENT',
        'price_kobo': 45_000_000,
        'interval': 'YEARLY',
        'seat_limit': 25,
        'course_limit': None,
        'features': {
            'analytics': True,
            'csv_export': True,
            'pdf_export': True,
            'ai_insights': True,
            'white_label': False,
            'priority_support': True,
        },
    },
    {
        'code': 'dept_professional',
        'name': 'Department Professional',
        'billing_owner_type': 'DEPARTMENT',
        'price_kobo': 80_000_000,
        'interval': 'YEARLY',
        'seat_limit': 50,
        'course_limit': None,
        'features': {
            'analytics': True,
            'csv_export': True,
            'pdf_export': True,
            'ai_insights': True,
            'white_label': True,
            'priority_support': True,
        },
    },
    {
        'code': 'dept_enterprise',
        'name': 'Department Enterprise',
        'billing_owner_type': 'DEPARTMENT',
        'price_kobo': 0,
        'interval': 'CUSTOM',
        'seat_limit': None,
        'course_limit': None,
        'features': {
            'analytics': True,
            'csv_export': True,
            'pdf_export': True,
            'ai_insights': True,
            'white_label': True,
            'priority_support': True,
        },
    },
]


def seed_department_plans(apps, schema_editor):
    Plan = apps.get_model('billing', 'Plan')
    for data in DEPARTMENT_PLANS:
        Plan.objects.update_or_create(
            code=data['code'],
            defaults=data,
        )


def reverse_seed(apps, schema_editor):
    Plan = apps.get_model('billing', 'Plan')
    Plan.objects.filter(code__in=[p['code'] for p in DEPARTMENT_PLANS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0002_accountcredit_departmentseat'),
    ]

    operations = [
        migrations.RunPython(seed_department_plans, reverse_seed, elidable=True),
    ]
