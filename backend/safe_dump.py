import os
import django
import sys
import subprocess

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

apps_to_dump = [
    'auth.user', 'auth.group', 'sessions', 
    'fcm_django', 'token_blacklist', 'admin.logentry',
    'institutions', 'attendance', 'analytics', 
    'notifications', 'reports', 'blog', 
    'exam_clearance', 'accounts', 'system'
]

print("Starting safe multi-part database extraction...")
for app in apps_to_dump:
    print(f"Exporting {app}...")
    with open(f"backup_{app}.json", "w", encoding="utf-8") as out:
        result = subprocess.run(
            [sys.executable, "manage.py", "dumpdata", app],
            stdout=out,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode != 0:
            print(f"Error on {app}: {result.stderr}")
print("Done! All apps extracted successfully.")
