import requests
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django_ratelimit.decorators import ratelimit
from django_ratelimit.core import is_ratelimited
import secrets
import logging
import os
import cloudinary
import cloudinary.uploader
import firebase_admin
from firebase_admin import auth as firebase_auth
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from user_agents import parse
from presently.firebase_config import initialize_firebase
from utils.email import (
    send_login_alert_email,
    send_reset_password_email,
    send_session_live_email,
    send_verify_email,
    send_welcome_email,
)

from .attendance_logic import perform_attendance_check_in
from .models import (
    User, Institution, College, Department, Course, CourseEnrollment, AttendanceSession, 
    Attendance, Venue, UserRole, EmailVerificationOTP, AuditLog, Timetable
)
from .rbac import user_has_permission
from accounts.models import UserDevice
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OnboardingSerializer, InstitutionSerializer, CollegeSerializer,
    DepartmentSerializer, VenueSerializer, CourseSerializer, CourseEnrollmentSerializer, AttendanceSessionSerializer,
    AttendanceSerializer, PasswordChangeSerializer, TimetableSerializer
)
from .attendance_logic import perform_attendance_check_in, check_session_validity
from .geolocation_utils import verify_location, calculate_distance

# Configure logging
auth_logger = logging.getLogger('auth_events')
logger = logging.getLogger(__name__)


def _safe_payload_summary(payload, max_preview: int = 500) -> dict:
    """Return a bounded summary for request payload logging."""
    summary = {
        'type': type(payload).__name__,
        'keys': [],
        'size_hint': 0,
        'preview': '',
        'truncated': False,
    }
    try:
        if hasattr(payload, 'keys'):
            keys = list(payload.keys())
            summary['keys'] = keys[:30]
            summary['size_hint'] = len(keys)
        rendered = str(payload)
        if len(rendered) > max_preview:
            summary['preview'] = rendered[:max_preview]
            summary['truncated'] = True
        else:
            summary['preview'] = rendered
    except Exception as exc:
        summary['preview'] = f'unavailable:{exc.__class__.__name__}'
    return summary

# Configure Cloudinary once at module load using settings
_cloudinary_configured = False

def _ensure_cloudinary_configured():
    """Configure the Cloudinary SDK from Django settings (runs only once)."""
    global _cloudinary_configured
    if not _cloudinary_configured:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _cloudinary_configured = True

# Helper function to generate tokens
def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """
    Authenticate user using Google ID token from Firebase with additional verification.
    """
    id_token_str = request.data.get('id_token')
    
    if not id_token_str:
        auth_logger.warning("Google Auth attempted without ID token.")
        return Response({
            'success': False,
            'error': 'ID token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Initialize Firebase if not already
    initialize_firebase()
    
    try:
        # Verify the Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token_str)
        uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        picture = decoded_token.get('picture', '')
        
        if not email:
            auth_logger.error(f"Google Auth failed: Email not provided. UID: {uid}")
            return Response({
                'success': False,
                'error': 'Email not provided by Google'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Secondary validation using Google's own libraries and GOOGLE_CLIENT_ID
        if settings.GOOGLE_CLIENT_ID:
            try:
                # This ensures the token was intended for our specific client
                google_id_token.verify_oauth2_token(
                    id_token_str, 
                    google_requests.Request(), 
                    settings.GOOGLE_CLIENT_ID
                )
            except Exception as e:
                auth_logger.error(f"Secondary Google Token validation failed: {str(e)}")
            
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': name,
                'is_active': True,
                'email_verified': True, 
                'email_verified_at': timezone.now(),
                'avatar_url': picture,
                'signup_method': 'google'
            }
        )
        
        if created:
            auth_logger.info(f"New user created via Google Auth: {email}")
        else:
            auth_logger.info(f"User logged in via Google Auth: {email}")
            needs_save = False
            if not user.email_verified:
                user.email_verified = True
                user.email_verified_at = timezone.now()
                needs_save = True
            if user.signup_method != 'google':
                user.signup_method = 'google'
                needs_save = True
            if needs_save:
                user.save()
            
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'success': True,
            'message': 'Google authentication successful',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'onboarding_complete': user.onboarding_complete,
                'avatar_url': user.avatar_url
            },
            'tokens': tokens,
            'requires_email_verification': not user.email_verified,
            'requires_onboarding': not user.onboarding_complete
        }, status=status.HTTP_200_OK)
        
    except firebase_admin.exceptions.FirebaseError as e:
        auth_logger.error(f"Firebase Auth Error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Firebase authentication failed: {str(e)}'
        }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        auth_logger.error(f"Unexpected Auth Error: {str(e)}")
        return Response({
            'success': False,
            'error': 'An unexpected error occurred during authentication.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_callback_view(request):
    """
    Handle Google OAuth2 callback.
    Exchange code for tokens and user info.
    """
    code = request.data.get('code')
    if not code:
        return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    # Use redirect_uri from request or fallback to settings
    redirect_uri = request.data.get('redirect_uri', settings.GOOGLE_AUTH_CALLBACK_URL)

    data = {
        'code': code,
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }

    try:
        # Exchange code for access token with 10-second timeout
        response = requests.post(token_url, data=data, timeout=10)
        response.raise_for_status()  # Raise for 4xx/5xx status codes
        token_data = response.json()
    except requests.Timeout:
        return Response(
            {'error': 'Google token exchange timeout. Please try again.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.RequestException as e:
        return Response(
            {'error': f'Failed to exchange code with Google: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except ValueError as e:
        return Response(
            {'error': 'Invalid response from Google token endpoint'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if 'error' in token_data:
        return Response(
            {'error': token_data.get('error_description', 'Failed to exchange code')},
            status=status.HTTP_400_BAD_REQUEST
        )

    access_token = token_data.get('access_token')
    if not access_token:
        return Response(
            {'error': 'No access token in Google response'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get user info
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    try:
        user_info_response = requests.get(user_info_url, params={'access_token': access_token}, timeout=10)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
    except requests.Timeout:
        return Response(
            {'error': 'Google user info request timeout. Please try again.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.RequestException as e:
        return Response(
            {'error': f'Failed to get user info from Google: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except ValueError as e:
        return Response(
            {'error': 'Invalid response from Google user info endpoint'},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = user_info.get('email')
    name = user_info.get('name', '')
    picture = user_info.get('picture', '')

    if not email:
        return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or create user
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'full_name': name,
            'avatar_url': picture,
            'is_active': True,
            'email_verified': True,
            'signup_method': 'google'
        }
    )

    if not created:
        needs_save = False
        if not user.email_verified:
            user.email_verified = True
            needs_save = True
        if user.signup_method != 'google':
            user.signup_method = 'google'
            needs_save = True
        if needs_save:
            user.save()

    # Generate tokens
    tokens = get_tokens_for_user(user)

    return Response({
        'success': True,
        'tokens': tokens,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'onboarding_complete': user.onboarding_complete,
            'avatar_url': user.avatar_url
        },
        'requires_onboarding': not user.onboarding_complete
    })




@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user and send email verification OTP"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create and send OTP for email verification
        try:
            # Create OTP
            otp_obj = EmailVerificationOTP.create_otp(user)
            
            # Send verification email using internal email service
            send_verification_email(user, otp_obj.otp)
            
            logger.info(f"User registered: {user.email}, OTP sent")
            
            return Response({
                'success': True,
                'message': 'User registered successfully. Please verify your email.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'email_verified': user.email_verified,
                    'onboarding_complete': user.onboarding_complete
                },
                'requires_email_verification': True,
                'requires_onboarding': True
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to send OTP after registration for {user.email}: {str(e)}")
            # User is created but OTP failed - they can request resend
            return Response({
                'success': True,
                'message': 'User registered successfully. Failed to send verification email.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'email_verified': user.email_verified,
                    'onboarding_complete': user.onboarding_complete
                },
                'requires_email_verification': True,
                'requires_onboarding': True,
                'otp_send_failed': True,
                'error': 'Failed to send verification email. Please request a new code.'
            }, status=status.HTTP_201_CREATED)
            
    # Consistent error format
    error_message = 'Register failed'
    if serializer.errors:
        if 'non_field_errors' in serializer.errors:
            error_message = serializer.errors['non_field_errors'][0]
        else:
            field = next(iter(serializer.errors))
            error_detail = serializer.errors[field]
            if isinstance(error_detail, list):
                error_detail = error_detail[0]
            error_message = f"{field}: {error_detail}"

    return Response({
        'success': False,
        'error': error_message,
        'errors': serializer.errors,
        'code': 'REGISTRATION_FAILED',
        'message': error_message
    }, status=status.HTTP_400_BAD_REQUEST)

# Add these views to institutions/views.py after the register_view

def send_verification_email(user, otp_code):
    """Queue OTP verification email with a Resend hosted template."""
    try:
        send_verify_email(
            to=user.email,
            first_name=user.full_name.split(' ')[0],
            otp_code=otp_code,
            expiry_minutes=10,
            verify_url=f"{settings.FRONTEND_URL}/verify-email",
            resend_url=f"{settings.FRONTEND_URL}/resend-otp",
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}", exc_info=True)
        raise


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_otp_view(request):
    """Send OTP to user's email for verification"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'success': False,
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        if user.email_verified:
            return Response({
                'success': False,
                'error': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Invalidate old OTPs
        EmailVerificationOTP.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Create new OTP
        otp_obj = EmailVerificationOTP.create_otp(user)
        
        # Send OTP email via internal email service
        try:
            send_verify_email(
                to=user.email,
                first_name=user.full_name.split(' ')[0],
                otp_code=otp_obj.otp,
                expiry_minutes=10,
                verify_url=f"{settings.FRONTEND_URL}/verify-email",
                resend_url=f"{settings.FRONTEND_URL}/resend-otp",
            )
        except Exception as e:
            logger.error(f"Failed to send OTP email: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to send verification email',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
        logger.info(f"OTP sent to {email}")
        
        return Response({
            'success': True,
            'message': 'Verification OTP sent to your email',
            'expires_in': 900  # 15 minutes in seconds
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Failed to send verification email'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_otp_view(request):
    """Verify email using OTP"""
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not all([email, otp]):
        return Response({
            'success': False,
            'error': 'Email and OTP are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        if user.email_verified:
            return Response({
                'success': False,
                'error': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the latest valid OTP
        otp_obj = EmailVerificationOTP.objects.filter(
            user=user,
            otp=otp,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return Response({
                'success': False,
                'error': 'Invalid OTP code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp_obj.is_valid():
            return Response({
                'success': False,
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        # Mark email as verified
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'success': True,
            'message': 'Email verified successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'email_verified': user.email_verified,
                'onboarding_complete': user.onboarding_complete
            },
            'tokens': tokens,
            'requires_email_verification': not user.email_verified,
            'requires_onboarding': not user.onboarding_complete
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)



def calculate_travel_speed(lat1, lon1, time1, lat2, lon2, time2):
    """Calculate speed in km/h between two points in time"""
    from haversine import haversine
    
    if None in [lat1, lon1, lat2, lon2]:
        return 0
        
    distance = haversine((lat1, lon1), (lat2, lon2))  # in km
    time_diff = (time2 - time1).total_seconds() / 3600  # in hours
    
    if time_diff <= 0:
        return 0
        
    return distance / time_diff

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login with device recognition and anomaly detection"""
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Block full login for unverified users and trigger a fresh OTP send.
        if not user.email_verified:
            otp_send_failed = False
            try:
                EmailVerificationOTP.objects.filter(user=user, is_used=False).update(is_used=True)
                otp_obj = EmailVerificationOTP.create_otp(user)
                send_verification_email(user, otp_obj.otp)
                auth_logger.info("Unverified user login OTP sent: %s", user.email)
            except Exception as exc:
                otp_send_failed = True
                logger.error(
                    "Failed to send login verification OTP for %s: %s",
                    user.email,
                    str(exc),
                    exc_info=True,
                )

            return Response({
                'success': True,
                'message': 'Email not verified. A verification code has been sent to your email.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'email_verified': user.email_verified,
                    'onboarding_complete': user.onboarding_complete,
                    'avatar_url': user.avatar_url,
                },
                'requires_email_verification': True,
                'requires_onboarding': not user.onboarding_complete,
                'otp_send_failed': otp_send_failed,
            }, status=status.HTTP_200_OK)
        
        # Security: Device Tracking
        try:
            from utils.geoip import get_geoip_data
            import hashlib
            
            UNKNOWN = "Unknown"
            user_agent_raw = request.META.get('HTTP_USER_AGENT', 'Unknown Device')
            
            # Handle proxy headers for IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')

            # Get GeoIP data
            geo_data = get_geoip_data(ip_address)
            
            # Determine Fingerprint
            device_fingerprint = request.data.get('device_id')
            if not device_fingerprint:
                ip_bits = '.'.join(ip_address.split('.')[:2])
                fp_raw = f"{user_agent_raw}-{ip_bits}"
                device_fingerprint = hashlib.sha256(fp_raw.encode()).hexdigest()
            
            # Parse user agent
            parsed_ua = parse(user_agent_raw)
            browser_name = parsed_ua.browser.family
            os_name = parsed_ua.os.family
            device_brand = parsed_ua.device.brand or UNKNOWN
            device_model = parsed_ua.device.model or UNKNOWN
            
            device_category = "Desktop/Laptop"
            if parsed_ua.is_mobile: device_category = "Mobile Device"
            elif parsed_ua.is_tablet: device_category = "Tablet"
            elif parsed_ua.is_bot: device_category = "Bot"

            device_name = f"{device_category} ({os_name})"
            if (parsed_ua.is_mobile or parsed_ua.is_tablet) and device_brand != UNKNOWN:
                device_name = f"{device_brand} {device_model}"

            # Check for existing device (atomic, race-safe)
            existing_device, created = UserDevice.objects.get_or_create(
                user=user,
                device_fingerprint=device_fingerprint,
                defaults={
                    'device_name': device_name,
                    'user_agent': user_agent_raw,
                    'ip_address': ip_address,
                    'geo_country': geo_data['country'],
                    'geo_city': geo_data['city'],
                    'timezone': geo_data['timezone'],
                    'isp': geo_data['isp'],
                    'lat': geo_data['lat'],
                    'lon': geo_data['lon'],
                    'is_trusted': False,
                }
            )

            send_alert = False
            alert_reason = ""

            if created:
                send_alert = True
                alert_reason = "New device or browser detected"
            else:
                # Check for anomalies on existing device
                if existing_device.geo_country and geo_data['country'] != existing_device.geo_country:
                    send_alert = True
                    alert_reason = f"Login from a new country: {geo_data['country']}"
                
                if not send_alert and existing_device.lat and geo_data['lat']:
                    speed = calculate_travel_speed(
                        existing_device.lat, existing_device.lon, existing_device.last_seen_at,
                        geo_data['lat'], geo_data['lon'], timezone.now()
                    )
                    if speed > 800:
                        send_alert = True
                        alert_reason = "Impossible travel detected"
                
                # Update device record
                existing_device.ip_address = ip_address
                existing_device.geo_city = geo_data['city']
                existing_device.geo_country = geo_data['country']
                existing_device.lat = geo_data['lat']
                existing_device.lon = geo_data['lon']
                existing_device.isp = geo_data['isp']
                existing_device.save()

            if send_alert and not parsed_ua.is_bot:
                send_login_alert_email(
                    to=user.email,
                    first_name=user.full_name.split(' ')[0],
                    device_name=device_name,
                    browser_name=f"{browser_name}",
                    login_location=f"{geo_data['city']}, {geo_data['country']}",
                    login_time=timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                    ip_address=ip_address,
                    confirm_url=f"{settings.FRONTEND_URL}/security/devices",
                    secure_url=f"{settings.FRONTEND_URL}/security",
                )
            
            # Log in Audit
            AuditLog.objects.create(
                user=user,
                action='LOGIN',
                resource='AUTH',
                ip_address=ip_address,
                details=f"Login successful. Device: {device_name}. Location: {geo_data['city']}. Reason: {alert_reason}"
            )

        except Exception as e:
            logger.warning("Device tracking error", extra={'error': str(e), 'email': user.email})
            
        tokens = get_tokens_for_user(user)
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'email_verified': user.email_verified,
                'onboarding_complete': user.onboarding_complete,
                'avatar_url': user.avatar_url
            },
            'tokens': tokens,
            'requires_email_verification': not user.email_verified,
            'requires_onboarding': not user.onboarding_complete
        }, status=status.HTTP_200_OK)

    # Consistent error format
    error_message = 'Login failed'
    if serializer.errors:
        if 'non_field_errors' in serializer.errors:
            error_message = serializer.errors['non_field_errors'][0]
        else:
            field = next(iter(serializer.errors))
            error_detail = serializer.errors[field]
            if isinstance(error_detail, list):
                error_detail = error_detail[0]
            error_message = f"{field}: {error_detail}"

    return Response({
        'success': False,
        'error': error_message,
        'errors': serializer.errors,
        'code': 'LOGIN_FAILED',
        'message': error_message
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # If token is already blacklisted or invalid, we still want to log out locally
                pass
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        auth_logger.error(f"Logout error: {str(e)}")
        return Response({
            'success': True,
            'message': 'Logout completed with errors',
            'error': str(e)
        }, status=status.HTTP_200_OK)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current user profile"""
    serializer = UserProfileSerializer(request.user, context={'request': request})
    return Response({
        'success': True,
        'user': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_signature_view(request):
    """Upload a digital signature image to Cloudinary"""
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        return Response(
            {'success': False, 'error': 'Image upload service is not configured.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    _ensure_cloudinary_configured()

    upload_data = None
    if 'signature' in request.FILES:
        upload_data = request.FILES['signature']
    elif 'signature_base64' in request.data:
        upload_data = request.data['signature_base64']
    else:
        return Response(
            {'success': False, 'error': 'No image provided. Send "signature" as a file or "signature_base64" as a data-URI.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Upload to Cloudinary with a specific folder
        result = cloudinary.uploader.upload(
            upload_data,
            folder=f"signatures/{request.user.id}",
            overwrite=True,
            resource_type="image"
        )
        
        signature_url = result.get('secure_url')
        
        # Save signature URL to student profile
        user = request.user
        user.signature_image = signature_url
        user.save()
        
        return Response({
            'success': True,
            'signature_url': signature_url,
            'message': 'Digital signature uploaded successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Signature upload error: {str(e)}")
        return Response({
            'success': False,
            'error': f"Upload failed: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding_view(request):
    """Complete user onboarding"""
    serializer = OnboardingSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'Onboarding completed successfully',
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar_view(request):
    """Upload a user avatar image to Cloudinary and return the hosted URL.

    Accepts either:
    - A multipart file upload with field name ``avatar`` (``request.FILES``).
    - A JSON body with field ``avatar_base64`` containing a data-URI string
      (``data:image/...;base64,...``).

    Returns JSON: ``{ "success": true, "avatar_url": "<cloudinary-url>" }``
    """
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        return Response(
            {'success': False, 'error': 'Image upload service is not configured.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    _ensure_cloudinary_configured()

    upload_data = None

    # Prefer a real file upload
    if 'avatar' in request.FILES:
        upload_data = request.FILES['avatar']
    elif 'avatar_base64' in request.data:
        upload_data = request.data['avatar_base64']
    else:
        return Response(
            {'success': False, 'error': 'No image provided. Send "avatar" as a file or "avatar_base64" as a data-URI.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = cloudinary.uploader.upload(
            upload_data,
            folder='presently/avatars',
            public_id=f'user_{request.user.id}',
            overwrite=True,
            resource_type='image',
            transformation=[
                {'width': 512, 'height': 512, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto', 'fetch_format': 'auto'},
            ],
        )
        return Response({'success': True, 'avatar_url': result['secure_url']}, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.error('Cloudinary upload failed for user %s: %s', request.user.id, exc)
        return Response(
            {'success': False, 'error': 'Failed to upload image. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['HEAD'])
@permission_classes([AllowAny])
def dashboard_venues_head(request):
    """Handle HEAD requests for dashboard/venues to prevent 404 errors from feedback scripts"""
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    """Request password reset - sends email with reset link"""
    email = (request.data.get('email') or '').strip().lower()

    if not email:
        return Response({
            'success': False,
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, is_active=True)

        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        # Send password reset email via internal email service
        send_reset_password_email(
            to=user.email,
            first_name=user.full_name.split(' ')[0],
            reset_url=reset_link,
            expiry_minutes=30,
            request_ip=request.META.get('REMOTE_ADDR', ''),
            request_browser=request.META.get('HTTP_USER_AGENT', ''),
            request_location=request.META.get('REMOTE_ADDR', ''),
        )

        logger.info(f"Password reset email sent to {email}")

        return Response({
            'success': True,
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        logger.warning("Password reset requested for non-existent email: %s", email)
        return Response({
            'success': False,
            'error': 'No active account found with this email address'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': 'Failed to send password reset email',
            'details': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """Reset password using token from email"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response({
            'success': False,
            'error': 'UID, token, and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id, is_active=True)
        
        # Check if token is valid
        if not default_token_generator.check_token(user, token):
            return Response({
                'success': False,
                'error': 'Invalid or expired reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password strength
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)
        
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({
            'success': False,
            'error': 'Invalid reset link'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_token_view(request):
    """Verify if password reset token is valid"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not all([uid, token]):
        return Response({
            'success': False,
            'error': 'UID and token are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id, is_active=True)
        
        if default_token_generator.check_token(user, token):
            return Response({
                'success': True,
                'valid': True,
                'email': user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': True,
                'valid': False,
                'error': 'Invalid or expired token'
            }, status=status.HTTP_200_OK)
            
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({
            'success': True,
            'valid': False,
            'error': 'Invalid token'
        }, status=status.HTTP_200_OK)


# Custom permission classes
class IsAdminUser(permissions.BasePermission):
    """Allow only admin users"""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, 'is_superuser', False) or request.user.role == UserRole.ADMIN)
        )


class IsLecturerOrAdmin(permissions.BasePermission):
    """Allow lecturers and admins"""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, 'is_superuser', False) or request.user.role in [UserRole.LECTURER, UserRole.ADMIN])
        )


class RequireRBACPermission(permissions.BasePermission):
    """Permission class that enforces resource.action RBAC checks."""

    def __init__(self, permission_codename: str, allow_lecturer: bool = False):
        self.permission_codename = permission_codename
        self.allow_lecturer = allow_lecturer

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Super admins bypass all permission checks
        if getattr(user, 'is_superuser', False):
            return True
        if self.allow_lecturer and user.role == UserRole.LECTURER:
            return True
        return bool(
            user
            and (user.role == UserRole.ADMIN or user_has_permission(user, self.permission_codename))
        )


# ViewSets
class InstitutionViewSet(viewsets.ModelViewSet):
    """ViewSet for Institution CRUD"""
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [RequireRBACPermission('system.settings.manage')]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Institution.objects.all().order_by('full_name')
        # Non-admin users can only see active institutions
        if self.request.user.is_authenticated and self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
        return queryset


class CollegeViewSet(viewsets.ModelViewSet):
    """ViewSet for College CRUD"""
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [RequireRBACPermission('system.settings.manage')]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = College.objects.all().order_by('name')
        institution_id = self.request.query_params.get('institution', None)
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        # Non-admin users can only see active colleges
        if self.request.user.is_authenticated and self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
        return queryset


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Department CRUD"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        """Get courses for this department"""
        department = self.get_object()
        courses = Course.objects.filter(department=department, is_active=True)

        # Filter by level/semester if provided
        level = request.query_params.get('level')
        semester = request.query_params.get('semester')
        if level:
            courses = courses.filter(level=level)
        if semester:
            courses = courses.filter(semester=semester)

        serializer = CourseSerializer(courses, many=True, context={'request': request})
        return Response({
            'success': True,
            'department': department.name,
            'courses': serializer.data
        })

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [RequireRBACPermission('system.settings.manage')]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Department.objects.all().order_by('name')
        college_id = self.request.query_params.get('college', None)
        institution_id = self.request.query_params.get('institution', None)
        
        if college_id:
            queryset = queryset.filter(college=college_id)
        if institution_id:
            queryset = queryset.filter(institution=institution_id)
        
        # Non-admin users can only see active departments
        if self.request.user.is_authenticated and self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
        return queryset


class VenueViewSet(viewsets.ModelViewSet):
    """ViewSet for Venue CRUD"""
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action == 'create':
            return [RequireRBACPermission('venues.create')]
        if self.action in ['update', 'partial_update']:
            return [RequireRBACPermission('venues.edit')]
        if self.action == 'destroy':
            return [RequireRBACPermission('venues.delete')]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        payload_summary = _safe_payload_summary(request.data)
        if payload_summary['truncated']:
            logger.warning(
                "Large venue payload detected",
                extra={
                    'keys': payload_summary['keys'],
                    'size_hint': payload_summary['size_hint'],
                    'preview': payload_summary['preview'],
                },
            )
        else:
            logger.info(
                "Creating venue",
                extra={
                    'keys': payload_summary['keys'],
                    'size_hint': payload_summary['size_hint'],
                    'preview': payload_summary['preview'],
                },
            )
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating venue: {str(e)}")
            raise
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        
        user = self.request.user
        queryset = Venue.objects.all().order_by('name')
        
        # Filtering by query parameters
        institution_id = self.request.query_params.get('institution', None)
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        
        name_search = self.request.query_params.get('name', None)
        if name_search:
            queryset = queryset.filter(
                Q(name__icontains=name_search) |
                Q(code__icontains=name_search) |
                Q(building_name__icontains=name_search)
            )
        
        # Role-based access control
        # Superusers and ADMIN role see everything
        if user.is_superuser or user.role == UserRole.ADMIN:
            return queryset
        
        # Others see active venues from their institution OR global venues
        queryset = queryset.filter(is_active=True)
        if user.institution:
            queryset = queryset.filter(Q(institution=user.institution) | Q(institution__isnull=True))
        else:
            # If user has no institution, they only see global venues
            queryset = queryset.filter(institution__isnull=True)
            
        return queryset

    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """Get IDs of venues that have active sessions right now"""
        now = timezone.now()
        active_venue_ids = AttendanceSession.objects.filter(
            is_active=True,
            start_time__lte=now,
            end_time__gte=now,
            venue__isnull=False
        ).values_list('venue_id', flat=True).distinct()
        
        return Response({
            'success': True,
            'active_venue_ids': list(active_venue_ids)
        })

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all sessions for this venue"""
        venue = self.get_object()
        sessions = AttendanceSession.objects.filter(venue=venue)
        serializer = AttendanceSessionSerializer(sessions, many=True)
        return Response({
            'success': True,
            'sessions': serializer.data
        })

    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """Get IDs of venues that have active sessions"""
        active_venue_ids = AttendanceSession.objects.filter(
            is_active=True,
            venue__isnull=False
        ).values_list('venue_id', flat=True).distinct()

        return Response({
            'success': True,
            'active_venue_ids': list(active_venue_ids)
        })


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for Course CRUD"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available', 'search', 'register', 'drop']:
            return [IsAuthenticated()]
        if self.action == 'enrolled_students':
            return [RequireRBACPermission('courses.view', allow_lecturer=True)]
        if self.action == 'create':
            return [RequireRBACPermission('courses.create', allow_lecturer=True)]
        if self.action in ['update', 'partial_update']:
            return [RequireRBACPermission('courses.edit', allow_lecturer=True)]
        if self.action == 'destroy':
            return [RequireRBACPermission('courses.delete', allow_lecturer=True)]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Course.objects.all().order_by('code')
        department_id = self.request.query_params.get('department', None)
        lecturer_id = self.request.query_params.get('lecturer', None)
        enrolled_param = self.request.query_params.get('enrolled', 'false').lower() == 'true'
        
        if department_id:
            queryset = queryset.filter(department__id=department_id)
        if lecturer_id:
            queryset = queryset.filter(lecturer_id=lecturer_id)
        
        # Lecturers can see their own courses (including inactive ones)
        if self.request.user.is_authenticated and self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(lecturer=self.request.user)
        elif self.request.user.is_authenticated and self.request.user.role == UserRole.STUDENT:
            # For students, filter by enrollment if requested OR if listing "my courses" (no other filters)
            # Only apply this if it's a list action
            search_param = self.request.query_params.get('search', None)
            
            if self.action == 'list' and (enrolled_param or (not department_id and not lecturer_id and not search_param)):
                enrolled_course_ids = CourseEnrollment.objects.filter(
                    student=self.request.user,
                    is_active=True
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(id__in=enrolled_course_ids)

            queryset = queryset.filter(is_active=True)
        else:
            # Non-lecturers (admins) only see active courses
            queryset = queryset.filter(is_active=True)
            
        return queryset

    def perform_create(self, serializer):
        """Auto-assign the lecturer if the user is a lecturer"""
        if self.request.user.role == UserRole.LECTURER:
            serializer.save(lecturer=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'])
    def enrolled_students(self, request, pk=None):
        """Get list of students enrolled in this course"""
        course = self.get_object()
        
        # Check if user has permission to view enrollments
        if request.user.role not in [UserRole.LECTURER, UserRole.ADMIN]:
            if course.lecturer != request.user:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = CourseEnrollment.objects.filter(
            course=course,
            is_active=True
        ).select_related('student')
        
        students = []
        for enrollment in enrollments:
            students.append({
                'id': str(enrollment.student.id),
                'name': enrollment.student.full_name,
                'email': enrollment.student.email,
                'matric_number': enrollment.student.matric_number,
                'department': enrollment.student.department.name if enrollment.student.department else None,
                'level': enrollment.student.level,
                'enrolled_at': enrollment.enrolled_at,
                'status': enrollment.status
            })
        
        return Response({
            'course_id': course.id,
            'course_code': course.code,
            'course_title': course.title,
            'enrolled_count': len(students),
            'students': students
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search for courses by course code"""
        code = request.query_params.get('code')
        if not code:
            return Response({
                'success': False,
                'error': 'Course code is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate that the course belongs to the student's institution
        queryset = Course.objects.filter(code__icontains=code, is_active=True)

        if request.user.role == UserRole.STUDENT and request.user.institution:
            queryset = queryset.filter(department__institution=request.user.institution).distinct()

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'results': serializer.data
        })

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register for a course"""
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'Only students can register for courses'
            }, status=status.HTTP_403_FORBIDDEN)

        course = self.get_object()

        # Validate student belongs to the institution of the course
        course_institution = course.institution
        if course_institution and request.user.institution and course_institution != request.user.institution:
             return Response({
                'success': False,
                'error': 'You can only register for courses in your institution'
            }, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate enrollments
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'status': 'ENROLLED', 'is_active': True}
        )

        if not created:
            if enrollment.is_active:
                return Response({
                    'success': False,
                    'error': 'Already enrolled in this course'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                enrollment.is_active = True
                enrollment.status = 'ENROLLED'
                enrollment.save()

        # Log activity
        AuditLog.objects.create(
            user=request.user,
            action='COURSE_REGISTRATION',
            resource_type='COURSE',
            resource_id=str(course.id),
            details={'course_code': course.code, 'course_title': course.title},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'success': True,
            'message': f'Successfully registered for {course.code}',
            'is_enrolled': True
        })

    @action(detail=True, methods=['post'])
    def drop(self, request, pk=None):
        """Drop a course"""
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'Only students can drop courses'
            }, status=status.HTTP_403_FORBIDDEN)

        course = self.get_object()
        enrollment = CourseEnrollment.objects.filter(student=request.user, course=course, is_active=True).first()

        if not enrollment:
            return Response({
                'success': False,
                'error': 'You are not enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)

        enrollment.is_active = False
        enrollment.status = 'DROPPED'
        enrollment.save()

        # Log activity
        AuditLog.objects.create(
            user=request.user,
            action='COURSE_DROP',
            resource_type='COURSE',
            resource_id=str(course.id),
            details={'course_code': course.code, 'course_title': course.title},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'success': True,
            'message': f'Successfully dropped {course.code}',
            'is_enrolled': False
        })

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available courses for student enrollment based on their department"""
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'This endpoint is only for students'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get courses from student's department
        queryset = Course.objects.filter(is_active=True)
        
        if request.user.department:
            if isinstance(request.user.department, str):
                queryset = queryset.filter(department__name=request.user.department)
            else:
                queryset = queryset.filter(department=request.user.department)
        
        if request.user.level:
            queryset = queryset.filter(level=request.user.level)
        
        # Get already enrolled course IDs
        enrolled_course_ids = CourseEnrollment.objects.filter(
            student=request.user,
            is_active=True
        ).values_list('course_id', flat=True)
        
        # Annotate with enrollment info
        courses = []
        for course in queryset:
            enrollment_count = CourseEnrollment.objects.filter(
                course=course,
                is_active=True
            ).count()
            
            courses.append({
                'id': course.id,
                'code': course.code,
                'title': course.title,
                'description': course.description,
                'credit_units': course.credit_units,
                'semester': course.semester,
                'level': course.level,
                'department': list(course.department.values_list('id', flat=True)),
                'department_name': ", ".join([d.name for d in course.department.all()]),
                'lecturer_name': course.lecturer.full_name if course.lecturer else None,
                'enrollment_count': enrollment_count,
                'can_enroll': course.id not in enrolled_course_ids,
                'is_active': course.is_active
            })
        
        return Response({
            'success': True,
            'courses': courses,
            'total': len(courses)
        })


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Course Enrollment CRUD"""
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        
        queryset = CourseEnrollment.objects.all().order_by('-enrolled_at')
        student_id = self.request.query_params.get('student', None)
        course_id = self.request.query_params.get('course', None)
        is_active = self.request.query_params.get('active', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Students can only see their own enrollments
        if self.request.user.is_authenticated and self.request.user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=self.request.user)
        
        # Lecturers can only see enrollments for their courses
        elif self.request.user.is_authenticated and self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(course__lecturer=self.request.user)
        
        return queryset.select_related('student', 'course')
    
    def perform_create(self, serializer):
        """Handle enrollment creation"""
        # Students can only enroll themselves
        if self.request.user.role == UserRole.STUDENT:
            serializer.save(student=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Student enrolls in a course"""
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'Only students can enroll in courses'
            }, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({
                'success': False,
                'error': 'course_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.get(id=course_id, is_active=True)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Course not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already enrolled
        existing_enrollment = CourseEnrollment.objects.filter(
            student=request.user,
            course=course
        ).first()
        
        if existing_enrollment:
            if existing_enrollment.is_active:
                return Response({
                    'success': False,
                    'error': 'Already enrolled in this course'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Reactivate enrollment
                existing_enrollment.is_active = True
                existing_enrollment.status = 'ENROLLED'
                existing_enrollment.save()
                serializer = self.get_serializer(existing_enrollment)
                return Response({
                    'success': True,
                    'message': 'Re-enrolled in course successfully',
                    'enrollment': serializer.data
                })
        
        # Create new enrollment
        enrollment = CourseEnrollment.objects.create(
            student=request.user,
            course=course,
            status='ENROLLED',
            is_active=True
        )
        
        serializer = self.get_serializer(enrollment)
        return Response({
            'success': True,
            'message': 'Enrolled in course successfully',
            'enrollment': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def drop(self, request, pk=None):
        """Student drops a course"""
        enrollment = self.get_object()
        
        # Students can only drop their own enrollments
        if request.user.role == UserRole.STUDENT and enrollment.student != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        enrollment.status = 'DROPPED'
        enrollment.is_active = False
        enrollment.save()
        
        return Response({
            'success': True,
            'message': 'Course dropped successfully'
        })


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance Session CRUD"""
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'check_in']:
            return [IsAuthenticated()]
        if self.action == 'create':
            return [RequireRBACPermission('sessions.create', allow_lecturer=True)]
        if self.action in ['update', 'partial_update']:
            return [RequireRBACPermission('sessions.edit', allow_lecturer=True)]
        if self.action == 'destroy':
            return [RequireRBACPermission('sessions.delete', allow_lecturer=True)]
        if self.action in ['end', 'manual_mark']:
            return [RequireRBACPermission('attendance.modify', allow_lecturer=True)]
        return [IsAuthenticated()]
    def perform_create(self, serializer):
        """Create session and notify enrolled students"""
        session = serializer.save()
        
        # Notify all enrolled students about the new session
        from notifications.models import Notification, NotificationType
        from notifications.services import NotificationService
        
        try:
            # Get all enrolled students for this course
            enrolled_students = CourseEnrollment.objects.filter(
                course=session.course,
                is_active=True
            ).select_related('student')
            
            # Create notifications for each enrolled student
            for enrollment in enrolled_students:
                student = enrollment.student
                
                # Create in-app notification
                notification = Notification.objects.create(
                    user=student,
                    title=f"New Session: {session.course.code}",
                    message=f"A new attendance session has been created for {session.course.title}. Session starts at {session.start_time.strftime('%I:%M %p')}.",
                    notification_type=NotificationType.SESSION_STARTED,
                    data={
                        'session_id': str(session.id),
                        'course_id': str(session.course.id),
                        'course_code': session.course.code,
                        'course_name': session.course.title,
                        'session_code': session.session_code,
                        'venue_name': session.venue.name if session.venue else None,
                        'start_time': session.start_time.isoformat(),
                        'end_time': session.end_time.isoformat(),
                    }
                )
                
                # Send push notification
                NotificationService.send_push_notification(
                    user=student,
                    title=notification.title,
                    message=notification.message,
                    data=notification.data,
                    notification_type=NotificationType.SESSION_STARTED
                )

                # Send email notification
                send_session_live_email(
                    to=student.email,
                    first_name=student.full_name.split(' ')[0],
                    course_code=session.course.code,
                    course_name=session.course.title,
                    lecturer_name=session.course.lecturer.full_name if session.course.lecturer else "Lecturer",
                    room_location=session.venue.name if session.venue else "Main Hall",
                    session_time=session.start_time.strftime('%I:%M %p'),
                    minutes_remaining=max(int((session.end_time - timezone.now()).total_seconds() // 60), 0),
                    closes_at=session.end_time.strftime('%I:%M %p'),
                    mark_url=f"{settings.FRONTEND_URL}/check-in/{session.session_code}",
                )
                
            logger.info(f"Sent notifications to {enrolled_students.count()} students for session {session.id}")
        except Exception as e:
            logger.error(f"Error sending session notifications: {str(e)}")
            # Don't fail session creation if notifications fail
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = AttendanceSession.objects.all().order_by('-start_time')
        course_id = self.request.query_params.get('course', None)
        is_active = self.request.query_params.get('active', None)
        
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Lecturers can only see sessions for their courses
        if self.request.user.is_authenticated and self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(course__lecturer=self.request.user)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """Lecturer manually ends a session"""
        session = self.get_object()
        
        # Check if user is the lecturer for this course or an admin
        if request.user.role != UserRole.ADMIN and session.course.lecturer != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
            
        session.is_active = False
        session.end_time = timezone.now()
        session.save()
        
        # Trigger session invalidation check
        is_valid = check_session_validity(session)
        
        return Response({
            'success': True,
            'message': 'Session ended successfully',
            'is_valid': is_valid,
            'invalidation_reason': session.invalidation_reason,
            'end_time': session.end_time
        })

    @action(detail=True, methods=['post'])
    def manual_mark(self, request, pk=None):
        """Lecturer manually marks a student present"""
        session = self.get_object()
        if request.user.role != UserRole.ADMIN and session.course.lecturer != request.user:
            return Response({'success': False, 'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        status_choice = request.data.get('status', 'PRESENT')
        reason = request.data.get('reason', 'Manual override by lecturer')

        if not student_id:
            return Response({'success': False, 'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = User.objects.get(id=student_id, role=UserRole.STUDENT)
            attendance, created = Attendance.objects.update_or_create(
                session=session,
                student=student,
                defaults={
                    'status': status_choice,
                    'confidence_score': 100,  # Manual override is 100% trusted
                    'notes': reason,
                    'checked_in_at': timezone.now()
                }
            )
            return Response({
                'success': True,
                'message': f"Student {student.full_name} marked as {status_choice}",
                'data': AttendanceSerializer(attendance).data
            })
        except User.DoesNotExist:
            return Response({'success': False, 'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Student check-in with multi-sample verification"""
        session = self.get_object()
        return perform_attendance_check_in(request, session)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance records"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [RequireRBACPermission('attendance.modify')]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Attendance.objects.all().order_by('-checked_in_at')
        course_id = self.request.query_params.get('course')
        session_id = self.request.query_params.get('session')
        student_id = self.request.query_params.get('student')
        status_filter = self.request.query_params.get('status')

        if course_id:
            queryset = queryset.filter(session__course_id=course_id)
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        # Roles restrictions
        user = self.request.user
        if user.is_authenticated and user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=user)
        elif user.is_authenticated and user.role == UserRole.LECTURER:
            queryset = queryset.filter(session__course__lecturer=user)

        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard_summary(request):
    """Aggregated stats for the Student Dashboard"""
    user = request.user
    if user.role != UserRole.STUDENT:
        return Response({'success': False, 'error': 'Not a student'}, status=403)
        
    now = timezone.now()
    # Enrollment count
    enrollments = CourseEnrollment.objects.filter(student=user, is_active=True)
    course_ids = enrollments.values_list('course_id', flat=True)
    
    # Active sessions in enrolled courses
    active_sessions = AttendanceSession.objects.filter(
        course_id__in=course_ids,
        is_active=True,
        end_time__gt=now
    ).select_related('course', 'venue')
    
    # Overall attendance rate
    all_sessions = AttendanceSession.objects.filter(course_id__in=course_ids, is_active=False)
    attended_count = Attendance.objects.filter(student=user, status='PRESENT', session__in=all_sessions).count()
    total_sessions_counted = all_sessions.count()
    overall_attendance = (attended_count / total_sessions_counted * 100) if total_sessions_counted > 0 else 0
    
    # Upcoming classes from timetable
    upcoming_classes = Timetable.objects.filter(
        course_id__in=course_ids,
        is_active=True
    ).order_by('day_of_week', 'start_time')[:5]

    return Response({
        'success': True,
        'data': {
            'overview': {
                'courses_count': len(course_ids),
                'overall_attendance': round(overall_attendance, 1),
                'active_sessions_count': active_sessions.count()
            },
            'active_sessions': AttendanceSessionSerializer(active_sessions, many=True).data,
            'upcoming_classes': TimetableSerializer(upcoming_classes, many=True).data,
            'recent_attendance': AttendanceSerializer(
                Attendance.objects.filter(student=user).order_by('-checked_in_at')[:5], 
                many=True
            ).data
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecturer_dashboard_summary(request):
    """Aggregated stats for the Lecturer Dashboard"""
    user = request.user
    if user.role != UserRole.LECTURER:
        return Response({'success': False, 'error': 'Not a lecturer'}, status=403)

    # Managed courses
    courses = Course.objects.filter(lecturer=user)
    course_ids = courses.values_list('id', flat=True)
    
    # Active sessions
    active_sessions = AttendanceSession.objects.filter(
        course_id__in=course_ids,
        is_active=True
    ).select_related('course', 'venue')
    
    # Total students reached (unique students in all courses)
    total_students = CourseEnrollment.objects.filter(course_id__in=course_ids, is_active=True).values('student').distinct().count()
    
    # Today's sessions count
    today = timezone.now().date()
    todays_sessions = AttendanceSession.objects.filter(course_id__in=course_ids, start_time__date=today).count()

    return Response({
        'success': True,
        'data': {
            'stats': {
                'total_courses': len(course_ids),
                'total_students': total_students,
                'active_sessions': active_sessions.count(),
                'todays_sessions': todays_sessions
            },
            'active_sessions': AttendanceSessionSerializer(active_sessions, many=True).data,
            'recent_sessions': AttendanceSessionSerializer(
                AttendanceSession.objects.filter(course_id__in=course_ids).order_by('-start_time')[:5],
                many=True
            ).data
        }
    })


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management (Admin only)"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        institution_id = self.request.query_params.get('institution', None)
        college_id = self.request.query_params.get('college', None)
        
        if role:
            queryset = queryset.filter(role=role)
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        if college_id:
            queryset = queryset.filter(college_id=college_id)
        
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [RequireRBACPermission('system.users.manage')]
        if self.action in ['invite_user']:
            return [RequireRBACPermission('system.staff.manage')]
        return [RequireRBACPermission('system.users.manage')]
    
    def update(self, request, *args, **kwargs):
        """Override update to prevent users from changing their own role"""
        instance = self.get_object()
        
        # Check if user is trying to change their own role
        if instance.id == request.user.id and 'role' in request.data:
            if request.data['role'] != instance.role:
                return Response({
                    'success': False,
                    'error': 'You cannot change your own role. Please contact another administrator.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to prevent users from changing their own role"""
        instance = self.get_object()
        
        # Check if user is trying to change their own role
        if instance.id == request.user.id and 'role' in request.data:
            if request.data['role'] != instance.role:
                return Response({
                    'success': False,
                    'error': 'You cannot change your own role. Please contact another administrator.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """Reset a user's password (Admin only)"""
        user = self.get_object()
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({
                'success': False,
                'error': 'New password is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        auth_logger.info(f"Password reset for user {user.email} by admin {request.user.email}")
        
        return Response({
            'success': True,
            'message': f'Password for {user.full_name} has been reset successfully.'
        })

    @action(detail=False, methods=['post'], url_path='invite')
    def invite_user(self, request):
        """Invite a new user to the platform (Admin only)"""
        email = request.data.get('email')
        full_name = request.data.get('full_name', '')
        role = request.data.get('role', UserRole.STUDENT)
        institution_id = request.data.get('institution_id')
        college_id = request.data.get('college_id')
        
        if not email:
            return Response({
                'success': False,
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate institution and college if provided
        institution = None
        college = None
        if institution_id:
            try:
                institution = Institution.objects.get(id=institution_id, is_active=True)
            except Institution.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid institution'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if college_id:
            try:
                college = College.objects.get(id=college_id, is_active=True)
                if institution and college.institution != institution:
                    return Response({
                        'success': False,
                        'error': 'College does not belong to the selected institution'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except College.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid college'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user with invitation
        user = User.objects.create(
            email=email,
            full_name=full_name,
            role=role,
            institution=institution,
            college=college,
            is_active=True,
            email_verified=False,
            onboarding_complete=False,
            invited_by=request.user
        )
        
        # Generate invitation token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create invitation link
        invite_link = f"{settings.FRONTEND_URL}/accept-invite?uid={uid}&token={token}"
        
        # Send invitation using the welcome template path.
        send_welcome_email(
            to=user.email,
            first_name=user.full_name.split(' ')[0],
            dashboard_url=invite_link,
        )
        
        logger.info(f"User invited: {user.email} by {request.user.email}")
        
        return Response({
            'success': True,
            'message': f'Invitation sent to {user.email}',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role
            }
        }, status=status.HTTP_201_CREATED)



@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def public_check_in_view(request, session_code):
    """Public check-in endpoint with multi-sample GPS verification."""
    try:
        # Normalize code to uppercase to avoid case-sensitivity issues
        session_code = session_code.upper()
        session = AttendanceSession.objects.get(session_code=session_code)
    except AttendanceSession.DoesNotExist:
        return Response({
            'status': 'error',
            'reason': 'Invalid session code'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # GET is public — no auth needed, no rate limit
        serializer = AttendanceSessionSerializer(session)
        return Response({
            'success': True,
            'session': serializer.data
        })
    
    elif request.method == 'POST':
        # Auth check happens FIRST, before any rate-limiting
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'status': 'error',
                'error': 'Authentication required to mark attendance'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Rate-limit AFTER auth using user identity only (POST requires auth).
        # Higher threshold prevents accidental lockouts from rapid scanner retries.
        check_in_rate = getattr(settings, 'PUBLIC_CHECK_IN_RATE', '20/m')
        ratelimited = is_ratelimited(
            request,
            group='check_in_post',
            key='user',
            rate=check_in_rate,
            increment=True,
        )
        if ratelimited:
            return Response({
                'success': False,
                'status': 'error',
                'error': 'Too many check-in attempts. Please wait a moment and try again.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        return perform_attendance_check_in(request, session)

class TimetableViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Timetable entries"""
    queryset = Timetable.objects.filter(is_active=True)
    serializer_class = TimetableSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'student', 'lecturer']:
            return [IsAuthenticated()]
        if self.action == 'create':
            return [RequireRBACPermission('courses.edit', allow_lecturer=True)]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [RequireRBACPermission('courses.edit', allow_lecturer=True)]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == UserRole.STUDENT:
                # Get registered courses for student
                enrolled_courses = CourseEnrollment.objects.filter(student=user, is_active=True).values_list('course_id', flat=True)
                return self.queryset.filter(course_id__in=enrolled_courses)
            elif user.role == UserRole.LECTURER:
                return self.queryset.filter(course__lecturer=user)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['GET'])
    def student(self, request):
        """Get student's weekly schedule"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def lecturer(self, request):
        """Get lecturer's weekly schedule"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    