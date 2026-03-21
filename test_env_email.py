import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')

import django
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email():
    print("Testing email with settings:")
    print("EMAIL_HOST =", settings.EMAIL_HOST)
    print("EMAIL_PORT =", settings.EMAIL_PORT)
    print("EMAIL_HOST_USER =", settings.EMAIL_HOST_USER)
    
    try:
        sent = send_mail(
            subject='Presently App SMTP Direct Test',
            message='This is a direct SMTP test.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['getpresently.io@gmail.com', 'sayojami2007@gmail.com'],
            fail_silently=False,
        )
        print(f"Success: send_mail returned {sent}")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == '__main__':
    test_email()
