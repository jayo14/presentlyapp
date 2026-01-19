# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Ensure standard encoding
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Set work directory
WORKDIR /app

# Install system dependencies
# libpq-dev: for postgres support
# gcc: for compiling python extensions
# netcat-openbsd: utility often used for checking if services are up
# gettext: for django translation compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    netcat-openbsd \
    gettext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
# We use a dummy SQLite database and secret key to avoid connection errors during build time.
# Setting SECRET_KEY here ensures it is available for this command but doesn't persist in the image environment.
RUN DATABASE_URL=sqlite://:memory: SECRET_KEY=dummy_secret_key_for_build python manage.py collectstatic --noinput

# Create a non-root user and switch to it for security
RUN addgroup --system django && adduser --system --ingroup django django
RUN chown -R django:django /app

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER django

# Expose port 8000
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Start Gunicorn
# --access-logfile - and --error-logfile - redirect logs to stdout/stderr
CMD ["gunicorn", "presently.wsgi:application", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]
