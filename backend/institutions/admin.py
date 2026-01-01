from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Institution, College, Department, Venue, Course, AttendanceSession, Attendance, EmailVerificationOTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model"""
    list_display = ['email', 'full_name', 'role', 'onboarding_complete', 'is_active', 'date_joined']
    list_filter = ['role', 'onboarding_complete', 'is_active', 'is_staff']
    search_fields = ['email', 'full_name', 'matric_number', 'staff_id']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'avatar_url', 'phone_number')}),
        ('Role & Institution', {'fields': ('role', 'institution', 'college', 'onboarding_complete')}),
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
class InstitutionAdmin(admin.ModelAdmin):
    """Admin configuration for Institution model"""
    list_display = ['full_name', 'short_name', 'city', 'institution_type', 'is_active', 'created_at']
    list_filter = ['institution_type', 'accreditation_status', 'is_active', 'country']
    search_fields = ['full_name', 'short_name', 'abbreviation', 'city']
    ordering = ['full_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    """Admin configuration for College model"""
    list_display = ['name', 'code', 'institution', 'is_active', 'created_at']
    list_filter = ['institution', 'is_active']
    search_fields = ['name', 'code', 'abbreviation']
    ordering = ['institution', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin configuration for Department model"""
    list_display = ['name', 'code', 'college', 'institution', 'is_active', 'created_at']
    list_filter = ['institution', 'college', 'is_active', 'accreditation_status']
    search_fields = ['name', 'code', 'abbreviation']
    ordering = ['institution', 'college', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
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
            'fields': ('latitude', 'longitude', 'elevation', 'boundary_coordinates', 'verification_radius')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin configuration for Course model"""
    list_display = ['code', 'title', 'department', 'lecturer', 'credit_units', 'is_active', 'created_at']
    list_filter = ['department', 'is_active', 'semester', 'level']
    search_fields = ['code', 'title', 'description']
    ordering = ['code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    """Admin configuration for AttendanceSession model"""
    list_display = ['session_code', 'course', 'venue', 'start_time', 'end_time', 'is_active', 'created_at']
    list_filter = ['course', 'venue', 'is_active', 'start_time']
    search_fields = ['session_code', 'course__code', 'course__title', 'venue__name']
    ordering = ['-start_time']
    readonly_fields = ['created_at', 'updated_at', 'session_code']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin configuration for Attendance model"""
    list_display = ['student', 'session', 'status', 'checked_in_at', 'location_verified', 'distance_from_venue']
    list_filter = ['status', 'location_verified', 'checked_in_at']
    search_fields = ['student__email', 'student__full_name', 'session__session_code']
    ordering = ['-checked_in_at']
    readonly_fields = ['checked_in_at']


@admin.register(EmailVerificationOTP)
class EmailVerificationOTPAdmin(admin.ModelAdmin):
    """Admin configuration for EmailVerificationOTP model"""
    list_display = ['user', 'otp', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'otp']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        # Prevent manual OTP creation through admin
        return False

