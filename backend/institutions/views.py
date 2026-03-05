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
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django_ratelimit.decorators import ratelimit
import secrets
import logging
import cloudinary
import cloudinary.uploader
import firebase_admin
from firebase_admin import auth as firebase_auth
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from user_agents import parse
from presently.firebase_config import initialize_firebase

from .attendance_logic import perform_attendance_check_in
from .models import (
    User, Institution, College, Department, Course, CourseEnrollment, AttendanceSession, 
    Attendance, Venue, UserRole, EmailVerificationOTP, AuditLog
)
from accounts.models import UserDevice
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OnboardingSerializer, InstitutionSerializer, CollegeSerializer,
    DepartmentSerializer, VenueSerializer, CourseSerializer, CourseEnrollmentSerializer, AttendanceSessionSerializer,
    AttendanceSerializer, PasswordChangeSerializer
)
from .geolocation_utils import verify_location, calculate_distance

# Configure logging
auth_logger = logging.getLogger('auth_events')
logger = logging.getLogger(__name__)

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

    response = requests.post(token_url, data=data)
    token_data = response.json()

    if 'error' in token_data:
        return Response({'error': token_data.get('error_description', 'Failed to exchange code')}, status=status.HTTP_400_BAD_REQUEST)

    access_token = token_data.get('access_token')

    # Get user info
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    user_info_response = requests.get(user_info_url, params={'access_token': access_token})
    user_info = user_info_response.json()

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
            
            # Send verification email
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
    """Send OTP verification email"""
    try:
        subject = "Welcome to Presently - Verify Your Email"
        
        context = {
            "user": user,
            "otp_code": otp_code,
        }
        
        html_message = render_to_string("emails/welcome_otp.html", context)

        plain_message = f"Hello {user.full_name},\n\nThank you for signing up for Presently!\n\nYour email verification code is: {otp_code}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nThe Presently Team"
        
        from django.core.mail import EmailMultiAlternatives
        
        msg = EmailMultiAlternatives(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        
        logger.info(f"Verification email sent to {user.email}")
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
        
        # Send email
        try:
            send_verification_email(user, otp_obj.otp)
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

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login"""
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Security: Device Tracking
        try:
            # Constants
            UNKNOWN = "Unknown"
            
            user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown Device')
            # Handle proxy headers for IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
            
            # Parse user agent for detailed information
            parsed_ua = parse(user_agent)
            
            # Extract detailed device information
            browser_name = parsed_ua.browser.family
            browser_version = parsed_ua.browser.version_string
            os_name = parsed_ua.os.family
            os_version = parsed_ua.os.version_string
            device_brand = parsed_ua.device.brand or UNKNOWN
            device_model = parsed_ua.device.model or UNKNOWN
            
            # Determine device category
            if parsed_ua.is_bot:
                device_category = "Bot"
            elif parsed_ua.is_mobile:
                device_category = "Mobile Device"
            elif parsed_ua.is_tablet:
                device_category = "Tablet"
            elif parsed_ua.is_pc:
                device_category = "Desktop/Laptop"
            else:
                device_category = "Unknown Device"
            
            # Create a more descriptive device name
            if parsed_ua.is_mobile or parsed_ua.is_tablet:
                if device_brand != UNKNOWN and device_model != UNKNOWN:
                    device_name = f"{device_brand} {device_model}"
                else:
                    device_name = f"{device_category} ({os_name})"
            else:
                device_name = f"{device_category} ({os_name})"
                
            # Check if device exists (skip bot tracking)
            if not parsed_ua.is_bot:
                device, created = UserDevice.objects.get_or_create(
                    user=user,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    defaults={'device_name': device_name}
                )
                
                if not created:
                    # Update last login
                    device.last_login = timezone.now()
                    device.save()
                else:
                    # New device detected - Send security alert
                    subject = 'New Login Detected - Presently'
                    context = {
                        'user': user,
                        'device_category': device_category,
                        'device_name': device_name,
                        'os_name': os_name,
                        'os_version': os_version,
                        'browser': f"{browser_name} {browser_version}",
                        'location': ip_address,
                        'time': timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                        'confirm_url': f"{settings.FRONTEND_URL}/auth/confirm-device",
                        'secure_url': f"{settings.FRONTEND_URL}/auth/reset-password",
                    }

                    html_message = render_to_string('emails/new_device_alert.html', context)
                    plain_message = (
                        f"New Login Detected - Presently\n\n"
                        f"Hello {user.full_name},\n"
                        f"We detected a login to your Presently account from a new device.\n"
                        f"Device: {device_name}\n"
                        f"Location: {ip_address}\n"
                        f"Time: {context['time']}\n"
                        f"If this was not you, please secure your account.\n"
                    )

                    from django.core.mail import EmailMultiAlternatives
                    msg = EmailMultiAlternatives(
                        subject,
                        plain_message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email]
                    )
                    msg.attach_alternative(html_message, 'text/html')
                    msg.send(fail_silently=True)
            else:
                # Log bot access but don't track or send alerts
                auth_logger.info(f"Bot user agent detected for user {user.email}: {user_agent}")
        except Exception as e:
            # Don't block login on tracking error
            print(f"Device tracking error: {e}")
            
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
    serializer = UserProfileSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    }, status=status.HTTP_200_OK)


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


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    """Request password reset - sends email with reset link"""
    email = request.data.get('email')
    
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
        
        # Send email with HTML template
        subject = 'Password Reset Request - Presently'
        
        context = {
            'user': user,
            'reset_link': reset_link,
        }

        html_message = render_to_string('emails/password_reset.html', context)
        
        plain_message = f"""
Hello {user.full_name},

You requested to reset your password for your Presently account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
The Presently Team
        """
        
        from django.core.mail import EmailMultiAlternatives
        
        msg = EmailMultiAlternatives(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        
        logger.info(f"Password reset email sent to {email}")
        
        return Response({
            'success': True,
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal if user exists or not for security
        logger.warning(f"Password reset requested for non-existent email: {email}")
        return Response({
            'success': True,
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)
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
        return request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN


class IsLecturerOrAdmin(permissions.BasePermission):
    """Allow lecturers and admins"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in [UserRole.LECTURER, UserRole.ADMIN]


# ViewSets
class InstitutionViewSet(viewsets.ModelViewSet):
    """ViewSet for Institution CRUD"""
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Institution.objects.all().order_by('full_name')
        # Non-admin users can only see active institutions
        if self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
        return queryset


class CollegeViewSet(viewsets.ModelViewSet):
    """ViewSet for College CRUD"""
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = College.objects.all().order_by('name')
        institution_id = self.request.query_params.get('institution', None)
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        # Non-admin users can only see active colleges
        if self.request.user.role != UserRole.ADMIN:
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
        return [IsAdminUser()]
    
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
        if self.request.user.role != UserRole.ADMIN:
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
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating venue with data: {request.data}")
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
        if self.action in ['list', 'retrieve', 'available', 'enrolled_students', 'search', 'register', 'drop']:
            return [IsAuthenticated()]
        return [IsLecturerOrAdmin()]
    
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
        if self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(lecturer=self.request.user)
        elif self.request.user.role == UserRole.STUDENT:
            # For students, filter by enrollment if requested OR if listing "my courses" (no other filters)
            # Only apply this if it's a list action
            if self.action == 'list' and (enrolled_param or (not department_id and not lecturer_id)):
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
        if self.request.user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=self.request.user)
        
        # Lecturers can only see enrollments for their courses
        elif self.request.user.role == UserRole.LECTURER:
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
        return [IsLecturerOrAdmin()]
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
        if self.request.user.role == UserRole.LECTURER:
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
        
        return Response({
            'success': True,
            'message': 'Session ended successfully',
            'end_time': session.end_time
        })

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
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Attendance.objects.all().order_by('-checked_in_at')
        session_id = self.request.query_params.get('session', None)
        student_id = self.request.query_params.get('student', None)
        
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Students can only see their own attendance
        if self.request.user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=self.request.user)
        # Lecturers can see attendance for their courses
        elif self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(session__course__lecturer=self.request.user)
        
        return queryset


class TimetableViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Timetable (DEFERRED - Read-only)"""
    queryset = __import__('institutions.models', fromlist=['Timetable']).Timetable.objects.all()
    serializer_class = __import__('institutions.serializers', fromlist=['TimetableSerializer']).TimetableSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        # Always return empty queryset since feature is deferred
        return self.queryset.model.objects.none()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management (Admin only)"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    
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



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/m', block=True)
def public_check_in_view(request, session_code):
    """Public check-in endpoint with multi-sample verification"""
    try:
        session = AttendanceSession.objects.get(session_code=session_code)
    except AttendanceSession.DoesNotExist:
        return Response({
            'status': 'error',
            'reason': 'Invalid session code'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AttendanceSessionSerializer(session)
        return Response({
            'success': True,
            'session': serializer.data
        })
    
    elif request.method == 'POST':
        return perform_attendance_check_in(request, session)
