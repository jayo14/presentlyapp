import os
import django
import sys

# Append project dir so django finds settings
sys.path.append(os.path.dirname(os.path.abspath(__line__ if '__line__' in locals() else __file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

import resend
from django.conf import settings

def test_email():
    print("Testing email with settings:")
    print("RESEND_API_KEY configured:", bool(getattr(settings, 'RESEND_API_KEY', None)))
    print("DEFAULT_FROM_EMAIL:", settings.DEFAULT_FROM_EMAIL)
    
    if settings.DEBUG or not getattr(settings, 'RESEND_API_KEY', None):
        print("Using Django console mail since DEBUG=True or no RESEND_API_KEY...")
        from django.core.mail import send_mail
        try:
            sent = send_mail(
                subject='Presently App Email Test',
                message='This is a test email sent from Presently via Console backend.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['getpresently.io@gmail.com', 'sayojami2007@gmail.com'],
                fail_silently=False,
            )
            print(f"Success: send_mail returned {sent}")
        except Exception as e:
            print(f"Failed to send email via console backend: {e}")
    else:
        print("\nUsing Resend API...")
        resend.api_key = settings.RESEND_API_KEY
        try:
            r = resend.Emails.send({
              "from": settings.DEFAULT_FROM_EMAIL,
              "to": "getpresently.io@gmail.com",
              "subject": "Presently App Email Test (Resend)",
              "html": "<p>This is a test email sent from Presently via <strong>Resend</strong>.</p>"
            })
            print(f"Success! Resend returned: {r}")
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")

if __name__ == '__main__':
    test_email()
