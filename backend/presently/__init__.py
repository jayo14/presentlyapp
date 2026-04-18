default_app_config = 'presently.apps.PresentlyConfig'

# Import celery only if available
# This allows Django to run without celery installed for basic operations
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery is not installed, which is fine for basic Django operations
    __all__ = ()
