#!/usr/bin/env python
"""
Script to generate a Django SECRET_KEY
Usage: python generate_secret_key.py
"""

from django.core.management.utils import get_random_secret_key

if __name__ == "__main__":
    secret_key = get_random_secret_key()
    print("\n" + "="*70)
    print("Generated Django SECRET_KEY:")
    print("="*70)
    print(f"\n{secret_key}\n")
    print("="*70)
    print("\nAdd this to your .env file or Django settings:")
    print(f"SECRET_KEY={secret_key}")
    print("="*70 + "\n")
