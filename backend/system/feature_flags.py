from django.conf import settings
from django.core.cache import cache

from .models import FeatureFlag


def _cache_key(key: str) -> str:
    return f"feature_flag:{key}"


def get_feature_flag(key: str, default: bool = False) -> bool:
    cached = cache.get(_cache_key(key))
    if cached is not None:
        return bool(cached)

    try:
        flag = FeatureFlag.objects.filter(key=key).only('enabled').first()
        value = flag.enabled if flag is not None else bool(default)
        cache.set(_cache_key(key), value, timeout=60)
        return bool(value)
    except Exception:
        return bool(default)


def get_feature_int(key: str, default: int) -> int:
    cached = cache.get(_cache_key(key))
    if cached is not None:
        try:
            return int(cached)
        except (TypeError, ValueError):
            return int(default)

    try:
        flag = FeatureFlag.objects.filter(key=key).only('int_value').first()
        value = int(flag.int_value) if flag and flag.int_value is not None else int(default)
        cache.set(_cache_key(key), value, timeout=60)
        return value
    except Exception:
        return int(default)


def default_strict_venue_validation_enabled() -> bool:
    return bool(getattr(settings, 'STRICT_VENUE_PAYLOAD_VALIDATION_DEFAULT', False))


def default_venue_max_boundary_points() -> int:
    return int(getattr(settings, 'VENUE_MAX_BOUNDARY_POINTS_DEFAULT', 500))


def default_venue_max_payload_chars() -> int:
    return int(getattr(settings, 'VENUE_MAX_PAYLOAD_CHARS_DEFAULT', 50000))
