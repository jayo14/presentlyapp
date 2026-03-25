import os
import django
import sys
import requests
import re
import json

# Append project dir so django finds settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

from django.conf import settings

def convert_to_handlebars(html):
    """Convert Django template tags to Resend Handlebars."""
    # 0. Strip load static / other tags first
    html = re.sub(r'\{% *load .*?%\}', '', html, flags=re.IGNORECASE)
    
    # 1. Standardize names before regex
    html = html.replace('user.full_name', 'first_name')
    html = html.replace('user.first_name', 'first_name')
    html = html.replace('user_name', 'first_name')
    
    # 2. Year: {% now "Y" %} -> 2026
    html = re.sub(r'\{% *now ["\']Y["\'] *%\}', '2026', html, flags=re.IGNORECASE)

    # 3. Simplify Variables: Catch {{ var | filters }} and simplify to {{var}}
    html = re.sub(r'\{\{ *([a-zA-Z0-9_.]+)(?:\|.*?)? *\}\}', r'{{\1}}', html)
    
    # 4. Strip ALL remaining {% %} Django tags (multiline)
    html = re.sub(r'\{%.*?%\}', '', html, flags=re.DOTALL)
    
    # 5. Whitelist check for variables
    supported_vars = [
        'first_name', 'otp_code', 'dashboard_url', 'support_url', 'privacy_url', 
        'resend_url', 'verify_url', 'reset_link', 'device_name', 'browser', 'os', 
        'ip_address', 'login_time', 'course_code', 'course_name', 'start_time', 
        'end_time', 'venue_name', 'attendance_status', 'check_in_time', 'expiry_minutes',
        'inviter_name', 'invitation_link', 'institution_name'
    ]
    
    def strip_unsupported(match):
        var_content = match.group(1).strip()
        pure_var = var_content.split('|')[0].strip()
        if pure_var in supported_vars:
            return f"{{{{{pure_var}}}}}"
        return "" 

    html = re.sub(r'\{\{(.*?)\}\}', strip_unsupported, html, flags=re.DOTALL)
    
    # 6. STRIP style block to test if CSS is the issue
    html = re.sub(r'<style.*?>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)

    # 7. STRIP HTML comments
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
    
    return html

def push_templates():
    print("Pushing modernized local templates to Resend Hosted Templates via REST...")
    
    template_map = getattr(settings, 'RESEND_TEMPLATE_MAP', {})
    api_key = getattr(settings, 'RESEND_API_KEY', None)
    
    if not template_map:
        print("❌ Error: RESEND_TEMPLATE_MAP is empty in settings!")
        return

    print(f"  Found {len(template_map)} templates in map.")
    
    for local_path, resend_id in template_map.items():
        # Correctly locate the file
        full_path = os.path.join(settings.BASE_DIR, "templates", local_path)
        if not os.path.exists(full_path):
            full_path = os.path.join(settings.BASE_DIR, local_path)
            
        if not os.path.exists(full_path):
            print(f"  ⚠️ Skipping {local_path} (File not found at {full_path})")
            continue
            
        print(f"  - Syncing {local_path} -> {resend_id}")
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                html = f.read()
            
            fixed_html = convert_to_handlebars(html)
            base_name = os.path.basename(local_path).replace('.html', '').lower()
            safe_name = f"presently_{base_name}"
            
            try:
                # Based on diagnostic success, push fixed_html and a simple subject
                res = requests.patch(
                    f"https://api.resend.com/templates/{resend_id}",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "html": fixed_html,
                        "subject": "Presently - Notification"
                    }
                )
                if res.status_code == 200:
                    print(f"    [OK] Updated: {safe_name}")
                else:
                    print(f"    [FAIL] {safe_name} - {res.status_code} {res.text}")
            except Exception as e:
                print(f"    [ERROR] {e}")
                
        except Exception as e:
            print(f"    [ERROR] Error syncing {local_path}: {e}")

if __name__ == '__main__':
    push_templates()
