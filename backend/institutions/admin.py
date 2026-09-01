from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin

from .models import (
    User, Institution, College, Department, Venue, Course, CourseMembership, CourseEnrollment,
    AttendanceSession, Attendance, EmailVerificationOTP, Timetable, AuditLog,
    RBACPermission, StaffRole, StaffProfile, UserPermission, StaffInvitation
)



@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    """Admin configuration for custom User model"""
    list_display = ['email', 'full_name', 'role', 'is_restricted', 'restriction_reason', 'matric_number', 'staff_id', 'department', 'institution', 'college', 'onboarding_complete', 'is_active', 'last_login', 'date_joined']
    list_filter = ['is_restricted', 'restriction_reason', 'role', 'onboarding_complete', 'is_active', 'is_staff']
    list_select_related = ['department', 'institution', 'college']
    search_fields = ['email', 'full_name', 'matric_number', 'staff_id']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'avatar_url', 'phone_number', 'signature_image')}),
        ('Role & Institution', {'fields': ('role', 'institution', 'college', 'onboarding_complete')}),
        ('Account Restriction', {'fields': ('is_restricted', 'restriction_reason', 'restriction_note', 'restricted_at')}),
        ('Student Fields', {'fields': ('matric_number', 'department', 'level')}),
        ('Lecturer Fields', {'fields': ('staff_id', 'courses')}),
        ('Class Rep Fields', {'fields': ('assigned_lecturer',)}),
        ('Preferences', {'fields': ('notifications_enabled', 'location_enabled', 'dark_mode')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )

    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(Institution)
class InstitutionAdmin(ModelAdmin):
    """Admin configuration for Institution model"""
    list_display = ['full_name', 'short_name', 'city', 'institution_type', 'is_active', 'created_at']
    list_filter = ['institution_type', 'accreditation_status', 'is_active', 'country']
    search_fields = ['full_name', 'short_name', 'abbreviation', 'city']
    ordering = ['full_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(College)
class CollegeAdmin(ModelAdmin):
    """Admin configuration for College model"""
    list_display = ['name', 'code', 'institution', 'is_active', 'created_at']
    list_filter = ['institution', 'is_active']
    search_fields = ['name', 'code', 'abbreviation']
    ordering = ['institution', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Department)
class DepartmentAdmin(ModelAdmin):
    """Admin configuration for Department model"""
    list_display = ['name', 'code', 'college', 'institution', 'is_active', 'created_at']
    list_filter = ['institution', 'college', 'is_active', 'accreditation_status']
    search_fields = ['name', 'code', 'abbreviation']
    ordering = ['institution', 'college', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Venue)
class VenueAdmin(ModelAdmin):
    """Admin configuration for Venue model"""
    list_display = ['name', 'code', 'institution', 'building_name', 'capacity', 'is_active', 'created_at']
    list_filter = ['institution', 'is_active']
    search_fields = ['name', 'code', 'building_name']
    ordering = ['institution', 'name']
    readonly_fields = ['created_at', 'updated_at']
    

    
    fieldsets = (
        ('Basic Information', {
            'fields': ('institution', 'name', 'code', 'description')
        }),
        ('Location Details', {
            'fields': ('building_name', 'floor_number', 'room_number', 'capacity')
        }),
        ('Geolocation', {
            'fields': ('latitude', 'longitude', 'elevation', 'boundary', 'verification_radius'),
            'description': 'Enter coordinates manually.'
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    """Admin configuration for Course model"""
    list_display = ['code', 'title', 'get_departments', 'lecturer', 'credit_units', 'is_active', 'created_at']
    list_filter = ['is_active', 'semester', 'level']
    list_select_related = ['lecturer']
    search_fields = ['code', 'title', 'description']
    ordering = ['code']
    readonly_fields = ['created_at', 'updated_at']

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('department')

    def get_departments(self, obj):
        return ", ".join([d.name for d in obj.department.all()])
    get_departments.short_description = 'Departments'


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(ModelAdmin):
    """Admin configuration for AttendanceSession model"""
    list_display = ['session_code', 'course', 'venue', 'start_time', 'end_time', 'is_active', 'is_valid', 'created_at']
    list_filter = ['course', 'venue', 'is_active', 'is_valid', 'start_time']
    search_fields = ['session_code', 'course__code', 'course__title', 'venue__name']
    ordering = ['-start_time']
    readonly_fields = ['created_at', 'updated_at', 'session_code', 'is_valid', 'invalidation_reason']


@admin.register(Attendance)
class AttendanceAdmin(ModelAdmin):
    """Admin configuration for Attendance model"""
    list_display = ['student', 'session', 'status', 'checked_in_at', 'location_verified', 'distance_from_venue']
    list_filter = ['status', 'location_verified', 'checked_in_at']
    search_fields = ['student__email', 'student__full_name', 'session__session_code']
    ordering = ['-checked_in_at']
    readonly_fields = ['checked_in_at']


@admin.register(EmailVerificationOTP)
class EmailVerificationOTPAdmin(ModelAdmin):
    """Admin configuration for EmailVerificationOTP model"""
    list_display = ['user', 'otp', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'otp']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        # Prevent manual OTP creation through admin
        return False

@admin.register(Timetable)
class TimetableAdmin(ModelAdmin):
    """Admin configuration for Timetable model"""
    list_display = ['course', 'day_of_week', 'start_time', 'end_time', 'venue', 'semester', 'is_active']
    list_filter = ['day_of_week', 'semester', 'academic_year', 'is_active']
    search_fields = ['course__code', 'course__title', 'venue__name']
    ordering = ['day_of_week', 'start_time']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CourseMembership)
class CourseMembershipAdmin(ModelAdmin):
    """Admin configuration for CourseMembership model"""
    list_display = ['user', 'course', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['user__email', 'user__full_name', 'course__code', 'course__title']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    """Admin configuration for CourseEnrollment model"""
    list_display = ['student', 'course', 'status', 'is_active', 'enrolled_at']
    list_filter = ['status', 'is_active', 'enrolled_at']
    search_fields = ['student__email', 'student__full_name', 'course__code', 'course__title']
    ordering = ['-enrolled_at']
    readonly_fields = ['enrolled_at', 'updated_at']


@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    """Admin configuration for AuditLog model"""
    list_display = ['user', 'action', 'resource_type', 'resource_id', 'ip_address', 'timestamp']
    list_filter = ['action', 'resource_type', 'timestamp']
    search_fields = ['user__email', 'action', 'resource_type', 'resource_id']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']

    def has_add_permission(self, request):
        return False


@admin.register(RBACPermission)
class RBACPermissionAdmin(ModelAdmin):
    """Admin configuration for RBACPermission model"""
    list_display = ['codename', 'name', 'group', 'is_dangerous', 'enabled_by_default']
    list_filter = ['group', 'is_dangerous', 'enabled_by_default']
    search_fields = ['codename', 'name', 'group', 'description']
    ordering = ['group', 'codename']


@admin.register(StaffRole)
class StaffRoleAdmin(ModelAdmin):
    """Admin configuration for StaffRole model"""
    list_display = ['name', 'slug', 'is_system', 'is_active', 'created_at']
    list_filter = ['is_system', 'is_active']
    search_fields = ['name', 'slug', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StaffProfile)
class StaffProfileAdmin(ModelAdmin):
    """Admin configuration for StaffProfile model"""
    list_display = ['user', 'role', 'status', 'invited_by', 'created_at']
    list_filter = ['status', 'role']
    search_fields = ['user__email', 'user__full_name', 'role__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserPermission)
class UserPermissionAdmin(ModelAdmin):
    """Admin configuration for UserPermission model"""
    list_display = ['user', 'permission', 'allowed', 'created_by', 'created_at']
    list_filter = ['allowed', 'permission__group']
    search_fields = ['user__email', 'permission__codename']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StaffInvitation)
class StaffInvitationAdmin(ModelAdmin):
    """Admin configuration for StaffInvitation model"""
    list_display = ['email', 'full_name', 'role', 'status']
    list_filter = ['status', 'role']
    search_fields = ['email', 'full_name']
    readonly_fields = ['token_hash']

