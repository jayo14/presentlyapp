from django.db import migrations, models
import uuid


def _populate_session_uuids(apps, schema_editor):
    AttendanceSession = apps.get_model('institutions', 'AttendanceSession')
    for session in AttendanceSession.objects.all():
        session.uuid = uuid.uuid4()
        session.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0033_seed_billing_admin_permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendancesession',
            name='uuid',
            field=models.UUIDField(null=True, blank=True, editable=False),
        ),
        migrations.RunPython(_populate_session_uuids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='attendancesession',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
