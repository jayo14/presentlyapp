from celery import shared_task


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_template_email_task(self, template_key, to, variables, subject=None, from_email=None):
    from utils.email import send_template_email

    try:
        return send_template_email(template_key, to, variables, subject, from_email)
    except Exception as exc:
        raise self.retry(exc=exc)
