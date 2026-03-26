"""
IP Geolocation utility.

Uses ip-api.com (free, no API key required for non-commercial use up to 45 req/min).
Falls back gracefully on failure so login is never blocked by a geo lookup error.
"""
import hashlib
import logging
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# Private / loopback IP prefixes — skip geo lookups for these
_PRIVATE_PREFIXES = (
    '127.',
    '10.',
    '192.168.',
    '::1',
    'localhost',
)

_GEO_API_URL = 'http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,city,timezone,isp,lat,lon'
_GEO_TIMEOUT = 3  # seconds — never block login for more than this


def _is_private_ip(ip: str) -> bool:
    return any(ip.startswith(prefix) for prefix in _PRIVATE_PREFIXES) or ip.startswith('172.') and (
        16 <= int(ip.split('.')[1]) <= 31
    )


def get_ip_geo_data(ip: str) -> dict:
    """
    Return a dict with geo data for the given IP address.

    Keys returned on success:
        country, city, timezone, isp, latitude, longitude

    Returns an empty dict if the lookup fails or the IP is private/local.
    """
    if not ip or _is_private_ip(ip):
        return {}

    try:
        response = requests.get(_GEO_API_URL.format(ip=ip), timeout=_GEO_TIMEOUT)
        data = response.json()
        if data.get('status') == 'success':
            return {
                'country': data.get('country', ''),
                'city': data.get('city', ''),
                'timezone': data.get('timezone', ''),
                'isp': data.get('isp', ''),
                'latitude': data.get('lat'),
                'longitude': data.get('lon'),
            }
    except Exception as exc:
        logger.debug("GeoIP lookup failed for %s: %s", ip, exc)

    return {}


def build_device_fingerprint(user_agent: str, browser: str, os_name: str, device_category: str) -> str:
    """
    Build a stable device fingerprint hash from the UA components.
    This is intentionally coarse so that minor browser version bumps
    don't create a new fingerprint.
    """
    raw = f"{browser}|{os_name}|{device_category}|{user_agent[:200]}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def calculate_travel_speed_kmh(
    lat1: Optional[float],
    lon1: Optional[float],
    lat2: Optional[float],
    lon2: Optional[float],
    elapsed_seconds: float,
) -> Optional[float]:
    """
    Calculate approximate travel speed in km/h between two geo-points.
    Returns None if any coordinate is missing or elapsed_seconds <= 0.
    """
    if None in (lat1, lon1, lat2, lon2) or elapsed_seconds <= 0:
        return None

    try:
        from math import radians, cos, sin, asin, sqrt

        r = 6371  # Earth's radius in km
        d_lat = radians(lat2 - lat1)
        d_lon = radians(lon2 - lon1)
        a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
        distance_km = 2 * r * asin(sqrt(a))
        return distance_km / (elapsed_seconds / 3600)
    except Exception:
        return None
