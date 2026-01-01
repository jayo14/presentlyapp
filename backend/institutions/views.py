from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
import secrets

from .models import User, Institution, College, Department, Course, AttendanceSession, Attendance, UserRole
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    OnboardingSerializer, InstitutionSerializer, CollegeSerializer,
    DepartmentSerializer, CourseSerializer, AttendanceSessionSerializer,
    AttendanceSerializer, PasswordChangeSerializer
)


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


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for Course CRUD"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsLecturerOrAdmin()]
    
    def get_queryset(self):
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


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance Session CRUD"""
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsLecturerOrAdmin()]
    
    def get_queryset(self):
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
        """Student check-in to a session"""
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
        
        # Create attendance record
        attendance_data = {
            'session': session.id,
            'student': request.user.id,
            'latitude': request.data.get('latitude'),
            'longitude': request.data.get('longitude'),
            'location_verified': request.data.get('location_verified', False),
        }
        
        serializer = AttendanceSerializer(data=attendance_data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Check-in successful',
                'attendance': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance records"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
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


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management (Admin only)"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
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

