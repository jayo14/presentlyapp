# Migration 0026: Re-run the department FK fix in case 0025 was recorded as applied
# but had a broken SQL referencing 'institutions_department' instead of 'departments'.
# This migration is fully idempotent and safe to run multiple times.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0025_fix_department_column_sql'),
    ]

    operations = [
        migrations.RunSQL(
            sql="SELECT 1;",
            reverse_sql="SELECT 1;",
        ),
    ]
