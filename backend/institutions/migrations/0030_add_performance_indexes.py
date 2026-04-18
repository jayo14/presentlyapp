from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('institutions', '0029_manualattendancerecord'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lookup
              ON users(email);

            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_code_active
              ON institutions_attendancesession(session_code)
              WHERE is_active = true;

            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollment_student_course_active
              ON institutions_courseenrollment(student_id, course_id)
              WHERE is_active = true;

            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_session_submission
              ON attendance_attendancesubmission(student_id, session_id);
            """,
            reverse_sql="""
            DROP INDEX IF EXISTS idx_users_email_lookup;
            DROP INDEX IF EXISTS idx_session_code_active;
            DROP INDEX IF EXISTS idx_enrollment_student_course_active;
            DROP INDEX IF EXISTS idx_attendance_student_session_submission;
            """,
        ),
    ]