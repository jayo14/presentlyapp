from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0033_seed_billing_admin_permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendancesession',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
