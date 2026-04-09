from django.db import migrations


def seed_at_risk_alerts_flag(apps, schema_editor):
    FeatureFlag = apps.get_model('system', 'FeatureFlag')
    FeatureFlag.objects.get_or_create(
        key='at_risk_alerts',
        defaults={
            'name': 'At-Risk Alerts',
            'description': 'Show at-risk student alerts and bulk reminder actions in lecturer analytics.',
            'enabled': True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0002_featureflag'),
    ]

    operations = [
        migrations.RunPython(seed_at_risk_alerts_flag, migrations.RunPython.noop),
    ]
