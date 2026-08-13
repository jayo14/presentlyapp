import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv(override=False)  # Don't override env vars already set by the host (Render)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-$zkoz6=hl_t6%s8(yh7f@ve4lobpx!qe5l3-##y%jh(fpdq07^')

# SECURITY WARNING: don't run with debug turned on in production!
# Default to False for production, True only if explicitly set for development
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Admin URL security - use a non-default, unguessable path
ADMIN_URL = os.environ.get('ADMIN_URL', 'django-admin/')

# CSRF Settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True

# Session cookie security
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# HSTS Settings
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True


def _csv_env(*names, default='*'):
    for name in names:
        raw = os.environ.get(name)
        if raw:
            return [host.strip() for host in raw.split(',') if host.strip()]
    return [host.strip() for host in default.split(',') if host.strip()]


ALLOWED_HOSTS = _csv_env('ALLOWED_HOSTS', 'DJANGO_ALLOWED_HOSTS', default='*')

# Site Configuration
SITE_NAME = os.environ.get('SITE_NAME', 'Presently')


# Application definition

INSTALLED_APPS = [
    'corsheaders',
    # Django Unfold (must be before django.contrib.admin)
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'drf_yasg',
    'fcm_django',

    # Presently apps
    'presently.apps.PresentlyConfig',
    'institutions.apps.InstitutionsConfig',
    'attendance',
    'analytics',
    'notifications',
    'reports',
    'blog',
    'exam_clearance',
    'accounts',
    'system',
    'billing',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'presently.utils.RemoveWWWMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'presently.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'presently.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases



# Redis Cache Configuration
if os.environ.get('REDIS_URL'):
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": os.environ.get('REDIS_URL'),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "IGNORE_EXCEPTIONS": True,
            }
        }
    }
else:
    # In development without Redis, use locmem cache
    # Note: Rate limiting may not work reliably with locmem in multi-process environments
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "presently-cache",
        }
    }

# Rate-limiting configuration - disable in development for easier testing
RATELIMIT_ENABLE = os.environ.get('RATELIMIT_ENABLE', 'False' if DEBUG else 'True') == 'True'

# Default to SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Override with PostgreSQL if DATABASE_URL is set
if os.environ.get('DATABASE_URL'):
    DATABASES['default'] = dj_database_url.config(
        conn_max_age=600,  # Keep PostgreSQL connections alive for 10 minutes
        conn_health_checks=True,
        ssl_require=True,
    )
    DATABASES['default']['OPTIONS'] = {
        'connect_timeout': 10,
        'options': '-c statement_timeout=30000',
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use manifest-based storage in production, but keep development tolerant of
# uncollected static files so the admin login can render without collectstatic.
if DEBUG:
    staticfiles_storage_backend = 'django.contrib.staticfiles.storage.StaticFilesStorage'
else:
    staticfiles_storage_backend = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# WhiteNoise storage to serve compressed and cached static files
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": staticfiles_storage_backend,
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# GIS Library settings removed - no longer using PostGIS/GeoDjango

# Custom User Model
AUTH_USER_MODEL = 'institutions.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 30,
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration for frontend
FRONTEND_ORIGIN = os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')

# For development: Allow all origins. For production: restrict to specific origins
if DEBUG or os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True':
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = []
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'https://getpresently.com.ng',
        FRONTEND_ORIGIN,
    ]

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "https://*.app.github.dev",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://getpresently.com.ng",
    "https://www.getpresently.com.ng",
]

# Security Settings for Proxy (Render)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
    USE_X_FORWARDED_PORT = True

CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'HEAD',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
    'authorization',
]

# Email Configuration (Resend API)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")

# Resend hosted template IDs by logical key.
RESEND_TEMPLATES = {
    "welcome":              os.environ.get("RESEND_TEMPLATE_WELCOME",              "4fedf803-2b9b-480d-8f57-f9919276b90b"),
    "verify_email":         os.environ.get("RESEND_TEMPLATE_VERIFY_EMAIL",         "68c56ecb-1b03-4a58-82df-3f67fdb764a7"),
    "login_alert":          os.environ.get("RESEND_TEMPLATE_LOGIN_ALERT",          "6448d19b-9c97-4b3e-9271-788de81c782c"),
    "reset_password":       os.environ.get("RESEND_TEMPLATE_RESET_PASSWORD",       "57124568-95c4-420d-bbf5-149e46a47c6d"),
    "session_live":         os.environ.get("RESEND_TEMPLATE_SESSION_LIVE",         "77951f07-aa7e-4bad-9159-c31d1cb0c0ac"),
    "newsletter_welcome":   os.environ.get("RESEND_TEMPLATE_NEWSLETTER_WELCOME",   "5799b664-9b3b-4eea-9f8c-a94adb1bcd68"),
    "attendance_confirmed": os.environ.get("RESEND_TEMPLATE_ATTENDANCE_CONFIRMED", "d7ca7188-fee1-4208-827d-999a2b25b367"),
    "staff_access_invitation": os.environ.get("RESEND_TEMPLATE_STAFF_ACCESS_INVITATION", "19e8c6e6-58af-480c-aa62-21973af09664"),
}

# Compatibility map for legacy call sites/scripts.
RESEND_TEMPLATE_MAP = {
    "emails/welcome_email.html": RESEND_TEMPLATES["welcome"],
    "emails/welcome_otp.html": RESEND_TEMPLATES["verify_email"],
    "emails/new_device_alert.html": RESEND_TEMPLATES["login_alert"],
    "emails/password_reset.html": RESEND_TEMPLATES["reset_password"],
    "emails/attendance_session_created.html": RESEND_TEMPLATES["session_live"],
    "emails/newsletter_welcome.html": RESEND_TEMPLATES["newsletter_welcome"],
    "emails/attendance_marked.html": RESEND_TEMPLATES["attendance_confirmed"],
}

GMAIL_API_REFRESH_TOKEN = os.environ.get('GMAIL_API_REFRESH_TOKEN', '')
USE_GMAIL_API_EMAIL_BACKEND = os.environ.get('USE_GMAIL_API_EMAIL_BACKEND', 'False') == 'True'

# Determine which email backend to use.
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print('INFO: DEBUG=True; using console email backend.')
else:
    EMAIL_BACKEND = 'presently.email_failover.FailoverEmailBackend'
    print("INFO: Using multi-provider failover email backend.")

# Provider credentials used by presently.email_failover
SENDPULSE_SMTP_USERNAME = os.environ.get('SENDPULSE_SMTP_USERNAME')
SENDPULSE_SMTP_PASSWORD = os.environ.get('SENDPULSE_SMTP_PASSWORD')

MAILJET_SMTP_USERNAME = os.environ.get('MAILJET_SMTP_USERNAME')
MAILJET_SMTP_PASSWORD = os.environ.get('MAILJET_SMTP_PASSWORD')

MAILTRAP_API_TOKEN = os.environ.get('MAILTRAP_API_TOKEN')

AHASEND_SMTP_USERNAME = os.environ.get('AHASEND_SMTP_USERNAME')
AHASEND_SMTP_PASSWORD = os.environ.get('AHASEND_SMTP_PASSWORD')

GMAIL_SMTP_USER = os.environ.get('GMAIL_SMTP_USER')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')

EMAIL_PROVIDER_DAILY_BUDGETS = {
    'resend': int(os.environ.get('EMAIL_DAILY_BUDGET_RESEND', '100')),
    'sendpulse': int(os.environ.get('EMAIL_DAILY_BUDGET_SENDPULSE', '400')),
    'mailjet': int(os.environ.get('EMAIL_DAILY_BUDGET_MAILJET', '200')),
    'mailtrap': int(os.environ.get('EMAIL_DAILY_BUDGET_MAILTRAP', '150')),
    'ahasend': int(os.environ.get('EMAIL_DAILY_BUDGET_AHASEND', '33')),
    'gmail': int(os.environ.get('EMAIL_DAILY_BUDGET_GMAIL', '500')),
}

raw_from_email = os.environ.get('DEFAULT_FROM_EMAIL') or 'Presently <noreply@getpresently.com.ng>'
DEFAULT_FROM_EMAIL = raw_from_email if '<' in raw_from_email else f"Presently <{raw_from_email}>"
EMAIL_SUBJECT_PREFIX = '[Presently] '

# Frontend URL for password reset links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://getpresently.com.ng')
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://presentlyapp-alpha.onrender.com')
SUPPORT_URL = os.environ.get('SUPPORT_URL', f'{FRONTEND_URL}/support')
PRIVACY_URL = os.environ.get('PRIVACY_URL', f'{FRONTEND_URL}/privacy')
INSTITUTION_URL = os.environ.get('INSTITUTION_URL', FRONTEND_URL)

# Firebase Cloud Messaging (FCM) Configuration
FCM_DJANGO_SETTINGS = {
    "FCM_SERVER_KEY": os.environ.get('FCM_SERVER_KEY', ''),
    "ONE_DEVICE_PER_USER": False,
    "DELETE_INACTIVE_DEVICES": True,
}

# Firebase Admin SDK: supports both a file path OR raw JSON content in an env var.
# On Render (or any cloud host), set FIREBASE_SERVICE_ACCOUNT_JSON to the full JSON content.
# Locally, you can use FIREBASE_SERVICE_ACCOUNT_PATH pointing to your serviceAccountKey.json.
FIREBASE_SERVICE_ACCOUNT_PATH = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH')  # None if not set

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_AUTH_CALLBACK_URL = f"{FRONTEND_URL}/auth/callback"

# Celery Configuration for async tasks
# In development without Redis, use threading for async task execution
if os.environ.get('REDIS_URL'):
    CELERY_BROKER_URL = os.environ.get('REDIS_URL')
    CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL')
else:
    # For local development without Redis, use threading backend
    # This allows tasks to run asynchronously without blocking the main request
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'cache+memory://'
    # Don't run tasks eagerly - let them run in background threads instead
    CELERY_TASK_ALWAYS_EAGER = False
    CELERY_WORKER_POOL = 'solo'  # Use solo pool for development (single worker)

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Acknowledge tasks only after they have been executed.  Combined with
# reject_on_worker_lost this guarantees that a task in flight when a worker
# is killed (e.g. during a deploy) gets redelivered rather than silently
# vanishing.  IMPORTANT: tasks MUST be idempotent (see utils/tasks.py) because
# redelivered tasks may partially re-execute.
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True

# Report Generation Settings
REPORTS_DIR = BASE_DIR / 'reports'
REPORTS_DIR.mkdir(exist_ok=True)

# Exam Clearance Settings
EXAM_CLEARANCE_THRESHOLD = 75  # Minimum attendance percentage for exam clearance

# Cloudinary Configuration (for avatar/image uploads)
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')

# Paystack Configuration
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', '')
PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY', '')

# Django Location Field Configuration
LOCATION_FIELD = {
    'provider.google.api': '//maps.google.com/maps/api/js?sensor=false',
    'provider.google.api_key': os.environ.get('GOOGLE_MAPS_API_KEY', ''),
    'provider.google.api_libraries': '',
    'provider.google.map.type': 'ROADMAP',
}

# Feature-flagged safety limits for large venue boundary payloads.
STRICT_VENUE_PAYLOAD_VALIDATION_DEFAULT = os.environ.get('STRICT_VENUE_PAYLOAD_VALIDATION_DEFAULT', 'False') == 'True'
VENUE_MAX_BOUNDARY_POINTS_DEFAULT = int(os.environ.get('VENUE_MAX_BOUNDARY_POINTS_DEFAULT', '500'))
VENUE_MAX_PAYLOAD_CHARS_DEFAULT = int(os.environ.get('VENUE_MAX_PAYLOAD_CHARS_DEFAULT', '50000'))

# Django Unfold Admin Configuration

def _admin_link(path=''):
    base = ADMIN_URL.rstrip('/')
    path = path.lstrip('/')
    if path:
        return f"{base}/{path}/"
    return f"{base}/"


UNFOLD = {
    "SITE_TITLE": "Presently Admin",
    "SITE_HEADER": "Presently Administration",
    "SITE_URL": "/",
    "SITE_ICON": None,  # Can add a custom icon URL here
    "SITE_SYMBOL": "speed",  # Google Material Icon name
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "ENVIRONMENT": "presently.utils.environment_callback",
    "DASHBOARD_CALLBACK": "presently.utils.dashboard_callback",
    "STYLES": [
        # lambda request: f"/static/css/styles.css",
    ],
    "SCRIPTS": [
        # lambda request: f"/static/js/scripts.js",
    ],
    "COLORS": {
        "primary": {
            "50": "250 245 255",
            "100": "243 232 255",
            "200": "233 213 255",
            "300": "216 180 254",
            "400": "192 132 252",
            "500": "168 85 247",
            "600": "147 51 234",
            "700": "126 34 206",
            "800": "107 33 168",
            "900": "88 28 135",
            "950": "59 7 100",
        },
    },
    "EXTENSIONS": {
        "modeltranslation": {
            "flags": {
                "en": "🇬🇧",
                "fr": "🇫🇷",
                "nl": "🇧🇪",
            },
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Navigation",
                "separator": True,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": lambda request: _admin_link(),
                    },
                ],
            },
            {
                "title": "Institutions",
                "separator": True,
                "items": [
                    {
                        "title": "Institutions",
                        "icon": "school",
                        "link": lambda request: _admin_link("institutions/institution/"),
                    },
                    {
                        "title": "Colleges",
                        "icon": "domain",
                        "link": lambda request: _admin_link("institutions/college/"),
                    },
                    {
                        "title": "Departments",
                        "icon": "apartment",
                        "link": lambda request: _admin_link("institutions/department/"),
                    },
                    {
                        "title": "Venues",
                        "icon": "place",
                        "link": lambda request: _admin_link("institutions/venue/"),
                    },
                ],
            },
            {
                "title": "Academic",
                "separator": True,
                "items": [
                    {
                        "title": "Courses",
                        "icon": "menu_book",
                        "link": lambda request: _admin_link("institutions/course/"),
                    },
                    {
                        "title": "Users",
                        "icon": "people",
                        "link": lambda request: _admin_link("institutions/user/"),
                    },
                ],
            },
            {
                "title": "Attendance",
                "separator": True,
                "items": [
                    {
                        "title": "Sessions",
                        "icon": "event",
                        "link": lambda request: _admin_link("institutions/attendancesession/"),
                    },
                    {
                        "title": "Attendance Records",
                        "icon": "how_to_reg",
                        "link": lambda request: _admin_link("institutions/attendance/"),
                    },
                ],
            },
            {
                "title": "Security",
                "separator": True,
                "items": [
                    {
                        "title": "User Devices",
                        "icon": "devices",
                        "link": lambda request: _admin_link("accounts/userdevice/"),
                    },
                    {
                        "title": "Feature Flags",
                        "icon": "toggle_on",
                        "link": lambda request: _admin_link("system/featureflag/"),
                    },
                ],
            },
        ],
    },
}
