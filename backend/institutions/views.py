from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import secrets

from .models import (
    User, Institution, College, Department, Course, CourseEnrollment, AttendanceSession, 
    Attendance, Venue, UserRole, EmailVerificationOTP
)
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OnboardingSerializer, InstitutionSerializer, CollegeSerializer,
    DepartmentSerializer, VenueSerializer, CourseSerializer, CourseEnrollmentSerializer, AttendanceSessionSerializer,
    AttendanceSerializer, PasswordChangeSerializer
)
from .geolocation_utils import verify_location, calculate_distance


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
def register_view(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'onboarding_complete': user.onboarding_complete
            },
            'tokens': tokens,
            'requires_onboarding': True
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# Add these views to institutions/views.py after the register_view

def send_verification_email(user, otp_code):
    """Send OTP verification email"""
    subject = 'Verify Your Email - Presently'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .otp-box {{ background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
            .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Presently</h1>
                <p>Verify Your Email Address</p>
            </div>
            <div class="content">
                <h2>Hello {user.full_name},</h2>
                <p>Thank you for signing up for Presently! To complete your registration, please verify your email address using the OTP code below:</p>
                
                <div class="otp-box">
                    <p style="margin: 0; color: #666;">Your Verification Code</p>
                    <div class="otp-code">{otp_code}</div>
                    <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">This code will expire in 15 minutes</p>
                </div>
                
                <p>If you didn't create an account with Presently, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2026 Presently. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
Hello {user.full_name},

Thank you for signing up for Presently!

Your email verification code is: {otp_code}

This code will expire in 15 minutes.

Best regards,
The Presently Team
    """
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )


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
        send_verification_email(user, otp_obj.otp)
        
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
        tokens = get_tokens_for_user(user)
        return Response({
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
            'requires_onboarding': not user.onboarding_complete
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


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
        
        # Send email
        subject = 'Password Reset Request'
        message = f"""
Hello {user.full_name},

You requested to reset your password for your Presently account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
The Presently Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'success': True,
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Don't reveal if user exists or not for security
        return Response({
            'success': True,
            'message': 'Password reset email sent successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Failed to send password reset email'
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
        queryset = Institution.objects.all()
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
        queryset = College.objects.all()
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
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Department.objects.all()
        college_id = self.request.query_params.get('college', None)
        institution_id = self.request.query_params.get('institution', None)
        
        if college_id:
            queryset = queryset.filter(college_id=college_id)
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        
        # Non-admin users can only see active departments
        if self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
        return queryset


class VenueViewSet(viewsets.ModelViewSet):
    """ViewSet for Venue CRUD"""
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Venue.objects.all()
        institution_id = self.request.query_params.get('institution', None)
        
        if institution_id:
            queryset = queryset.filter(institution_id=institution_id)
        
        # Non-admin users can only see active venues from their institution
        if self.request.user.role != UserRole.ADMIN:
            queryset = queryset.filter(is_active=True)
            if self.request.user.institution:
                queryset = queryset.filter(institution=self.request.user.institution)
        
        return queryset
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def sessions(self, request, pk=None):
        """Get all sessions for this venue"""
        venue = self.get_object()
        sessions = AttendanceSession.objects.filter(venue=venue)
        serializer = AttendanceSessionSerializer(sessions, many=True)
        return Response({
            'success': True,
            'sessions': serializer.data
        })


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for Course CRUD"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsLecturerOrAdmin()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Course.objects.all()
        department_id = self.request.query_params.get('department', None)
        lecturer_id = self.request.query_params.get('lecturer', None)
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if lecturer_id:
            queryset = queryset.filter(lecturer_id=lecturer_id)
        
        # Lecturers can only see their own courses
        if self.request.user.role == UserRole.LECTURER:
            queryset = queryset.filter(lecturer=self.request.user)
        
        # Only show active courses
        queryset = queryset.filter(is_active=True)
        return queryset
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
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
                'department': enrollment.student.department,
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


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Course Enrollment CRUD"""
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        
        queryset = CourseEnrollment.objects.all()
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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsLecturerOrAdmin()]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = AttendanceSession.objects.all()
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def check_in(self, request, pk=None):
        """Student check-in to a session with GPS verification"""
        session = self.get_object()
        
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'Only students can check in'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not session.is_active:
            return Response({
                'success': False,
                'error': 'This session is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if session has ended
        if timezone.now() > session.end_time:
            return Response({
                'success': False,
                'error': 'This session has ended'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get student location
        student_lat = request.data.get('latitude')
        student_lon = request.data.get('longitude')
        student_elevation = request.data.get('elevation')
        
        if not student_lat or not student_lon:
            return Response({
                'success': False,
                'error': 'Location data is required for check-in'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get location data from session
        location_data = session.get_location_coords()
        
        if not location_data.get('latitude') or not location_data.get('longitude'):
            return Response({
                'success': False,
                'error': 'Session location is not configured'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify location
        is_verified, distance = verify_location(
            float(student_lat),
            float(student_lon),
            float(student_elevation) if student_elevation else None,
            location_data['latitude'],
            location_data['longitude'],
            location_data['elevation'],
            location_data['boundary'],
            location_data['radius']
        )
        
        # Determine status based on time
        now = timezone.now()
        grace_period = timezone.timedelta(minutes=15)  # 15 minutes grace period
        status_value = 'PRESENT'
        
        if now > session.start_time + grace_period:
            status_value = 'LATE'
        
        # Create attendance record
        attendance_data = {
            'session': session.id,
            'student': request.user.id,
            'latitude': student_lat,
            'longitude': student_lon,
            'elevation': student_elevation,
            'location_verified': is_verified,
            'distance_from_venue': distance,
            'status': status_value,
        }
        
        serializer = AttendanceSerializer(data=attendance_data)
        if serializer.is_valid():
            attendance = serializer.save()
            
            response_data = {
                'success': True,
                'message': 'Check-in successful' if is_verified else 'Check-in recorded but location not verified',
                'attendance': serializer.data,
                'location_verified': is_verified,
                'distance_from_venue': float(distance),
            }
            
            if not is_verified:
                response_data['warning'] = f'You are {distance:.1f} meters from the venue. Check-in recorded but may be flagged.'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        # Check if session is within time range
        if not session.is_within_time_range():
            return Response({
                'success': False,
                'error': 'This session is not currently running'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already checked in
        existing_attendance = Attendance.objects.filter(
            session=session,
            student=request.user
        ).first()
        
        if existing_attendance:
            return Response({
                'success': False,
                'error': 'You have already checked in to this session',
                'attendance': AttendanceSerializer(existing_attendance).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get student location
        student_lat = request.data.get('latitude')
        student_lng = request.data.get('longitude')
        
        location_verified = False
        distance_from_venue = None
        
        if student_lat and student_lng:
            # Verify GPS location
            location_verified = session.verify_location(student_lat, student_lng)
            
            if session.latitude and session.longitude:
                from haversine import haversine, Unit
                session_location = (float(session.latitude), float(session.longitude))
                student_location = (float(student_lat), float(student_lng))
                distance_from_venue = haversine(session_location, student_location, unit=Unit.METERS)
            
            if not location_verified:
                return Response({
                    'success': False,
                    'error': f'You are too far from the session location. You must be within {session.location_radius} meters.',
                    'distance': distance_from_venue,
                    'required_radius': session.location_radius
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine attendance status (PRESENT or LATE)
        now = timezone.now()
        late_threshold = session.start_time + timezone.timedelta(minutes=15)  # 15 minutes grace period
        attendance_status = 'LATE' if now > late_threshold else 'PRESENT'
        
        # Create attendance record
        attendance = Attendance.objects.create(
            session=session,
            student=request.user,
            latitude=student_lat,
            longitude=student_lng,
            location_verified=location_verified,
            status=attendance_status
        )
        
        return Response({
            'success': True,
            'message': f'Check-in successful! Status: {attendance_status}',
            'attendance': AttendanceSerializer(attendance).data,
            'distance_from_venue': distance_from_venue,
            'location_verified': location_verified
        }, status=status.HTTP_201_CREATED)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance records"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return self.queryset.model.objects.none()
        queryset = Attendance.objects.all()
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



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def public_check_in_view(request, session_code):
    """
    Public check-in endpoint for QR code URLs
    GET: Returns session details
    POST: Performs check-in
    """
    try:
        session = AttendanceSession.objects.get(session_code=session_code)
    except AttendanceSession.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Invalid session code'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return session details
        serializer = AttendanceSessionSerializer(session)
        return Response({
            'success': True,
            'session': serializer.data
        })
    
    elif request.method == 'POST':
        # Perform check-in (reuse logic from AttendanceSessionViewSet.check_in)
        if request.user.role != UserRole.STUDENT:
            return Response({
                'success': False,
                'error': 'Only students can check in'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not session.is_active:
            return Response({
                'success': False,
                'error': 'This session is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if session is within time range
        if not session.is_within_time_range():
            return Response({
                'success': False,
                'error': 'This session is not currently running'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already checked in
        existing_attendance = Attendance.objects.filter(
            session=session,
            student=request.user
        ).first()
        
        if existing_attendance:
            return Response({
                'success': False,
                'error': 'You have already checked in to this session',
                'attendance': AttendanceSerializer(existing_attendance).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get student location
        student_lat = request.data.get('latitude')
        student_lng = request.data.get('longitude')
        
        location_verified = False
        distance_from_venue = None
        
        if student_lat and student_lng:
            # Verify GPS location
            location_verified = session.verify_location(student_lat, student_lng)
            
            if session.latitude and session.longitude:
                from haversine import haversine, Unit
                session_location = (float(session.latitude), float(session.longitude))
                student_location = (float(student_lat), float(student_lng))
                distance_from_venue = haversine(session_location, student_location, unit=Unit.METERS)
            
            if not location_verified:
                return Response({
                    'success': False,
                    'error': f'You are too far from the session location. You must be within {session.location_radius} meters.',
                    'distance': distance_from_venue,
                    'required_radius': session.location_radius
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine attendance status (PRESENT or LATE)
        now = timezone.now()
        late_threshold = session.start_time + timezone.timedelta(minutes=15)  # 15 minutes grace period
        attendance_status = 'LATE' if now > late_threshold else 'PRESENT'
        
        # Create attendance record
        attendance = Attendance.objects.create(
            session=session,
            student=request.user,
            latitude=student_lat,
            longitude=student_lng,
            location_verified=location_verified,
            status=attendance_status
        )
        
        return Response({
            'success': True,
            'message': f'Check-in successful! Status: {attendance_status}',
            'attendance': AttendanceSerializer(attendance).data,
            'distance_from_venue': distance_from_venue,
            'location_verified': location_verified
        }, status=status.HTTP_201_CREATED)
