import os
import json
import logging
import re
import firebase_admin
from firebase_admin import credentials

logger = logging.getLogger(__name__)

from django.conf import settings


_INVALID_JSON_ESCAPE_RE = re.compile(r'\\(?!["\\/bfnrtu])')


def _sanitize_service_account_json(raw_json: str) -> str:
    """Normalize common env-var formatting artifacts before JSON parsing."""
    cleaned = (raw_json or '').strip()

    # Remove surrounding quotes that may be injected by host dashboards.
    if (cleaned.startswith('"') and cleaned.endswith('"')) or (
        cleaned.startswith("'") and cleaned.endswith("'")
    ):
        cleaned = cleaned[1:-1]

    # Convert shell-style line continuations into literal \n sequences.
    cleaned = cleaned.replace('\\\r\n', '\\n').replace('\\\n', '\\n')

    return cleaned


def _parse_service_account_json(raw_json: str) -> dict:
    """Parse service account JSON with defensive fallbacks for malformed escapes."""
    cleaned_json = _sanitize_service_account_json(raw_json)

    try:
        return json.loads(cleaned_json)
    except json.JSONDecodeError as first_err:
        # Some environments preserve lone backslashes that are invalid in JSON.
        escaped_backslashes = _INVALID_JSON_ESCAPE_RE.sub(r'\\\\', cleaned_json)
        if escaped_backslashes != cleaned_json:
            try:
                return json.loads(escaped_backslashes)
            except json.JSONDecodeError:
                pass

        # As a last attempt, normalize literal line breaks to JSON newlines.
        newline_fixed = cleaned_json.replace('\r\n', '\n').replace('\n', '\\n')
        if newline_fixed != cleaned_json:
            try:
                return json.loads(newline_fixed)
            except json.JSONDecodeError:
                pass

        raise first_err


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
                        service_account_dict = _parse_service_account_json(service_account_json)

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
