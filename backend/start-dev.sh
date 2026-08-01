#!/bin/sh
set -e
cd "$(dirname "$0")"
source venv/bin/activate
echo "Starting Django dev server on 0.0.0.0:8000..."
exec python manage.py runserver 0.0.0.0:8000
