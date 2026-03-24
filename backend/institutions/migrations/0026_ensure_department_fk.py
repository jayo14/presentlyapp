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
            sql="""
            DO $$
            BEGIN
                -- Ensure department_id FK column exists and points to 'departments'
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department_id'
                ) THEN
                    -- Column is missing: add it with correct FK to 'departments' table
                    ALTER TABLE users ADD COLUMN department_id bigint NULL;
                    ALTER TABLE users
                        ADD CONSTRAINT users_department_id_fk
                        FOREIGN KEY (department_id)
                        REFERENCES departments(id)
                        ON DELETE SET NULL
                        DEFERRABLE INITIALLY DEFERRED;
                END IF;

                -- Clean up any lingering old text 'department' column
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department'
                    AND data_type IN ('character varying', 'text')
                ) THEN
                    ALTER TABLE users DROP COLUMN department;
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
