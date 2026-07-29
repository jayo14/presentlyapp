from django.test import TestCase
from django.core.cache import cache

from utils.tasks import IdempotentTask, task_idempotency_key


class TaskIdempotencyKeyTests(TestCase):
    def test_key_is_stable_for_same_inputs(self):
        key1 = task_idempotency_key("foo", "bar", 123)
        key2 = task_idempotency_key("foo", "bar", 123)
        self.assertEqual(key1, key2)

    def test_key_changes_with_different_args(self):
        key1 = task_idempotency_key("foo", "bar")
        key2 = task_idempotency_key("foo", "baz")
        self.assertNotEqual(key1, key2)

    def test_key_has_expected_prefix(self):
        key = task_idempotency_key("my_task", "arg1")
        self.assertTrue(key.startswith("celery:idempotency:my_task:arg1"))


class IdempotentTaskTests(TestCase):
    def setUp(self):
        self.calls = []

    def test_first_call_executes_body(self):
        decorator = IdempotentTask(
            key_func=lambda *args, **kwargs: task_idempotency_key("test", "first"),
            timeout=60,
        )

        @decorator
        def my_task(x):
            self.calls.append(x)

        my_task(1)
        self.assertEqual(self.calls, [1])

    def test_second_call_skips_body(self):
        decorator = IdempotentTask(
            key_func=lambda *args, **kwargs: task_idempotency_key("test", "duplicate"),
            timeout=60,
        )

        @decorator
        def my_task(x):
            self.calls.append(x)

        my_task(1)
        my_task(2)
        self.assertEqual(self.calls, [1])

    def test_different_keys_both_execute(self):
        decorator = IdempotentTask(
            key_func=lambda x: task_idempotency_key("test", x),
            timeout=60,
        )

        @decorator
        def my_task(x):
            self.calls.append(x)

        my_task("a")
        my_task("b")
        self.assertEqual(self.calls, ["a", "b"])

    def test_lock_expires_after_timeout(self):
        decorator = IdempotentTask(
            key_func=lambda *args, **kwargs: task_idempotency_key("test", "expiring"),
            timeout=1,
        )

        @decorator
        def my_task(x):
            self.calls.append(x)

        my_task(1)
        self.assertEqual(self.calls, [1])

        cache.delete(task_idempotency_key("test", "expiring"))
        my_task(2)
        self.assertEqual(self.calls, [1, 2])
