import requests
import json
import re

API_KEY = "re_Yg4Qx3J8_6XidYfQ6fQfQfQfQfQfQ" # Placeholder, I'll use env manually if I have to
# Actually I'll get it from env
import os

api_key = os.environ.get("RESEND_API_KEY")

def sync_one(template_id, html_content):
    url = f"https://api.resend.com/templates/{template_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "subject": "✦ Welcome to Presently",
        "html": html_content
    }
    res = requests.patch(url, headers=headers, json=payload)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    # Test with a super simple template
    sync_one("4fedf803-2b9b-480d-8f57-f9919276b90b", "<html><body><h1>Hello {{first_name}}</h1></body></html>")
