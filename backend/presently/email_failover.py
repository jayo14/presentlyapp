import logging
import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import parseaddr
from time import perf_counter
from typing import Any, Callable

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.db.models import Sum
from django.utils import timezone

logger = logging.getLogger("presently.email")

DEFAULT_EMAIL_PROVIDER_DAILY_BUDGETS = {
    "resend": 100,
    "sendpulse": 400,
    "mailjet": 200,
    "mailtrap": 150,
    "ahasend": 33,
    "gmail": 500,
}


class QuotaExhaustedError(Exception):
    """Raised when a provider has reached its quota/rate limit."""


@dataclass
class SendResult:
    success: bool
    provider: str | None = None
    sent_count: int = 0
    error: str | None = None
    quota_exhausted: bool = False


def _mask_email(value: str) -> str:
    if "@" not in value:
        return value
    local, domain = value.split("@", 1)
    if len(local) <= 2:
        return f"{local[0]}***@{domain}" if local else f"***@{domain}"
    return f"{local[:2]}***@{domain}"


def _smtp_envelope_sender(value: str) -> str:
    parsed = parseaddr(value)[1]
    return parsed or value


def _provider_slug(provider: str) -> str:
    return provider.strip().lower().replace(" ", "")


def _provider_daily_budget(provider: str) -> int | None:
    configured = getattr(settings, "EMAIL_PROVIDER_DAILY_BUDGETS", {}) or {}
    merged = {**DEFAULT_EMAIL_PROVIDER_DAILY_BUDGETS}
    for key, value in configured.items():
        try:
            merged[str(key).strip().lower()] = int(value)
        except (TypeError, ValueError):
            continue

    return merged.get(_provider_slug(provider))


def _provider_sent_today(provider: str) -> int:
    try:
        from system.models import EmailDeliveryLog

        today = timezone.localdate()
        aggregate = EmailDeliveryLog.objects.filter(
            provider__iexact=provider,
            status="sent",
            created_at__date=today,
        ).aggregate(total=Sum("recipient_count"))
        return int(aggregate.get("total") or 0)
    except Exception:
        logger.debug("Failed reading provider sent count for throttling", exc_info=True)
        return 0


def _provider_throttle_state(provider: str, recipient_count: int) -> tuple[bool, int | None, int]:
    budget = _provider_daily_budget(provider)
    if budget is None:
        return False, None, 0

    sent_today = _provider_sent_today(provider)
    projected_total = sent_today + max(1, recipient_count)

    if budget <= 0:
        return True, budget, sent_today

    return projected_total > budget, budget, sent_today


def _log_delivery(
    *,
    provider: str,
    status: str,
    template_key: str | None,
    subject: str | None,
    recipients: list[str],
    to_count: int,
    error_message: str | None = None,
    response_payload: dict[str, Any] | None = None,
    duration_ms: int | None = None,
) -> None:
    """Persist email delivery telemetry without raising runtime errors."""
    try:
        from system.models import EmailDeliveryLog

        EmailDeliveryLog.objects.create(
            provider=provider,
            status=status,
            template_key=template_key,
            subject=subject or "",
            recipients=recipients,
            recipient_count=to_count,
            error_message=(error_message or "")[:1000],
            provider_response=response_payload or {},
            duration_ms=duration_ms,
        )
    except Exception:
        logger.debug("Failed to persist EmailDeliveryLog", exc_info=True)


def _is_quota_error(exc: Exception) -> bool:
    details = str(exc).lower()
    quota_keywords = (
        "quota",
        "rate limit",
        "429",
        "limit exceeded",
        "daily limit",
        "too many requests",
        "insufficient quota",
    )
    return any(word in details for word in quota_keywords)


def _smtp_message_for_template(
    *,
    from_email: str,
    to_emails: list[str],
    subject: str,
    template_key: str,
    variables: dict[str, Any],
) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = ", ".join(to_emails)

    lines = [f"This is an automated Presently notification ({template_key}).", ""]
    for key, value in (variables or {}).items():
        lines.append(f"{key}: {value}")

    text_body = "\n".join(lines)
    html_items = "".join(f"<li><strong>{k}</strong>: {v}</li>" for k, v in (variables or {}).items())
    html_body = (
        "<html><body>"
        f"<p>This is an automated Presently notification ({template_key}).</p>"
        f"<ul>{html_items}</ul>"
        "</body></html>"
    )

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    return msg


class FailoverEmailBackend(BaseEmailBackend):
    """Django email backend with multi-provider failover."""

    def _providers(self) -> list[tuple[str, Callable[[list[Any]], int]]]:
        providers: list[tuple[str, Callable[[list[Any]], int]]] = []

        resend_key = getattr(settings, "RESEND_API_KEY", None)
        if resend_key:
            providers.append(("Resend", lambda messages: self._send_messages_via_resend(messages, resend_key)))

        sp_user = getattr(settings, "SENDPULSE_SMTP_USERNAME", None)
        sp_pass = getattr(settings, "SENDPULSE_SMTP_PASSWORD", None)
        if sp_user and sp_pass:
            providers.append(("SendPulse", lambda messages: self._send_messages_via_smtp(messages, "smtp-pulse.com", 587, sp_user, sp_pass)))

        mj_user = getattr(settings, "MAILJET_SMTP_USERNAME", None)
        mj_pass = getattr(settings, "MAILJET_SMTP_PASSWORD", None)
        if mj_user and mj_pass:
            providers.append(("Mailjet", lambda messages: self._send_messages_via_smtp(messages, "in-v3.mailjet.com", 587, mj_user, mj_pass)))

        mailtrap_token = getattr(settings, "MAILTRAP_API_TOKEN", None)
        if mailtrap_token:
            providers.append(("Mailtrap", lambda messages: self._send_messages_via_mailtrap(messages, mailtrap_token)))

        ahasend_user = getattr(settings, "AHASEND_SMTP_USERNAME", None)
        ahasend_pass = getattr(settings, "AHASEND_SMTP_PASSWORD", None)
        if ahasend_user and ahasend_pass:
            providers.append(("AhaSend", lambda messages: self._send_messages_via_smtp(messages, "send.ahasend.com", 587, ahasend_user, ahasend_pass)))

        gmail_user = getattr(settings, "GMAIL_SMTP_USER", None)
        gmail_pass = getattr(settings, "GMAIL_APP_PASSWORD", None)
        if gmail_user and gmail_pass:
            providers.append(("Gmail", lambda messages: self._send_messages_via_smtp(messages, "smtp.gmail.com", 587, gmail_user, gmail_pass)))

        return providers

    def send_messages(self, email_messages: list[Any]) -> int:
        if not email_messages:
            return 0

        providers = self._providers()
        if not providers:
            logger.error("No email providers configured for failover backend")
            return 0

        recipient_count = sum(len(message.to or []) for message in email_messages)
        masked_recipients = [_mask_email(addr) for message in email_messages for addr in (message.to or [])]
        email_subject = email_messages[0].subject if email_messages else ""

        last_error: Exception | None = None
        for provider_name, sender in providers:
            throttled, budget, sent_today = _provider_throttle_state(provider_name, recipient_count)
            if throttled:
                reason = f"Daily budget reached for {provider_name}: sent_today={sent_today}, budget={budget}"
                _log_delivery(
                    provider=provider_name,
                    status="throttled",
                    template_key="django_email_message",
                    subject=email_subject,
                    recipients=masked_recipients,
                    to_count=recipient_count,
                    error_message=reason,
                )
                logger.info(reason)
                last_error = RuntimeError(reason)
                continue

            started = perf_counter()
            try:
                sent_count = sender(email_messages)
                duration_ms = int((perf_counter() - started) * 1000)
                if sent_count > 0:
                    logger.info("sent %s message(s) via %s", sent_count, provider_name)
                    _log_delivery(
                        provider=provider_name,
                        status="sent",
                        template_key="django_email_message",
                        subject=email_subject,
                        recipients=masked_recipients,
                        to_count=recipient_count,
                        duration_ms=duration_ms,
                    )
                    return sent_count
            except QuotaExhaustedError as exc:
                last_error = exc
                _log_delivery(
                    provider=provider_name,
                    status="quota_exhausted",
                    template_key="django_email_message",
                    subject=email_subject,
                    recipients=masked_recipients,
                    to_count=recipient_count,
                    error_message=str(exc),
                )
                logger.warning("%s quota exhausted; trying next provider", provider_name)
                continue
            except Exception as exc:
                last_error = exc
                _log_delivery(
                    provider=provider_name,
                    status="failed",
                    template_key="django_email_message",
                    subject=email_subject,
                    recipients=masked_recipients,
                    to_count=recipient_count,
                    error_message=str(exc),
                )
                logger.error("%s failed unexpectedly", provider_name, exc_info=True)
                continue

        logger.critical("All email providers failed: %s", last_error)
        return 0

    def _send_messages_via_resend(self, email_messages: list[Any], api_key: str) -> int:
        import resend

        resend.api_key = api_key
        sent_count = 0
        for message in email_messages:
            html_body = None
            if hasattr(message, "alternatives") and message.alternatives:
                for content, mime_type in message.alternatives:
                    if mime_type == "text/html":
                        html_body = content
                        break

            payload: dict[str, Any] = {
                "from": message.from_email,
                "to": list(message.to or []),
                "subject": message.subject,
            }
            if message.body:
                payload["text"] = message.body
            if html_body:
                payload["html"] = html_body

            try:
                response = resend.Emails.send(payload)
                if not response:
                    raise Exception("Resend returned an empty response")
                sent_count += 1
            except Exception as exc:
                if _is_quota_error(exc):
                    raise QuotaExhaustedError(str(exc)) from exc
                raise

        return sent_count

    def _send_messages_via_mailtrap(self, email_messages: list[Any], token: str) -> int:
        import mailtrap as mt

        client = mt.MailtrapClient(token=token)
        sent_count = 0
        for message in email_messages:
            html_body = ""
            if hasattr(message, "alternatives") and message.alternatives:
                for content, mime_type in message.alternatives:
                    if mime_type == "text/html":
                        html_body = content
                        break

            mail = mt.Mail(
                sender=mt.Address(email=message.from_email),
                to=[mt.Address(email=addr) for addr in (message.to or [])],
                subject=message.subject,
                text=message.body or "",
                html=html_body,
            )
            try:
                client.send(mail)
                sent_count += 1
            except Exception as exc:
                if _is_quota_error(exc):
                    raise QuotaExhaustedError(str(exc)) from exc
                raise

        return sent_count

    def _send_messages_via_smtp(
        self,
        email_messages: list[Any],
        host: str,
        port: int,
        username: str,
        password: str,
    ) -> int:
        sent_count = 0
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(username, password)

            for message in email_messages:
                try:
                    mime = MIMEMultipart("alternative")
                    mime["Subject"] = message.subject
                    mime["From"] = message.from_email
                    mime["To"] = ", ".join(message.to or [])

                    if message.body:
                        mime.attach(MIMEText(message.body, "plain", "utf-8"))

                    if hasattr(message, "alternatives") and message.alternatives:
                        for content, mime_type in message.alternatives:
                            if mime_type == "text/html":
                                mime.attach(MIMEText(content, "html", "utf-8"))

                    server.sendmail(_smtp_envelope_sender(message.from_email), list(message.to or []), mime.as_string())
                    sent_count += 1
                except smtplib.SMTPResponseException as exc:
                    if exc.smtp_code in (421, 450, 452, 550, 554):
                        raise QuotaExhaustedError(f"SMTP quota for {host}, code={exc.smtp_code}") from exc
                    raise

        return sent_count


def send_templated_email_with_failover(
    *,
    template_key: str,
    to: str | list[str],
    variables: dict[str, Any],
    subject: str | None = None,
    from_email: str | None = None,
    raise_on_error: bool = False,
) -> dict[str, Any]:
    """Send template email using provider failover while keeping caller flow safe."""
    recipients = [to] if isinstance(to, str) else list(to or [])
    if not recipients:
        return {"success": False, "sent_count": 0, "error": "No recipients provided"}

    from_address = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "Presently <noreply@getpresently.com.ng>")
    email_subject = subject or f"Presently: {template_key.replace('_', ' ').title()}"

    providers: list[tuple[str, Callable[[], dict[str, Any]]]] = []

    resend_key = getattr(settings, "RESEND_API_KEY", None)
    template_id = getattr(settings, "RESEND_TEMPLATES", {}).get(template_key)
    if resend_key and template_id:
        providers.append(("Resend", lambda: _send_template_via_resend(
            api_key=resend_key,
            template_id=template_id,
            to=recipients,
            variables=variables,
            subject=email_subject,
            from_email=from_address,
        )))

    sp_user = getattr(settings, "SENDPULSE_SMTP_USERNAME", None)
    sp_pass = getattr(settings, "SENDPULSE_SMTP_PASSWORD", None)
    if sp_user and sp_pass:
        providers.append(("SendPulse", lambda: _send_template_via_smtp(
            host="smtp-pulse.com", port=587, username=sp_user, password=sp_pass,
            to=recipients, template_key=template_key, variables=variables, subject=email_subject, from_email=from_address,
        )))

    mj_user = getattr(settings, "MAILJET_SMTP_USERNAME", None)
    mj_pass = getattr(settings, "MAILJET_SMTP_PASSWORD", None)
    if mj_user and mj_pass:
        providers.append(("Mailjet", lambda: _send_template_via_smtp(
            host="in-v3.mailjet.com", port=587, username=mj_user, password=mj_pass,
            to=recipients, template_key=template_key, variables=variables, subject=email_subject, from_email=from_address,
        )))

    mailtrap_token = getattr(settings, "MAILTRAP_API_TOKEN", None)
    if mailtrap_token:
        providers.append(("Mailtrap", lambda: _send_template_via_mailtrap(
            token=mailtrap_token, to=recipients, template_key=template_key, variables=variables, subject=email_subject, from_email=from_address,
        )))

    ahasend_user = getattr(settings, "AHASEND_SMTP_USERNAME", None)
    ahasend_pass = getattr(settings, "AHASEND_SMTP_PASSWORD", None)
    if ahasend_user and ahasend_pass:
        providers.append(("AhaSend", lambda: _send_template_via_smtp(
            host="send.ahasend.com", port=587, username=ahasend_user, password=ahasend_pass,
            to=recipients, template_key=template_key, variables=variables, subject=email_subject, from_email=from_address,
        )))

    gmail_user = getattr(settings, "GMAIL_SMTP_USER", None)
    gmail_pass = getattr(settings, "GMAIL_APP_PASSWORD", None)
    if gmail_user and gmail_pass:
        providers.append(("Gmail", lambda: _send_template_via_smtp(
            host="smtp.gmail.com", port=587, username=gmail_user, password=gmail_pass,
            to=recipients, template_key=template_key, variables=variables, subject=email_subject, from_email=from_address,
        )))

    if not providers:
        error_text = "No email providers configured"
        logger.critical(error_text)
        _log_delivery(
            provider="none",
            status="failed",
            template_key=template_key,
            subject=email_subject,
            recipients=[_mask_email(addr) for addr in recipients],
            to_count=len(recipients),
            error_message=error_text,
        )
        if raise_on_error:
            raise RuntimeError(error_text)
        return {"success": False, "sent_count": 0, "error": error_text}

    last_error: Exception | None = None
    for provider_name, sender in providers:
        throttled, budget, sent_today = _provider_throttle_state(provider_name, len(recipients))
        if throttled:
            reason = f"Daily budget reached for {provider_name}: sent_today={sent_today}, budget={budget}"
            _log_delivery(
                provider=provider_name,
                status="throttled",
                template_key=template_key,
                subject=email_subject,
                recipients=[_mask_email(addr) for addr in recipients],
                to_count=len(recipients),
                error_message=reason,
            )
            logger.info(reason)
            last_error = RuntimeError(reason)
            continue

        started = perf_counter()
        try:
            provider_response = sender()
            duration_ms = int((perf_counter() - started) * 1000)
            _log_delivery(
                provider=provider_name,
                status="sent",
                template_key=template_key,
                subject=email_subject,
                recipients=[_mask_email(addr) for addr in recipients],
                to_count=len(recipients),
                response_payload=provider_response,
                duration_ms=duration_ms,
            )
            return {
                "success": True,
                "provider": provider_name,
                "sent_count": len(recipients),
                "response": provider_response,
            }
        except QuotaExhaustedError as exc:
            last_error = exc
            _log_delivery(
                provider=provider_name,
                status="quota_exhausted",
                template_key=template_key,
                subject=email_subject,
                recipients=[_mask_email(addr) for addr in recipients],
                to_count=len(recipients),
                error_message=str(exc),
            )
            logger.warning("%s quota exhausted, moving to next provider", provider_name)
            continue
        except Exception as exc:
            last_error = exc
            _log_delivery(
                provider=provider_name,
                status="failed",
                template_key=template_key,
                subject=email_subject,
                recipients=[_mask_email(addr) for addr in recipients],
                to_count=len(recipients),
                error_message=str(exc),
            )
            logger.error("%s failed during template send", provider_name, exc_info=True)
            continue

    error_text = f"All providers failed for template '{template_key}'"
    logger.critical(error_text)
    if raise_on_error and last_error is not None:
        raise last_error

    return {
        "success": False,
        "provider": None,
        "sent_count": 0,
        "error": str(last_error) if last_error else error_text,
    }


def _send_template_via_resend(
    *,
    api_key: str,
    template_id: str,
    to: list[str],
    variables: dict[str, Any],
    subject: str,
    from_email: str,
) -> dict[str, Any]:
    import resend

    resend.api_key = api_key
    payload: dict[str, Any] = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "template_id": template_id,
        "params": variables,
    }
    try:
        response = resend.Emails.send(payload)
    except Exception as exc:
        if "Missing `html` or `text` field" in str(exc):
            response = resend.Emails.send({
                "from": from_email,
                "to": to,
                "subject": subject,
                "template": {
                    "id": template_id,
                    "variables": variables,
                },
            })
        else:
            if _is_quota_error(exc):
                raise QuotaExhaustedError(str(exc)) from exc
            raise

    if not response:
        raise Exception("Resend returned empty response")
    return response if isinstance(response, dict) else {"result": str(response)}


def _send_template_via_mailtrap(
    *,
    token: str,
    to: list[str],
    template_key: str,
    variables: dict[str, Any],
    subject: str,
    from_email: str,
) -> dict[str, Any]:
    import mailtrap as mt

    client = mt.MailtrapClient(token=token)
    text_body = f"Presently notification ({template_key})\n" + "\n".join(
        f"{key}: {value}" for key, value in (variables or {}).items()
    )
    html_body = (
        f"<p>Presently notification ({template_key})</p><ul>"
        + "".join(f"<li><strong>{key}</strong>: {value}</li>" for key, value in (variables or {}).items())
        + "</ul>"
    )

    mail = mt.Mail(
        sender=mt.Address(email=from_email),
        to=[mt.Address(email=recipient) for recipient in to],
        subject=subject,
        text=text_body,
        html=html_body,
    )
    try:
        response = client.send(mail)
    except Exception as exc:
        if _is_quota_error(exc):
            raise QuotaExhaustedError(str(exc)) from exc
        raise

    return response if isinstance(response, dict) else {"result": str(response)}


def _send_template_via_smtp(
    *,
    host: str,
    port: int,
    username: str,
    password: str,
    to: list[str],
    template_key: str,
    variables: dict[str, Any],
    subject: str,
    from_email: str,
) -> dict[str, Any]:
    message = _smtp_message_for_template(
        from_email=from_email,
        to_emails=to,
        subject=subject,
        template_key=template_key,
        variables=variables,
    )

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(username, password)
            server.sendmail(_smtp_envelope_sender(from_email), to, message.as_string())
    except smtplib.SMTPResponseException as exc:
        if exc.smtp_code in (421, 450, 452, 550, 554):
            raise QuotaExhaustedError(f"SMTP quota for {host}, code={exc.smtp_code}") from exc
        raise

    return {"host": host, "accepted": len(to)}
