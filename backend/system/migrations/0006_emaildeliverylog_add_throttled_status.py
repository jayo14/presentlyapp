from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0005_rename_system_email_provider_b51f5a_idx_system_emai_provide_f23901_idx_and_more'),
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