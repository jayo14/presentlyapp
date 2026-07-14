from django.db import migrations


def _safe_run(sql, reverse_sql):
    def forwards(apps, schema_editor):
        try:
            schema_editor.execute(sql)
        except Exception:
            pass

    def backwards(apps, schema_editor):
        try:
            schema_editor.execute(reverse_sql)
        except Exception:
            pass

    return migrations.RunPython(forwards, backwards, elidable=True)


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('institutions', '0029_manualattendancerecord'),
        ('attendance', '0005_add_submission_and_record_models'),
    ]

    operations = [
        _safe_run(
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lookup ON users(email);",
            "DROP INDEX IF EXISTS idx_users_email_lookup;",
        ),
        _safe_run(
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_code_active ON attendance_sessions(session_code) WHERE is_active = true;",
            "DROP INDEX IF EXISTS idx_session_code_active;",
        ),
        _safe_run(
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollment_student_course_active ON course_enrollments(student_id, course_id) WHERE is_active = true;",
            "DROP INDEX IF EXISTS idx_enrollment_student_course_active;",
        ),
        _safe_run(
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_session_submission ON attendance_submissions(student_id, session_id);",
            "DROP INDEX IF EXISTS idx_attendance_student_session_submission;",
        ),
    ]
