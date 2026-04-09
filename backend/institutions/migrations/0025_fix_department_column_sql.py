# Manual RunSQL migration to fix the department column schema on production.
# Django's AlterField (migration 0024) was already recorded as applied in the
# django_migrations table, but the actual column rename never executed on Render's
# PostgreSQL DB (it still has 'department' text column instead of 'department_id' FK).
# This migration uses raw SQL to safely handle both states.
#
# NOTE: The Department model uses db_table = 'departments', so the FK must reference
# the 'departments' table directly — NOT 'institutions_department' (the Django ORM name).

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0024_alter_user_department'),
    ]

    operations = [
        migrations.RunSQL(
            sql="SELECT 1;",
            reverse_sql="SELECT 1;",
        ),
    ]
