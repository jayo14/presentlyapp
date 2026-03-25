import os
import django
import sys
import requests
import json

# Append project dir so django finds settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

from django.conf import settings

def test_template_email():
    template_id = getattr(settings, 'RESEND_TEMPLATE_MAP', {}).get('emails/welcome_email.html')
    api_key = settings.RESEND_API_KEY
    
    print(f"Discovered Template UUID: {template_id}")
    print("Testing via Direct REST API call...")
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": "johnayobami77@proton.me",
        "subject": "✦ Welcome to Presently (REST Revert)",
        "template": {
            "id": template_id,
            "variables": {
                "first_name": "Ayobami",
                "otp_code": "123456",
                "dashboard_url": "https://getpresently.com.ng/dashboard",
                "support_url": "https://getpresently.com.ng/support"
            }
        }
    }
    
    print(f"Sending payload to {url}...")
    response = requests.post(url, headers=headers, json=payload)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_template_email()
