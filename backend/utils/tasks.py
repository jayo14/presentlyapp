import functools
import hashlib
import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)


class IdempotentTask:
    """
    Decorator that adds a cache-based idempotency lock around a Celery task body.

    Usage
    -----
    ::

        @shared_task(bind=True, max_retries=3, retry_backoff=True, retry_backoff_max=300, retry_jitter=True)
        @idempotent_task(lambda self, event_data: f"handle_charge_success:{event_data.get('data', {}).get('reference', '')}")
        def handle_charge_success_task(self, event_data):
            ...

    For **bound** tasks (``bind=True``), ``self`` is the first positional arg, so
    the key callable should reference ``args[1]``, ``args[2]``, etc.

    The lock lives in Django's cache (Redis in production, local memory in dev).
    ``cache.add`` is atomic: if the key already exists the call returns ``False``
    and the task body is skipped.  We deliberately do **not** delete the key on
    success — letting it expire naturally keeps the race window closed for the
    full dedup window.
    """

    def __init__(self, key_func, timeout: int = 300):
        """
        :param key_func: callable that receives (*args, **kwargs) and returns a string key.
                         For bound tasks (bind=True), args[0] is `self`.
        :param timeout: seconds to keep the lock in cache.  Must be longer than the
                        task's worst-case runtime so that a slow retry does not re-enter.
        """
        self.key_func = key_func
        self.timeout = timeout

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                key = self.key_func(*args, **kwargs)
            except Exception as exc:
                logger.error("Failed to build idempotency key for %s: %s", func.__name__, exc)
                return func(*args, **kwargs)

            try:
                acquired = cache.add(key, "1", timeout=self.timeout)
            except Exception as exc:
                logger.warning("Cache unavailable for idempotency check (%s); executing task: %s", exc, key)
                return func(*args, **kwargs)

            if not acquired:
                logger.warning(
                    "Skipping duplicate task execution (already in flight or recently completed): %s",
                    key,
                )
                return None

            try:
                return func(*args, **kwargs)
            except Exception:
                raise

        return wrapper


def task_idempotency_key(*parts: str) -> str:
    """
    Helper that builds a short, stable cache key from ordered parts.

    Example::

        @idempotent_task(lambda self, sub_id: task_idempotency_key("score_submission", sub_id))
    """
    return "celery:idempotency:" + ":".join(str(p) for p in parts)
