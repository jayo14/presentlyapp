import os
import django
import sys
import resend

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

from django.conf import settings

resend.api_key = settings.RESEND_API_KEY
t_id = '4fedf803-2b9b-480d-8f57-f9919276b90b'

try:
    print(f"Fetching template: {t_id}")
    data = resend.Templates.get(t_id)
    html = data.get('html', '')
    print(f"HTML Length: {len(html)}")
    with open('fetched_template.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Success: Template content saved to fetched_template.html")
except Exception as e:
    print(f"Error: {e}")
