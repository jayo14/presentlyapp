from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import EmailValidator
import uuid
import random
import string


class UserRole(models.TextChoices):
    """User role choices matching the Supabase schema"""
    STUDENT = 'STUDENT', 'Student'
    LECTURER = 'LECTURER', 'Lecturer'
    ADMIN = 'ADMIN', 'Admin'
    CLASS_REP = 'CLASS_REP', 'Class Representative'


class Institution(models.Model):
    """Educational institutions (Universities, Polytechnics, etc.)"""
    
    INSTITUTION_TYPES = [
        ('UNIVERSITY', 'University'),
        ('POLYTECHNIC', 'Polytechnic'),
        ('COLLEGE', 'College'),
        ('INSTITUTE', 'Institute'),
    ]
    
    ACCREDITATION_STATUS = [
        ('ACCREDITED', 'Accredited'),
        ('PROVISIONAL', 'Provisional'),
        ('PENDING', 'Pending'),
    ]
    
    full_name = models.TextField(unique=True)
    short_name = models.TextField(unique=True)  # e.g., "OAU", "UNILAG"
    abbreviation = models.TextField(unique=True)
    description = models.TextField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Location
    country = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Institution details
    established_year = models.IntegerField(blank=True, null=True)
    institution_type = models.CharField(max_length=20, choices=INSTITUTION_TYPES, blank=True, null=True)
    accreditation_status = models.CharField(max_length=20, choices=ACCREDITATION_STATUS, blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    cover_image_url = models.URLField(blank=True, null=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'institutions'
        indexes = [
            models.Index(fields=['short_name']),
            models.Index(fields=['abbreviation']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.short_name})"


class College(models.Model):
    """Colleges/Faculties within institutions"""
    
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='colleges')
    name = models.TextField()
    code = models.CharField(max_length=20)  # e.g., "COS", "COLENG"
    abbreviation = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    
    # Contact Information
    dean_name = models.CharField(max_length=200, blank=True, null=True)
    dean_email = models.EmailField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    
    # Location within institution
    building_block = models.CharField(max_length=100, blank=True, null=True)
    office_location = models.CharField(max_length=200, blank=True, null=True)
    
    # Metadata
    established_year = models.IntegerField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'colleges'
        unique_together = [['institution', 'code']]
        indexes = [
            models.Index(fields=['institution']),
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Department(models.Model):
    """Academic departments within colleges"""
    
    ACCREDITATION_STATUS = [
        ('ACCREDITED', 'Accredited'),
        ('PROVISIONAL', 'Provisional'),
        ('PENDING', 'Pending'),
    ]
    
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='departments')
    name = models.TextField()
    code = models.CharField(max_length=20)
    abbreviation = models.CharField(max_length=20)
    description = models.TextField(blank=True, null=True)
    
    # Contact
    head_of_department_name = models.CharField(max_length=200, blank=True, null=True)
    head_of_department_email = models.EmailField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    office_location = models.CharField(max_length=200, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    
    # Academic details
    established_year = models.IntegerField(blank=True, null=True)
    accreditation_status = models.CharField(max_length=20, choices=ACCREDITATION_STATUS, blank=True, null=True)
    
    # Metadata
    logo_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        unique_together = [['college', 'code']]
        indexes = [
            models.Index(fields=['college']),
            models.Index(fields=['institution']),
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('onboarding_complete', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with role-based fields"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)
    avatar_url = models.URLField(blank=True, null=True)
    onboarding_complete = models.BooleanField(default=False)
    
    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Institutional Affiliation
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    # Contact Information
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Student-specific fields
    matric_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    department = models.CharField(max_length=200, blank=True, null=True)
    level = models.CharField(max_length=20, blank=True, null=True)
    
    # Lecturer-specific fields
    staff_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    courses = models.TextField(blank=True, null=True)  # Comma-separated for now
    
    # Class Rep-specific fields
    assigned_lecturer = models.CharField(max_length=200, blank=True, null=True)
    
    # Preferences
    notifications_enabled = models.BooleanField(default=True)
    location_enabled = models.BooleanField(default=False)
    dark_mode = models.BooleanField(default=True)
    
    # Django required fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['matric_number']),
            models.Index(fields=['staff_id']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    def get_full_name(self):
        return self.full_name
    
    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email


class Course(models.Model):
    """Courses offered in departments"""
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    code = models.CharField(max_length=20)  # e.g., "CS402"
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    lecturer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='teaching_courses')
    credit_units = models.IntegerField(default=3)
    semester = models.CharField(max_length=20, blank=True, null=True)  # e.g., "First", "Second"
    level = models.CharField(max_length=20, blank=True, null=True)  # e.g., "100", "200"
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        unique_together = [['department', 'code']]
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['lecturer']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.title}"


class AttendanceSession(models.Model):
    """Attendance sessions (lectures/classes)"""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    session_code = models.CharField(max_length=50, unique=True)  # QR code identifier
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Location for geo-fencing
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    location_radius = models.IntegerField(default=100, help_text="Radius in meters for geo-fencing")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_sessions'
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['session_code']),
            models.Index(fields=['start_time']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.course.code} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"


class Attendance(models.Model):
    """Student attendance records"""
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    checked_in_at = models.DateTimeField(auto_now_add=True)
    
    # Location verification
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    location_verified = models.BooleanField(default=False)
    
    # Status
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    
    class Meta:
        db_table = 'attendances'
        unique_together = [['session', 'student']]
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['student']),
            models.Index(fields=['checked_in_at']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.session}"


class EmailVerificationOTP(models.Model):
    """OTP for email verification"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verification_otps'
        indexes = [
            models.Index(fields=['user', 'otp']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp}"
    
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.is_used and timezone.now() < self.expires_at
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    @classmethod
    def create_otp(cls, user):
        """Create a new OTP for user"""
        otp = cls.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=15)  # 15 minutes validity
        return cls.objects.create(
            user=user,
            otp=otp,
            expires_at=expires_at
        )
