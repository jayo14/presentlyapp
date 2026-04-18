import logging
import os
import sys

from django.apps import AppConfig


logger = logging.getLogger(__name__)


class PresentlyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'presently'

    def ready(self):
        """Initialize Firebase once when the Django app starts."""
        if not os.environ.get('DJANGO_SETTINGS_MODULE'):
            return

        is_management_command = os.path.basename(sys.argv[0]) == 'manage.py'
        is_runserver_child = os.environ.get('RUN_MAIN') == 'true'

        if is_management_command and not is_runserver_child:
            return

        try:
            from presently.firebase_config import initialize_firebase

            if initialize_firebase():
                logger.info('Firebase initialized at app startup.')
        except Exception as exc:
            logger.error('Firebase startup init failed: %s', exc)