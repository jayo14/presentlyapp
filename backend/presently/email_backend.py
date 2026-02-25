import os
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class GmailApiEmailBackend(BaseEmailBackend):
    """
    Django email backend that uses the Gmail API.
    Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_API_REFRESH_TOKEN in settings.
    """
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.credentials = self._get_credentials()

    def _get_credentials(self):
        refresh_token = getattr(settings, 'GMAIL_API_REFRESH_TOKEN', os.environ.get('GMAIL_API_REFRESH_TOKEN'))
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        client_secret = getattr(settings, 'GOOGLE_CLIENT_SECRET', None)

        if not all([refresh_token, client_id, client_secret]):
            logger.warning("Gmail API credentials not fully configured. Email sending might fail.")
            return None

        return Credentials(
            None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
        )

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        if not self.credentials:
            if not self.fail_silently:
                # Fallback or error
                logger.error("Gmail API credentials not configured. Cannot send email.")
            return 0

        import os # Added import inside or move to top

        try:
            service = build('gmail', 'v1', credentials=self.credentials)
            sent_count = 0
            
            for message in email_messages:
                # Use Django's built-in message conversion to MIME
                mime_msg = message.message()
                raw_msg = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode()
                
                service.users().messages().send(userId='me', body={'raw': raw_msg}).execute()
                sent_count += 1

            return sent_count
        except Exception as e:
            logger.error(f"Error sending email via Gmail API: {str(e)}")
            if not self.fail_silently:
                raise e
            return 0
