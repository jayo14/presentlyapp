import os
import django
import sys

# Append project dir so django finds settings
sys.path.append(os.path.dirname(os.path.abspath(__line__ if '__line__' in locals() else __file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
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
            subject='Presently App Email Test',
            message='This is a test email sent from Presently via SMTP (Brevo).',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['getpresently.io@gmail.com', 'sayojami2007@gmail.com'], # test sending to self
            fail_silently=False,
        )
        print(f"Success: send_mail returned {sent}")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == '__main__':
    test_email()
