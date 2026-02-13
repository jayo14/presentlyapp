import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-$zkoz6=hl_t6%s8(yh7f@ve4lobpx!qe5l3-##y%jh(fpdq07^')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
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
    # Removed: 'django.contrib.gis' - no longer needed (using lat/long fields instead)
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_yasg',
    'fcm_django',
    # Removed: 'location_field.apps.DefaultConfig' - no longer needed
    # Presently apps
    'institutions',
    'attendance',
    'analytics',
    'notifications',
    'reports',
    'exam_clearance',
    'accounts',
    'system',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'corsheaders.middleware.CorsMiddleware',
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
        'DIRS': [],
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

import dj_database_url

# Redis Cache Configuration
if os.environ.get('REDIS_URL'):
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": os.environ.get('REDIS_URL'),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            }
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "presently-cache",
        }
    }

# Default to SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Override with PostgreSQL if DATABASE_URL is set (production)
if 'DATABASE_URL' in os.environ:
    db_url = os.environ.get('DATABASE_URL')
    is_postgres = db_url.startswith('postgres') or db_url.startswith('postgresql')
    
    DATABASES['default'] = dj_database_url.config(
        default=db_url,
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=is_postgres
    )
    # Use regular PostgreSQL backend (no PostGIS/GDAL required)
    if is_postgres:
        DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql'


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

# WhiteNoise storage to serve compressed and cached static files
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
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
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration for frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://presentlyapp.vercel.app',
]

CORS_ALLOW_CREDENTIALS = True

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

# Email Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')

if RESEND_API_KEY:
    EMAIL_BACKEND = 'presently.email_backend.ResendEmailBackend'
else:
    # For development/fallback, use console backend (prints emails to console)
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# For production with real email (Gmail example):
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
# EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

DEFAULT_FROM_EMAIL = "onboarding@resend.dev"
EMAIL_SUBJECT_PREFIX = '[Presently] '

# Frontend URL for password reset links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://presentlyapp.vercel.app')

# Firebase Cloud Messaging (FCM) Configuration
FCM_DJANGO_SETTINGS = {
    "FCM_SERVER_KEY": os.environ.get('FCM_SERVER_KEY', ''),
    "ONE_DEVICE_PER_USER": False,
    "DELETE_INACTIVE_DEVICES": True,
}

# Firebase Admin SDK Configuration (for FCM)
# Path to Firebase service account JSON file
FIREBASE_SERVICE_ACCOUNT_KEY = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY', '')

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_AUTH_CALLBACK_URL = f"{FRONTEND_URL}/auth/callback"

# Celery Configuration for async tasks
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Report Generation Settings
REPORTS_DIR = BASE_DIR / 'reports'
REPORTS_DIR.mkdir(exist_ok=True)

# Exam Clearance Settings
EXAM_CLEARANCE_THRESHOLD = 75  # Minimum attendance percentage for exam clearance

# Django Location Field Configuration
LOCATION_FIELD = {
    'provider.google.api': '//maps.google.com/maps/api/js?sensor=false',
    'provider.google.api_key': os.environ.get('GOOGLE_MAPS_API_KEY', ''),
    'provider.google.api_libraries': '',
    'provider.google.map.type': 'ROADMAP',
}

# Django Unfold Admin Configuration
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
        lambda request: f"/static/css/styles.css",
    ],
    "SCRIPTS": [
        lambda request: f"/static/js/scripts.js",
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
                        "link": lambda request: "/admin/",
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
                        "link": lambda request: "/admin/institutions/institution/",
                    },
                    {
                        "title": "Colleges",
                        "icon": "domain",
                        "link": lambda request: "/admin/institutions/college/",
                    },
                    {
                        "title": "Departments",
                        "icon": "apartment",
                        "link": lambda request: "/admin/institutions/department/",
                    },
                    {
                        "title": "Venues",
                        "icon": "place",
                        "link": lambda request: "/admin/institutions/venue/",
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
                        "link": lambda request: "/admin/institutions/course/",
                    },
                    {
                        "title": "Users",
                        "icon": "people",
                        "link": lambda request: "/admin/institutions/user/",
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
                        "link": lambda request: "/admin/institutions/attendancesession/",
                    },
                    {
                        "title": "Attendance Records",
                        "icon": "how_to_reg",
                        "link": lambda request: "/admin/institutions/attendance/",
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
                        "link": lambda request: "/admin/accounts/userdevice/",
                    },
                ],
            },
        ],
    },
}
