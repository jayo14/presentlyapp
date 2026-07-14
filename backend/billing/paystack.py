import hashlib
import hmac
import json

import requests
from django.conf import settings


PAYSTACK_BASE = 'https://api.paystack.co'


def _headers():
    return {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json',
    }


def initialize_transaction(email, amount_kobo, callback_url, metadata=None):
    url = f'{PAYSTACK_BASE}/transaction/initialize'
    payload = {
        'email': email,
        'amount': str(amount_kobo),
        'callback_url': callback_url,
    }
    if metadata:
        payload['metadata'] = metadata
    resp = requests.post(url, json=payload, headers=_headers())
    resp.raise_for_status()
    return resp.json()


def verify_transaction(reference):
    url = f'{PAYSTACK_BASE}/transaction/verify/{reference}'
    resp = requests.get(url, headers=_headers())
    resp.raise_for_status()
    return resp.json()


def create_paystack_plan(plan):
    url = f'{PAYSTACK_BASE}/plan'
    interval_map = {
        'MONTHLY': 'monthly',
        'YEARLY': 'annually',
        'QUARTERLY': 'quarterly',
        'WEEKLY': 'weekly',
    }
    payload = {
        'name': plan.name,
        'amount': plan.price_kobo,
        'interval': interval_map.get(plan.interval, 'monthly'),
    }
    resp = requests.post(url, json=payload, headers=_headers())
    resp.raise_for_status()
    return resp.json()


def create_subscription(customer_email, paystack_plan_code):
    url = f'{PAYSTACK_BASE}/subscription'
    payload = {
        'customer': customer_email,
        'plan': paystack_plan_code,
    }
    resp = requests.post(url, json=payload, headers=_headers())
    resp.raise_for_status()
    return resp.json()


def verify_webhook_signature(payload_body, signature_header):
    if not signature_header:
        return False
    computed = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(),
        payload_body,
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(computed, signature_header)
