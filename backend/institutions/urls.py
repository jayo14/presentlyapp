from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    register_view, login_view, logout_view, current_user_view,
    complete_onboarding_view, change_password_view,
    request_password_reset_view, reset_password_view, verify_reset_token_view,
    InstitutionViewSet, CollegeViewSet, DepartmentViewSet,
    CourseViewSet, AttendanceSessionViewSet, AttendanceViewSet, UserViewSet
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'sessions', AttendanceSessionViewSet, basename='session')
router.register(r'attendances', AttendanceViewSet, basename='attendance')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current-user'),
    path('auth/onboarding/', complete_onboarding_view, name='complete-onboarding'),
    path('auth/change-password/', change_password_view, name='change-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password reset endpoints
    path('auth/password-reset/request/', request_password_reset_view, name='request-password-reset'),
    path('auth/password-reset/verify/', verify_reset_token_view, name='verify-reset-token'),
    path('auth/password-reset/confirm/', reset_password_view, name='reset-password'),
    
    # Include router URLs
    path('', include(router.urls)),
]
