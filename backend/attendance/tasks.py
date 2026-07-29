import logging
from celery import shared_task
from django.db import transaction
from django.db.models import Exists, OuterRef
from django.core.cache import cache

from institutions.models import Attendance
from .models import AttendanceSubmission, AttendanceRecord
from .scoring import _server_recompute_score, _determine_verdict
from utils.tasks import IdempotentTask, task_idempotency_key

logger = logging.getLogger(__name__)


# Two-layer idempotency:
#   1. Cache lock – prevents two workers from scoring the same submission
#      concurrently if the task is enqueued twice.
#   2. The AttendanceSubmission row itself is the source of truth; the task
#      updates it inside transaction.atomic() with select_for_update(), so even
#      if the cache lock is evicted, a second execution will re-score the same
#      submission and write the same verdict without creating duplicates.
@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    acks_late=True,
)
@IdempotentTask(
    key_func=lambda self, submission_id: task_idempotency_key("score_submission", submission_id),
    timeout=300,
)
def score_submission_task(self, submission_id):
    """
    Async scoring task: re-fetch the submission, run server-side validation,
    update the verdict/scores, and upsert the AttendanceRecord.
    """
    try:
        with transaction.atomic():
            submission = AttendanceSubmission.objects.select_for_update().select_related('session').get(
                pk=submission_id
            )
            session = submission.session

            payload = {
                'coordinates': submission.coordinates,
                'sample_count': submission.sample_count,
                'mock_gps_flag': submission.mock_gps_flag,
                'suspiciously_still': submission.suspiciously_still,
                'behavioral_flags': submission.behavioral_flags,
                'confidence_score': submission.confidence_score,
            }

            server_score, server_fail_reasons = _server_recompute_score(session, payload)
            verdict, all_fail_reasons = _determine_verdict(
                server_score,
                submission.confidence_score,
                session,
                server_fail_reasons,
                payload,
            )

            submission.server_confidence_score = server_score
            submission.verdict = verdict
            submission.score_breakdown = {}
            submission.fail_reasons = all_fail_reasons
            submission.save(update_fields=[
                'server_confidence_score', 'verdict', 'score_breakdown', 'fail_reasons'
            ])

            AttendanceRecord.objects.update_or_create(
                session_id=session.id,
                student_id=submission.student_id,
                defaults={
                    'submission': submission,
                    'final_verdict': verdict,
                    'confidence_score': server_score,
                },
            )

            return {
                'submission_id': submission.id,
                'verdict': verdict,
                'server_confidence_score': server_score,
            }

    except Exception as exc:
        logger.error("score_submission_task failed for submission %s: %s", submission_id, exc, exc_info=True)
        try:
            self.retry(exc=exc)
        except Exception:
            with transaction.atomic():
                try:
                    submission = AttendanceSubmission.objects.get(pk=submission_id)
                    submission.verdict = AttendanceSubmission.VERDICT_FLAGGED
                    submission.fail_reasons = [
                        f"Automated scoring failed after {self.max_retries} retries - needs manual lecturer review"
                    ]
                    submission.save(update_fields=['verdict', 'fail_reasons'])
                except AttendanceSubmission.DoesNotExist:
                    pass
            raise
