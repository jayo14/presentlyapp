from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    register_view, login_view, google_auth_view, google_callback_view, logout_view, current_user_view,
    complete_onboarding_view, upload_avatar_view, upload_signature_view, change_password_view,
    send_verification_otp_view, verify_email_otp_view,
    request_password_reset_view, reset_password_view, verify_reset_token_view, public_check_in_view,
    InstitutionViewSet, CollegeViewSet, DepartmentViewSet,
    CourseViewSet, CourseEnrollmentViewSet, AttendanceSessionViewSet, AttendanceViewSet, UserViewSet,
    VenueViewSet, TimetableViewSet, student_dashboard_summary, lecturer_dashboard_summary, dashboard_venues_head
)
from .staff_views import (
    staff_accept_invite_view,
    staff_invitations_view,
    staff_invite_view,
    staff_permissions_catalog_view,
    staff_profiles_view,
    staff_resend_invite_view,
    staff_revoke_invite_view,
    staff_roles_view,
    staff_update_view,
)
from accounts.views import (
    list_devices_view,
    update_device_view,
    revoke_device_view,
    login_activity_view,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'course-enrollments', CourseEnrollmentViewSet, basename='course-enrollment')
router.register(r'sessions', AttendanceSessionViewSet, basename='session')
router.register(r'attendances', AttendanceViewSet, basename='attendance')
router.register(r'users', UserViewSet, basename='user')
router.register(r'timetables', TimetableViewSet, basename='timetable')  # Read-only, deferred

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/google-auth/', google_auth_view, name='google-auth'),
    path('auth/google-callback/', google_callback_view, name='google-callback'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current-user'),
    path('auth/onboarding/', complete_onboarding_view, name='complete-onboarding'),
    path('auth/upload-avatar/', upload_avatar_view, name='upload-avatar'),
    path('auth/upload-signature/', upload_signature_view, name='upload-signature'),
    path('auth/change-password/', change_password_view, name='change-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Email verification endpoints
    path('auth/email-verification/send/', send_verification_otp_view, name='send-verification-otp'),
    path('auth/email-verification/verify/', verify_email_otp_view, name='verify-email-otp'),
    
    # Password reset endpoints
    path('auth/password-reset/request/', request_password_reset_view, name='request-password-reset'),
    path('auth/password-reset/verify/', verify_reset_token_view, name='verify-reset-token'),
    path('auth/password-reset/confirm/', reset_password_view, name='reset-password'),
    
    # Public check-in (QR code URL)
    path('check-in/<str:session_code>/', public_check_in_view, name='public-check-in'),
    
    # Dashboard summaries
    path('dashboard/student/', student_dashboard_summary, name='student-dashboard-summary'),
    path('dashboard/lecturer/', lecturer_dashboard_summary, name='lecturer-dashboard-summary'),
    path('dashboard/venues/', dashboard_venues_head, name='dashboard-venues-head'),

    # Staff management & RBAC endpoints
    path('rbac/permissions/', staff_permissions_catalog_view, name='rbac-permissions-catalog'),
    path('rbac/roles/', staff_roles_view, name='rbac-roles'),
    path('staff/', staff_profiles_view, name='staff-profiles'),
    path('staff/<uuid:user_id>/', staff_update_view, name='staff-update'),
    path('staff/invitations/', staff_invitations_view, name='staff-invitations'),
    path('staff/invitations/invite/', staff_invite_view, name='staff-invite'),
    path('staff/invitations/<int:invitation_id>/resend/', staff_resend_invite_view, name='staff-invite-resend'),
    path('staff/invitations/<int:invitation_id>/revoke/', staff_revoke_invite_view, name='staff-invite-revoke'),
    path('auth/staff-invitations/accept/', staff_accept_invite_view, name='staff-accept-invite'),
    
    # Security — device management & login activity
    path('security/devices/', list_devices_view, name='security-devices-list'),
    path('security/devices/<int:device_id>/', update_device_view, name='security-device-update'),
    path('security/devices/<int:device_id>/revoke/', revoke_device_view, name='security-device-revoke'),
    path('security/activity/', login_activity_view, name='security-login-activity'),

    # Include router URLs
    path('', include(router.urls)),
]
