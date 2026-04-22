from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0004_emaildeliverylog'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emaildeliverylog',
            name='status',
            field=models.CharField(
                choices=[
                    ('sent', 'Sent'),
                    ('failed', 'Failed'),
                    ('quota_exhausted', 'Quota Exhausted'),
                    ('throttled', 'Throttled'),
                ],
                default='failed',
                max_length=20,
            ),
        ),
    ]
