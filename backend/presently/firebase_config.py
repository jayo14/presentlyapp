import os
import json
import logging
import firebase_admin
from firebase_admin import credentials

logger = logging.getLogger(__name__)

from django.conf import settings


def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized.

    Credential resolution order:
    1. FIREBASE_SERVICE_ACCOUNT_PATH env var → file on disk (local dev)
    2. FIREBASE_SERVICE_ACCOUNT_JSON env var → raw JSON string (Render / cloud)
    """
    if not firebase_admin._apps:
        try:
            cred = None

            # 1. Try file path first (local dev)
            service_account_path = (
                getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_PATH', None)
                or os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
            )
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                logger.info(f"Firebase: loaded credentials from file: {service_account_path}")

            # 2. Fall back to raw JSON env var (production / Render)
            if cred is None:
                service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
                if service_account_json:
                    try:
                        # Clean the string from common environment variable artifact issues
                        cleaned_json = service_account_json.strip()
                        
                        # Remove surrounding quotes if they were added by the host environment
                        if (cleaned_json.startswith('"') and cleaned_json.endswith('"')) or \
                           (cleaned_json.startswith("'") and cleaned_json.endswith("'")):
                            cleaned_json = cleaned_json[1:-1]
                        
                        try:
                            service_account_dict = json.loads(cleaned_json)
                        except json.JSONDecodeError as first_err:
                            # Handle common escaping issues in private keys (backslash escapes)
                            if "Invalid \\escape" in str(first_err):
                                # If we have literal backslashes that aren't escaped properly for JSON,
                                # we try to escape them. However, we must be careful not to double-escape \n
                                # A common fix for "Invalid \escape" in env vars is to replace single backslashes
                                # that aren't followed by valid JSON escape chars.
                                # But first, let's try a simpler fix: replace literal newlines if they exist
                                try:
                                    # Try to make it a valid JSON string by ensuring it doesn't have raw control characters
                                    service_account_dict = json.loads(cleaned_json, strict=False)
                                except json.JSONDecodeError:
                                    # Last ditch: if it has literal \n as characters, they should be fine,
                                    # but if it has unescaped backslashes, we're in trouble.
                                    raise first_err
                            else:
                                raise first_err

                        cred = credentials.Certificate(service_account_dict)
                        logger.info("Firebase: loaded credentials from FIREBASE_SERVICE_ACCOUNT_JSON env var.")
                    except json.JSONDecodeError as e:
                        logger.error(f"Firebase: FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}")
                        logger.error(f"Error location: line {e.lineno}, column {e.colno}")
                        return False
                    except Exception as e:
                        logger.error(f"Firebase: Error processing service account JSON: {e}")
                        return False

            if cred is None:
                logger.warning(
                    "Firebase credentials not found. "
                    "Set FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON) on Render, "
                    "or FIREBASE_SERVICE_ACCOUNT_PATH (file path) locally."
                )
                return False

            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully.")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            return False

    return True
