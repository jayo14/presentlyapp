# Manual RunSQL migration to fix the department column schema on production.
# Django's AlterField (migration 0024) was already recorded as applied in the
# django_migrations table, but the actual column rename never executed on Render's
# PostgreSQL DB (it still has 'department' text column instead of 'department_id' FK).
# This migration uses raw SQL to safely handle both states.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0024_alter_user_department'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                -- Only run if department_id column does NOT already exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department_id'
                ) THEN
                    -- Add the new FK column
                    ALTER TABLE users ADD COLUMN department_id bigint NULL
                        REFERENCES institutions_department(id)
                        ON DELETE SET NULL
                        DEFERRABLE INITIALLY DEFERRED;

                    -- Drop the old text column if it exists
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users'
                        AND column_name = 'department'
                        AND data_type = 'character varying'
                    ) THEN
                        ALTER TABLE users DROP COLUMN department;
                    END IF;
                END IF;
            END $$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department'
                ) THEN
                    ALTER TABLE users ADD COLUMN department varchar(255) NULL;
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department_id'
                ) THEN
                    ALTER TABLE users DROP COLUMN department_id;
                END IF;
            END $$;
            """,
        ),
    ]
