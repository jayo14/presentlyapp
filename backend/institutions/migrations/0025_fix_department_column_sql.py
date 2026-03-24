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
            sql="""
            DO $$
            BEGIN
                -- Only run if department_id column does NOT already exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department_id'
                ) THEN
                    -- Add the new FK column referencing the actual table name 'departments'
                    ALTER TABLE users ADD COLUMN department_id bigint NULL;
                    ALTER TABLE users
                        ADD CONSTRAINT users_department_id_fk
                        FOREIGN KEY (department_id)
                        REFERENCES departments(id)
                        ON DELETE SET NULL
                        DEFERRABLE INITIALLY DEFERRED;

                    -- Drop the old text column if it still exists
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users'
                        AND column_name = 'department'
                        AND data_type IN ('character varying', 'text')
                    ) THEN
                        ALTER TABLE users DROP COLUMN department;
                    END IF;
                ELSE
                    -- department_id already exists; just ensure the old text column is gone
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'users'
                        AND column_name = 'department'
                        AND data_type IN ('character varying', 'text')
                    ) THEN
                        ALTER TABLE users DROP COLUMN department;
                    END IF;
                END IF;
            END $$;
            """,
            reverse_sql="""
            DO $$
            BEGIN
                -- Re-add the old text column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users'
                    AND column_name = 'department'
                ) THEN
                    ALTER TABLE users ADD COLUMN department varchar(255) NULL;
                END IF;
                -- Drop the FK column if it exists
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
