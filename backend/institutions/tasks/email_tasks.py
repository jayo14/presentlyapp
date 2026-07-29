import logging

from celery import shared_task
from django.core.cache import cache

from utils.tasks import IdempotentTask, task_idempotency_key

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
)
@IdempotentTask(
    key_func=lambda self, template_key, to, variables, subject=None, from_email=None: task_idempotency_key(
        "send_template_email", template_key, to
    ),
    timeout=300,
)
def send_template_email_task(self, template_key, to, variables, subject=None, from_email=None):
    from utils.email import send_template_email

    try:
        return send_template_email(template_key, to, variables, subject, from_email, raise_on_error=True)
    except Exception as exc:
        raise self.retry(exc=exc)
