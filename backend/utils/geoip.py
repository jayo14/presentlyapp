import requests
import logging

logger = logging.getLogger(__name__)

def get_geoip_data(ip_address):
    """
    Fetch GeoIP data for a given IP address using ip-api.com.
    Returns a dictionary with country, city, timezone, and isp.
    """
    if not ip_address or ip_address in ['127.0.0.1', '0.0.0.0']:
        return {
            'country': 'Local',
            'city': 'Local',
            'timezone': 'UTC',
            'isp': 'Localhost'
        }

    try:
        # Use ip-api.com (free for non-commercial, no API key required for basic)
        # For production, consider a paid service or local MaxMind database
        response = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=5)
        response.raise_for_status()
        data = response.json()

        if data.get('status') == 'success':
            return {
                'country': data.get('country'),
                'city': data.get('city'),
                'timezone': data.get('timezone'),
                'isp': data.get('isp'),
                'lat': data.get('lat'),
                'lon': data.get('lon')
            }
        else:
            logger.warning(f"GeoIP lookup failed for {ip_address}: {data.get('message')}")
    except Exception as e:
        logger.error(f"GeoIP error for {ip_address}: {str(e)}")

    return {
        'country': 'Unknown',
        'city': 'Unknown',
        'timezone': 'UTC',
        'isp': 'Unknown',
        'lat': None,
        'lon': None
    }
