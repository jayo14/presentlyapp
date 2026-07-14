from django.db import migrations


def seed(apps, schema_editor):
    from institutions.rbac import seed_permissions_and_roles
    seed_permissions_and_roles()


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0032_backfill_course_memberships'),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
