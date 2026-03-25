from django.db import migrations, models


def seed_feature_flags(apps, schema_editor):
    FeatureFlag = apps.get_model('system', 'FeatureFlag')
    FeatureFlag.objects.get_or_create(
        key='strict_venue_payload_validation',
        defaults={
            'name': 'Strict Venue Payload Validation',
            'description': 'Reject oversized venue boundary payloads before expensive processing.',
            'enabled': False,
        },
    )
    FeatureFlag.objects.get_or_create(
        key='venue_max_boundary_points',
        defaults={
            'name': 'Venue Max Boundary Points',
            'description': 'Maximum allowed coordinate points in venue boundary payloads.',
            'int_value': 500,
        },
    )
    FeatureFlag.objects.get_or_create(
        key='venue_max_payload_chars',
        defaults={
            'name': 'Venue Max Payload Chars',
            'description': 'Estimated payload-size cap (chars) for venue boundary payloads.',
            'int_value': 50000,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeatureFlag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=120, unique=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('enabled', models.BooleanField(default=False)),
                ('int_value', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['key'],
            },
        ),
        migrations.RunPython(seed_feature_flags, migrations.RunPython.noop),
    ]
