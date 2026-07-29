# Retry & Idempotency Strategy

## Goal

Webhooks (Paystack, etc.) and mobile clients can retry the same event many times.
Celery itself can redeliver a task if a worker dies mid-execution.
We need to make sure every task can run **at most once** for a given logical event,
while still surviving crashes and network blips.

## Two-Layer Idempotency

Every production Celery task should have **both** of these guards:

### Layer 1 — Cache Lock (Fast Path)

```python
from utils.tasks import IdempotentTask, task_idempotency_key

@shared_task(...)
@IdempotentTask(
    key_func=lambda self, event_data: task_idempotency_key(
        "my_task", event_data.get("id", "")
    ),
    timeout=300,
)
def my_task(self, event_data):
    ...
```

- Uses `django.core.cache.cache.add()` to atomically claim a short-lived lock.
- If the key already exists, the task body is skipped and a warning is logged.
- The lock **is not deleted on success** — it expires naturally after `timeout` seconds.
  This keeps the race window closed for the full dedup window.
- In production the cache is Redis-backed; in local dev it falls back to local memory.

### Layer 2 — Database Source of Truth (Authoritative)

The cache is volatile (eviction, restart, multi-worker races).  The DB is not.
Each task must also have an authoritative DB-level guard:

- **Unique constraint / `get_or_create`** — e.g. `Payment.objects.get_or_create(paystack_reference=...)`
- **`select_for_update()` inside `transaction.atomic()`** — e.g. locking the `AttendanceSubmission` row before scoring
- **Idempotent update queries** — e.g. `.filter(status=ACTIVE).update(status=CANCELED)`

If the cache lock is missed (evicted, cold start, etc.), the DB guard still prevents
duplicate side effects.

## Standardised Retry Backoff

All `@shared_task` decorators should use Celery's built-in exponential backoff with jitter
instead of fixed `default_retry_delay`:

```python
@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,        # exponential backoff
    retry_backoff_max=300,     # cap at 5 minutes
    retry_jitter=True,         # spread retries to avoid thundering herd
)
```

This replaces the old pattern of `default_retry_delay=30` (or `10`), which caused
thundering-herd retries during outages.

## Celery Worker Settings

In `presently/settings.py`:

```python
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
```

- `acks_late=True` — the task is only acknowledged **after** it finishes successfully.
- `reject_on_worker_lost=True` — if the worker dies, the task is requeued instead of
  being lost.

**Why this requires idempotency:** a redelivered task may partially re-execute.
The two-layer idempotency above guarantees that partial re-execution is safe.

## Adding a New Task

1. Add the `@shared_task` decorator with `retry_backoff=True, retry_backoff_max=300, retry_jitter=True`.
2. Wrap the task function with `@IdempotentTask(key_func=..., timeout=300)`.
3. Derive the idempotency key from stable, unique fields (reference ID, subscription code,
   user ID + IP, submission ID, etc.).
4. Add a DB-level guard inside the task body (unique constraint, `get_or_create`,
   `select_for_update`, or idempotent `.update()`).
5. Document the key derivation in a comment above the task.
