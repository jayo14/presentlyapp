import resend
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class ResendEmailBackend(BaseEmailBackend):
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently)
        self.api_key = getattr(settings, 'RESEND_API_KEY', None)
        if self.api_key:
            resend.api_key = self.api_key

    def send_messages(self, email_messages):
        if not email_messages:
            return 0
            
        if not self.api_key:
            if self.fail_silently:
                return 0
            raise ImproperlyConfigured('RESEND_API_KEY is not set in settings.')

        count = 0
        for message in email_messages:
            sent = self._send(message)
            if sent:
                count += 1
        return count

    def _send(self, message):
        try:
            # Extract HTML content if available (from EmailMultiAlternatives)
            html_content = None
            if hasattr(message, 'alternatives'):
                for content, mimetype in message.alternatives:
                    if mimetype == 'text/html':
                        html_content = content
                        break
            
            # Also check if the primary body is HTML (though rare for send_mail unless misused)
            if message.content_subtype == 'html':
                html_content = message.body
            
            params = {
                "from": message.from_email,
                "to": message.to,
                "subject": message.subject,
                "text": message.body,
            }
            
            if html_content:
                params["html"] = html_content
            
            # Extract Reply-To if present
            if message.reply_to:
                params["reply_to"] = message.reply_to
                
            # Send via Resend
            r = resend.Emails.send(params)
            
            # Check for success (resend returns a dict with 'id' on success)
            if r and 'id' in r:
                return True
            return False
            
        except Exception as e:
            if not self.fail_silently:
                raise e
            return False
