from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0003_seed_at_risk_alerts_flag'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailDeliveryLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(max_length=50)),
                ('status', models.CharField(choices=[('sent', 'Sent'), ('failed', 'Failed'), ('quota_exhausted', 'Quota Exhausted')], default='failed', max_length=20)),
                ('template_key', models.CharField(blank=True, max_length=120, null=True)),
                ('subject', models.CharField(blank=True, default='', max_length=255)),
                ('recipients', models.JSONField(blank=True, default=list)),
                ('recipient_count', models.PositiveIntegerField(default=0)),
                ('error_message', models.TextField(blank=True, default='')),
                ('provider_response', models.JSONField(blank=True, default=dict)),
                ('duration_ms', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['provider'], name='system_email_provider_b51f5a_idx'),
                    models.Index(fields=['status'], name='system_email_status_fc4698_idx'),
                    models.Index(fields=['template_key'], name='system_email_template_0fe77f_idx'),
                    models.Index(fields=['created_at'], name='system_email_created_18d0f4_idx'),
                ],
            },
        ),
    ]
