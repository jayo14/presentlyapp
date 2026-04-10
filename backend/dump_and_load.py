import os
import django
from django.core.management import call_command
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

tables_to_models = {
    'venues': 'institutions.Venue',
    'user_devices': 'accounts.UserDevice',
    'staff_profiles': 'institutions.StaffProfile',
    'email_verification_otps': 'institutions.EmailVerificationOTP',
    'course_enrollments': 'institutions.CourseEnrollment',
    'token_blacklist_blacklistedtoken': 'token_blacklist.BlacklistedToken',
    'token_blacklist_outstandingtoken': 'token_blacklist.OutstandingToken',
    'scheduled_reports': 'reports.ScheduledReport',
    'scheduled_reports_recipients': 'reports.ScheduledReportRecipient',
    'django_sessions': 'sessions.Session',
    'django_migrations': None, # loaddata doesn't handle migrations usually
    'users_groups': None, # ManyToMany
    'users_user_permissions': None, # ManyToMany
    'user_permissions': 'auth.Permission',
}

print("Dumping data from sqlite and loading to Postgres...")
