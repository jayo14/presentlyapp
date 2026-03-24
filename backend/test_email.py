import os
import sys

# Append project dir so django finds settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')

import django
django.setup()

import resend
from django.conf import settings

def test_email():
    print("Testing 'welcome_email' template using Resend API...")
    
    # Force Resend API to be used regardless of DEBUG setting
    resend.api_key = settings.RESEND_API_KEY
    
    template_id = getattr(settings, 'RESEND_TEMPLATE_MAP', {}).get('emails/welcome_email.html')
    
    if not template_id:
        print("Error: 'emails/welcome_email.html' is not mapped in RESEND_TEMPLATE_MAP.")
        return
        
    print(f"Discovered Template UUID: {template_id}")
    
    payload = {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": "getpresently.io@gmail.com",
        "subject": "✦ Welcome to Presently",
        "template": {
            "id": template_id,
            "variables": {
                "user": {
                    "full_name": "Ayobami"
                },
                "dashboard_url": "https://getpresently.com.ng/dashboard",
                "support_url": "https://getpresently.com.ng/support"
            }
        }
    }
    
    try:
        print("\nSending through Resend...")
        response = resend.Emails.send(payload)
        print(f"Success! Resend returned: {response}")
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")

if __name__ == '__main__':
    test_email()
