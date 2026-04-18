from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('institutions', '0029_manualattendancerecord'),
      ('attendance', '0005_add_submission_and_record_models'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lookup
              ON users(email);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_users_email_lookup;",
        ),
        migrations.RunSQL(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_code_active
              ON attendance_sessions(session_code)
              WHERE is_active = true;
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_session_code_active;",
        ),
        migrations.RunSQL(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollment_student_course_active
              ON course_enrollments(student_id, course_id)
              WHERE is_active = true;
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_enrollment_student_course_active;",
        ),
        migrations.RunSQL(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_session_submission
              ON attendance_submissions(student_id, session_id);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_attendance_student_session_submission;",
        ),
    ]