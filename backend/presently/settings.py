import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

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
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.gzip.GZipMiddleware',
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
    if db_url:
        is_postgres = db_url.startswith('postgresql') # Covers both 'postgres://' and 'postgresql://'
        
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
        'https://www.getpresently.com.ng',
        'https://getpresently.com.ng',
        'https://presentlyapp.vercel.app',
        FRONTEND_ORIGIN,
    ]

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "https://*.app.github.dev",
]

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

# Email Configuration (Brevo SMTP-first)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp-relay.brevo.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'apikey')
EMAIL_HOST_PASSWORD = (
    os.environ.get('EMAIL_HOST_PASSWORD')
    or os.environ.get('BREVO_SMTP_KEY')
    or os.environ.get('BREVO_API_KEY', '')
)
GMAIL_API_REFRESH_TOKEN = os.environ.get('GMAIL_API_REFRESH_TOKEN', '')
USE_GMAIL_API_EMAIL_BACKEND = os.environ.get('USE_GMAIL_API_EMAIL_BACKEND', 'False') == 'True'

# Choose backend: SMTP by default, optional Gmail API only when explicitly enabled.
if USE_GMAIL_API_EMAIL_BACKEND and os.environ.get('GMAIL_API_REFRESH_TOKEN') and os.environ.get('GOOGLE_CLIENT_ID'):
    EMAIL_BACKEND = 'presently.email_backend.GmailApiEmailBackend'
    print("INFO: Using Gmail API email backend.")
elif EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    print(f"INFO: Using SMTP email backend ({EMAIL_HOST}:{EMAIL_PORT}).")
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("WARNING: SMTP credentials not found; using console email backend.")

raw_from_email = os.environ.get('DEFAULT_FROM_EMAIL') or os.environ.get('EMAIL_HOST_USER') or 'noreply@presently.app'
DEFAULT_FROM_EMAIL = raw_from_email if '<' in raw_from_email else f"Presently <{raw_from_email}>"
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
FIREBASE_SERVICE_ACCOUNT_PATH = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH', 'serviceAccountKey.json')

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

# Cloudinary Configuration (for avatar/image uploads)
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')

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
