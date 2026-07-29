import hashlib
import logging

from celery import shared_task
from django.core.cache import cache

from utils.tasks import IdempotentTask, task_idempotency_key


logger = logging.getLogger(__name__)


def _calculate_travel_speed(lat1, lon1, time1, lat2, lon2, time2):
    """Calculate speed in km/h between two points in time."""
    from haversine import haversine

    if None in [lat1, lon1, lat2, lon2]:
        return 0

    distance = haversine((lat1, lon1), (lat2, lon2))
    time_diff = (time2 - time1).total_seconds() / 3600

    if time_diff <= 0:
        return 0

    return distance / time_diff


@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
)
@IdempotentTask(
    key_func=lambda self, user_id, ip_address, user_agent_raw, device_fingerprint_from_client: task_idempotency_key(
        "process_login_security", user_id, ip_address, device_fingerprint_from_client or ""
    ),
    timeout=300,
)
def process_login_security_async(self, user_id, ip_address, user_agent_raw, device_fingerprint_from_client):
    """Process login security checks outside the request/response cycle."""
    from django.conf import settings
    from django.contrib.auth import get_user_model
    from django.core import signing
    from django.utils import timezone
    from user_agents import parse

    from accounts.models import UserDevice
    from institutions.models import AuditLog
    from utils.email import send_login_alert_email
    from utils.geoip import get_geoip_data

    User = get_user_model()
    unknown = "Unknown"

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    try:
        geo_data = get_geoip_data(ip_address)

        if not device_fingerprint_from_client:
            ip_bits = ".".join((ip_address or "0.0.0.0").split(".")[:2])
            fp_raw = f"{user_agent_raw}-{ip_bits}"
            device_fingerprint = hashlib.sha256(fp_raw.encode()).hexdigest()
        else:
            device_fingerprint = device_fingerprint_from_client

        parsed_ua = parse(user_agent_raw)
        browser_name = parsed_ua.browser.family
        os_name = parsed_ua.os.family
        device_brand = parsed_ua.device.brand or unknown
        device_model = parsed_ua.device.model or unknown

        device_category = "Desktop/Laptop"
        if parsed_ua.is_mobile:
            device_category = "Mobile Device"
        elif parsed_ua.is_tablet:
            device_category = "Tablet"
        elif parsed_ua.is_bot:
            device_category = "Bot"

        device_name = f"{device_category} ({os_name})"
        if (parsed_ua.is_mobile or parsed_ua.is_tablet) and device_brand != unknown:
            device_name = f"{device_brand} {device_model}"

        existing_device = UserDevice.objects.filter(
            user=user,
            device_fingerprint=device_fingerprint,
        ).first()

        send_alert = False
        alert_reason = ""

        if not existing_device:
            similar_device = UserDevice.objects.filter(
                user=user,
                device_name=device_name,
                geo_city=geo_data.get("city"),
                isp=geo_data.get("isp"),
            ).order_by("-last_seen_at").first()

            existing_device = UserDevice.objects.create(
                user=user,
                device_fingerprint=device_fingerprint,
                device_name=device_name,
                user_agent=user_agent_raw,
                ip_address=ip_address,
                geo_country=geo_data.get("country"),
                geo_city=geo_data.get("city"),
                timezone=geo_data.get("timezone"),
                isp=geo_data.get("isp"),
                lat=geo_data.get("lat"),
                lon=geo_data.get("lon"),
                is_trusted=False,
            )

            if similar_device:
                old_prefix = ".".join(similar_device.ip_address.split(".")[:3])
                new_prefix = ".".join((ip_address or "0.0.0.0").split(".")[:3])
                if old_prefix == new_prefix or similar_device.is_trusted:
                    send_alert = False
                else:
                    send_alert = True
                    alert_reason = "New network detected for device type"
            else:
                send_alert = True
                alert_reason = "New device or browser detected"
        else:
            existing_country = existing_device.geo_country
            current_country = geo_data.get("country")
            if existing_country and current_country and current_country != existing_country:
                send_alert = True
                alert_reason = f"Login from a new country: {current_country}"

            if not send_alert and existing_device.lat and geo_data.get("lat"):
                speed = _calculate_travel_speed(
                    existing_device.lat,
                    existing_device.lon,
                    existing_device.last_seen_at,
                    geo_data.get("lat"),
                    geo_data.get("lon"),
                    timezone.now(),
                )
                if speed > 800:
                    send_alert = True
                    alert_reason = "Impossible travel detected"

            existing_device.ip_address = ip_address
            existing_device.geo_city = geo_data.get("city")
            existing_device.geo_country = geo_data.get("country")
            existing_device.lat = geo_data.get("lat")
            existing_device.lon = geo_data.get("lon")
            existing_device.isp = geo_data.get("isp")
            existing_device.save()

        if send_alert and not parsed_ua.is_bot:
            trust_token = signing.dumps({"device_id": existing_device.id}, salt="trust-device")
            confirm_url = f"{settings.BACKEND_URL}/api/accounts/devices/trust-confirm/?token={trust_token}"
            send_login_alert_email(
                to=user.email,
                first_name=user.full_name.split(" ")[0],
                device_name=device_name,
                browser_name=browser_name,
                login_location=f"{geo_data.get('city')}, {geo_data.get('country')}",
                login_time=timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
                ip_address=ip_address,
                confirm_url=confirm_url,
                secure_url=f"{settings.FRONTEND_URL}/security",
            )

        AuditLog.objects.create(
            user=user,
            action="LOGIN",
            resource_type="AUTH",
            ip_address=ip_address,
            details={
                "device": device_name,
                "alert_sent": send_alert,
                "reason": alert_reason,
            },
        )

    except Exception as exc:
        logger.error(
            "process_login_security_async failed for user %s: %s",
            user_id,
            exc,
            exc_info=True,
        )
        raise self.retry(exc=exc)
