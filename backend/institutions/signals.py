import logging

from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import College, Department, Institution


logger = logging.getLogger(__name__)


def _invalidate_patterns(*patterns: str) -> None:
    for pattern in patterns:
        try:
            delete_pattern = getattr(cache, 'delete_pattern', None)
            if callable(delete_pattern):
                delete_pattern(pattern)
            else:
                logger.debug('Cache backend does not support delete_pattern for %s', pattern)
        except Exception as exc:
            logger.warning('Failed to invalidate cache pattern %s: %s', pattern, exc)


@receiver([post_save, post_delete], sender=Institution)
def invalidate_institution_reference_cache(sender, **kwargs):
    _invalidate_patterns('institutions_list_v1*', 'colleges_list_v1*', 'departments_list_v1*')


@receiver([post_save, post_delete], sender=College)
def invalidate_college_reference_cache(sender, **kwargs):
    _invalidate_patterns('colleges_list_v1*', 'departments_list_v1*')


@receiver([post_save, post_delete], sender=Department)
def invalidate_department_reference_cache(sender, **kwargs):
    _invalidate_patterns('departments_list_v1*')
