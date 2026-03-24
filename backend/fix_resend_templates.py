import os
import django
import sys
import resend

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

def fix_welcome_template():
    t_id = '4fedf803-2b9b-480d-8f57-f9919276b90b'
    print(f"Uploading fixed HTML to template: {t_id}")
    
    try:
        # 1. Read the local Django template
        with open('templates/emails/welcome_email.html', 'r', encoding='utf-8') as f:
            html = f.read()

        # 2. Convert to Resend-Safe Handlebars
        import re
        
        # Hardcode fallback URLs to avoid 'Undefined Variable' enrollment errors in Resend API
        html = html.replace('{{ user.full_name|default:"Student" }}', '{{{first_name}}}')
        html = html.replace('{{ first_name|default:"Student" }}', '{{{first_name}}}')
        
        # Replace URLs with hardcoded strings for the test
        html = re.sub(r'\{\{ *dashboard_url.*?\}\}', 'https://getpresently.com.ng/dashboard', html)
        html = re.sub(r'\{\{ *support_url.*?\}\}', 'https://getpresently.com.ng/support', html)
        html = re.sub(r'\{\{ *privacy_url.*?\}\}', 'https://getpresently.com.ng/support', html)
        html = re.sub(r'\{\{ *institution_url.*?\}\}', '#', html)
        html = re.sub(r'\{% *now "Y" *%\}', '2026', html)
        
        # Strip ALL other Django remains
        html = re.sub(r'\{\{.*?\}\}', '---', html)
        html = re.sub(r'\{%.*?%\}', '', html)

        # 3. Push to Resend (Using ONLY first_name variable which we know is accepted)
        resend.Templates.update({
            "id": t_id,
            "name": "Welcome",
            "html": html,
        })

        print("Success: Welcome template updated and published on Resend!")
        
    except Exception as e:
        print(f"Error during template sync: {e}")



if __name__ == '__main__':
    fix_welcome_template()
