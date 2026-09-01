# Removed GIS dependency - using regular lat/long fields instead
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone as django_timezone
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
    website_url = models.URLField(max_length=500, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Location
    country = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()
    # Location fields (replacing GIS PointField)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, help_text="Latitude coordinate")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, help_text="Longitude coordinate")
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Institution details
    established_year = models.IntegerField(blank=True, null=True)
    institution_type = models.CharField(max_length=20, choices=INSTITUTION_TYPES, blank=True, null=True)
    accreditation_status = models.CharField(max_length=20, choices=ACCREDITATION_STATUS, blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    
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
    website_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Location within institution
    building_block = models.CharField(max_length=100, blank=True, null=True)
    office_location = models.CharField(max_length=200, blank=True, null=True)
    
    # Metadata
    established_year = models.IntegerField(blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
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
    website_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Academic details
    established_year = models.IntegerField(blank=True, null=True)
    accreditation_status = models.CharField(max_length=20, choices=ACCREDITATION_STATUS, blank=True, null=True)
    
    # Metadata
    logo_url = models.URLField(max_length=500, blank=True, null=True)
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
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    signup_method = models.CharField(
        max_length=20,
        choices=[('email', 'Email'), ('google', 'Google')],
        default='email'
    )
    profile_image = models.URLField(max_length=500, blank=True, null=True, help_text="User's profile picture URL")
    cover_image = models.URLField(max_length=500, blank=True, null=True, help_text="User's cover/banner image URL")
    onboarding_complete = models.BooleanField(default=False)
    invited_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='invited_users')
    
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
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    level = models.CharField(
        max_length=3, 
        blank=True, 
        null=True,
        choices=[
            ('100', '100 Level'),
            ('200', '200 Level'),
            ('300', '300 Level'),
            ('400', '400 Level'),
            ('500', '500 Level'),
        ],
        help_text="Student's current academic level"
    )
    
    # Lecturer-specific fields
    staff_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    courses = models.TextField(blank=True, null=True)  # Comma-separated for now
    
    # Class Rep-specific fields
    # DEPRECATED: Use CourseMembership (role=CLASS_REP) instead. Kept for backward compatibility.
    assigned_lecturer = models.CharField(max_length=200, blank=True, null=True)
    
    # Preferences
    notifications_enabled = models.BooleanField(default=True)
    location_enabled = models.BooleanField(default=False)
    dark_mode = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default='UTC', help_text="User's preferred timezone")
    
    # Security & Verification
    signature_image = models.ImageField(upload_to='signatures/', null=True, blank=True, help_text="Student's digital signature")
    
    # Account Restriction
    is_restricted = models.BooleanField(default=False, help_text="Designates whether this user account is access restricted.")
    restriction_reason = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('SUSPICIOUS_ACTIVITY', 'Suspicious activity or anomalous behavior detected'),
            ('SECURITY_FLAG', 'Security verification flag / Identity discrepancy'),
            ('POTENTIAL_FRAUD', 'Potential fraudulent activity or policy violation'),
            ('ACADEMIC_MISCONDUCT', 'Academic integrity investigation or policy breach'),
            ('ADMINISTRATIVE_HOLD', 'Administrative hold / Pending review by institution'),
            ('OTHER', 'Other administrative reason'),
        ],
        help_text="Selected reason for user account restriction"
    )
    restriction_note = models.TextField(blank=True, null=True, help_text="Internal or custom note detailing the restriction reason")
    restricted_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when user was restricted")

    
    # Django required fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=django_timezone.now)
    
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
            models.Index(fields=['onboarding_complete']),
        ]
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    def get_full_name(self):
        return self.full_name
    
    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email
    
    @property
    def username(self):
        """Property to make the User model compatible with Django admin templates that expect a username field"""
        return self.email


class Course(models.Model):
    """Courses offered in departments"""
    
    SEMESTER_CHOICES = [
        ('FIRST', 'First Semester'),
        ('SECOND', 'Second Semester'),
    ]
    
    LEVEL_CHOICES = [
        ('100', '100 Level'),
        ('200', '200 Level'),
        ('300', '300 Level'),
        ('400', '400 Level'),
        ('500', '500 Level'),
    ]
    
    DURATION_CHOICES = [
        (1, '1 Year'),
        (2, '2 Years'),
        (3, '3 Years'),
        (4, '4 Years'),
        (5, '5 Years'),
        (6, '6 Years'),
    ]
    
    department = models.ManyToManyField(Department, related_name='courses')
    code = models.CharField(max_length=20)  # e.g., "CS402"
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    lecturer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='teaching_courses')
    credit_units = models.IntegerField(default=3)
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES, blank=True, null=True)
    level = models.CharField(max_length=3, choices=LEVEL_CHOICES, blank=True, null=True)
    
    # Course program duration (helps determine which levels should have this course)
    duration_years = models.IntegerField(
        choices=DURATION_CHOICES,
        default=4,
        help_text="Program duration in years. Determines maximum level for this course."
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        # unique_together = [['department', 'code']] # Cannot use M2M in unique_together
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['lecturer']),
            models.Index(fields=['is_active']),
            models.Index(fields=['level']),
            models.Index(fields=['semester']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.title}"
    
    @property
    def institution(self):
        """Get the institution(s) this course belongs to (returns first department's institution)"""
        first_dept = self.department.first()
        return first_dept.institution if first_dept else None
    
    @property
    def college(self):
        """Get the college(s) this course belongs to (returns first department's college)"""
        first_dept = self.department.first()
        return first_dept.college if first_dept else None
    
    def get_enrolled_students_count(self):
        """Get the count of enrolled students"""
        return self.enrollments.filter(is_active=True).count()
    
    def get_applicable_levels(self):
        """Get list of levels applicable for this course based on duration"""
        level_mapping = {
            1: ['100'],
            2: ['100', '200'],
            3: ['100', '200', '300'],
            4: ['100', '200', '300', '400'],
            5: ['100', '200', '300', '400', '500'],
            6: ['100', '200', '300', '400', '500'],  # 6-year programs also go up to 500 level
        }
        return level_mapping.get(self.duration_years, ['100', '200', '300', '400'])
    
    def is_level_applicable(self, level):
        """Check if a given level is applicable for this course"""
        return level in self.get_applicable_levels()

    def get_lecturers(self):
        """Return active lecturers (LECTURER or CO_LECTURER) via CourseMembership.
        Falls back to course.lecturer if no memberships exist (rollout safety)."""
        memberships = self.memberships.filter(
            role__in=[CourseMembership.Role.LECTURER, CourseMembership.Role.CO_LECTURER],
            is_active=True,
        ).select_related('user')
        if memberships.exists():
            return [m.user for m in memberships]
        if self.lecturer:
            return [self.lecturer]
        return []

    def is_user_lecturer(self, user):
        """Check if user is an active lecturer/co-lecturer on this course."""
        if not user or not user.is_authenticated:
            return False
        if self.memberships.filter(
            user=user,
            role__in=[CourseMembership.Role.LECTURER, CourseMembership.Role.CO_LECTURER],
            is_active=True,
        ).exists():
            return True
        return self.lecturer_id == user.id


class CourseMembership(models.Model):
    """Roles scoped to a course (lecturer, co-lecturer, class rep)."""

    class Role(models.TextChoices):
        LECTURER = 'LECTURER', 'Lecturer'
        CO_LECTURER = 'CO_LECTURER', 'Co-Lecturer'
        CLASS_REP = 'CLASS_REP', 'Class Representative'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_memberships')
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_memberships')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_memberships'
        unique_together = [['course', 'user', 'role']]
        indexes = [
            models.Index(fields=['course', 'role']),
            models.Index(fields=['user', 'role']),
        ]

    def __str__(self):
        return f"{self.user.full_name} - {self.get_role_display()} @ {self.course.code}"


class CourseEnrollment(models.Model):
    """Student enrollment in courses"""
    
    ENROLLMENT_STATUS = [
        ('ENROLLED', 'Enrolled'),
        ('DROPPED', 'Dropped'),
        ('COMPLETED', 'Completed'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='ENROLLED')
    is_active = models.BooleanField(default=True)
    
    # Grade tracking (optional)
    grade = models.CharField(max_length=5, blank=True, null=True)  # e.g., "A", "B+", "C"
    grade_point = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)  # e.g., 4.00, 3.50
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'course_enrollments'
        unique_together = [['student', 'course']]
        indexes = [
            models.Index(fields=['student', 'is_active']),
            models.Index(fields=['course', 'is_active']),
            models.Index(fields=['enrolled_at']),
        ]
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.code}"


class Venue(models.Model):
    """Physical venues/buildings where classes are held"""
    
    # Basic information
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='venues', blank=True, null=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='venues', blank=True, null=True)
    name = models.CharField(max_length=200)  # e.g., "Main Lecture Hall", "Chemistry Lab 1"
    code = models.CharField(max_length=50, blank=True, null=True)  # e.g., "MLH", "CHEM-LAB-1"
    description = models.TextField(blank=True, null=True)
    
    # Location details
    building = models.CharField(max_length=100, blank=True, null=True)  # Alias for building_name
    building_name = models.CharField(max_length=200, blank=True, null=True)
    floor_number = models.CharField(max_length=20, blank=True, null=True)
    room_number = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.IntegerField(default=0, help_text="Maximum capacity")
    
    # Venue type
    VENUE_TYPES = [
        ('CLASSROOM', 'Classroom'),
        ('LECTURE_HALL', 'Lecture Hall'),
        ('LAB', 'Laboratory'),
        ('AUDITORIUM', 'Auditorium'),
        ('ONLINE', 'Online/Virtual'),
    ]
    venue_type = models.CharField(max_length=20, choices=VENUE_TYPES, default='CLASSROOM')
    
    # Facilities
    has_projector = models.BooleanField(default=False)
    has_computers = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=False)
    has_microphone = models.BooleanField(default=False)
    
    # Geolocation with elevation (replacing GIS PointField)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, help_text="Latitude coordinate")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, help_text="Longitude coordinate")
    elevation = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        help_text="Elevation in meters above sea level"
    )
    
    # Boundary polygon as JSON (replacing GIS PolygonField)
    boundary = models.JSONField(
        blank=True, 
        null=True,
        help_text="Polygon boundary of the venue as GeoJSON coordinates array"
    )
    
    # Location verification settings
    gps_radius = models.IntegerField(default=100, help_text="GPS verification radius in meters")
    verification_radius = models.IntegerField(
        default=100, 
        help_text="Radius in meters for location verification (if no boundary is set)"
    )

    # Visual display settings (used by the admin map UI)
    venue_color = models.CharField(
        max_length=20,
        default='#6366f1',
        help_text="Hex colour used when rendering this venue on the map"
    )
    venue_opacity = models.FloatField(
        default=0.15,
        help_text="Fill opacity for the venue polygon (0.0 – 1.0)"
    )
    border_width = models.IntegerField(
        default=2,
        help_text="Stroke width (px) for the venue polygon outline"
    )

    # Metadata
    spatial_feature = models.ForeignKey(
        'SpatialFeature',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='linked_venues',
        help_text="Canonical spatial feature link"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'venues'
        indexes = [
            models.Index(fields=['institution', 'is_active']),
            models.Index(fields=['venue_type']),
        ]
        ordering = ['name']
    
    def __str__(self):
        location = f"{self.building or self.building_name} - {self.room_number}" if (self.building or self.building_name) and self.room_number else self.name
        return location

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            from .spatial_utils import convert_lat_lng_ring_to_geojson_ring
            geojson_geom = None
            if self.boundary and isinstance(self.boundary, list) and len(self.boundary) >= 3:
                ring = convert_lat_lng_ring_to_geojson_ring(self.boundary)
                if len(ring) >= 3:
                    geojson_geom = {'type': 'Polygon', 'coordinates': [ring]}
            
            if not geojson_geom and self.latitude is not None and self.longitude is not None:
                geojson_geom = {'type': 'Point', 'coordinates': [float(self.longitude), float(self.latitude)]}

            if geojson_geom:
                sf = self.spatial_feature
                if not sf:
                    sf = SpatialFeature(name=self.name, category='ROOM', source='VENUE_SYNC')

                sf.name = self.name
                sf.code = self.code
                sf.description = self.description
                sf.institution = self.institution
                sf.college = self.college
                sf.geojson_geometry = geojson_geom
                sf.elevation_m = self.elevation
                sf.verification_radius_m = self.verification_radius or self.gps_radius or 50
                sf.venue_color = self.venue_color or '#6366f1'
                sf.venue_opacity = self.venue_opacity if self.venue_opacity is not None else 0.15
                sf.border_width = self.border_width or 2
                sf.is_active = self.is_active
                sf.save()

                if not self.spatial_feature_id:
                    self.spatial_feature = sf
                    super().save(update_fields=['spatial_feature'])
        except Exception:
            pass



class AttendanceSession(models.Model):
    """Attendance sessions (lectures/classes)"""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    session_code = models.CharField(max_length=50, unique=True)  # QR code identifier
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Location for geo-fencing (can override venue location)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    accuracy = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="GPS accuracy in meters")
    location_radius = models.IntegerField(default=100, help_text="Radius in meters for geo-fencing")
    
    # Session metadata
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Code expiry
    expiry_time = models.DateTimeField(blank=True, null=True, help_text="Time when the session code expires")
    
    # QR code data (will store URL for external access)
    qr_code_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL that the QR code points to")
    
    # Invalidation Rule
    is_valid = models.BooleanField(default=True)
    invalidation_reason = models.TextField(blank=True, null=True)

    # GPS / submission validation settings (Phase 1-3 mobile app)
    lecturer_coordinates = models.JSONField(
        blank=True, null=True,
        help_text="Lecturer GPS position: {lat, lng}"
    )
    allowed_radius_meters = models.IntegerField(
        default=50,
        help_text="Maximum allowed distance from lecturer in meters"
    )
    required_presence_window_ms = models.IntegerField(
        default=20000,
        help_text="Minimum presence window the student must hold in milliseconds"
    )
    min_samples = models.IntegerField(
        default=3,
        help_text="Minimum number of GPS samples required"
    )
    strict_mode = models.BooleanField(
        default=False,
        help_text="When True, any flag causes automatic REJECTED verdict"
    )
    expires_at = models.DateTimeField(
        blank=True, null=True,
        help_text="Hard expiry for submission acceptance (separate from expiry_time)"
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_sessions'
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['venue']),
            models.Index(fields=['session_code']),
            models.Index(fields=['start_time']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.course.code} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    def get_location_coords(self):
        """Get location coordinates, preferring venue over legacy fields"""
        if self.venue:
            coords = {
                'latitude': float(self.venue.latitude) if self.venue.latitude is not None else None,
                'longitude': float(self.venue.longitude) if self.venue.longitude is not None else None,
                'elevation': float(self.venue.elevation) if self.venue.elevation is not None else None,
                'boundary': self.venue.boundary if self.venue.boundary else None,
                'radius': self.venue.verification_radius
            }
            return coords
        return {
            'latitude': float(self.latitude) if self.latitude is not None else None,
            'longitude': float(self.longitude) if self.longitude is not None else None,
            'elevation': None,
            'boundary': None,
            'radius': self.location_radius
        }
    def save(self, *args, **kwargs):
        if not self.session_code:
            # Generate unique session code
            import secrets
            import string
            self.session_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        
        # Set expiry time if not set (default 30 mins after start)
        if not self.expiry_time and self.start_time:
            expiry = self.start_time + django_timezone.timedelta(minutes=30)
            if self.end_time and expiry > self.end_time:
                expiry = self.end_time
            self.expiry_time = expiry
        
        # Generate QR code URL if not set
        if not self.qr_code_url:
            from django.conf import settings
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            self.qr_code_url = f"{frontend_url}/check-in/{self.session_code}"
        
        # Use venue location if not specified
        if self.venue and not self.latitude and not self.longitude:
            if self.venue.latitude is not None and self.venue.longitude is not None:
                self.latitude = self.venue.latitude
                self.longitude = self.venue.longitude
            if not self.location_radius and self.venue.gps_radius:
                self.location_radius = self.venue.gps_radius
        
        super().save(*args, **kwargs)
    
    def is_within_time_range(self):
        """Check if current time is within session time"""
        now = django_timezone.now()
        return self.start_time <= now <= self.end_time
    
    def verify_location(self, student_lat, student_lng):
        """Verify if student is within the geofence radius"""
        if not self.latitude or not self.longitude:
            # If no location set, skip verification
            return True
        
        from haversine import haversine, Unit
        session_location = (float(self.latitude), float(self.longitude))
        student_location = (float(student_lat), float(student_lng))
        
        # Calculate distance in meters
        distance = haversine(session_location, student_location, unit=Unit.METERS)
        
        return distance <= self.location_radius


class Attendance(models.Model):
    """Student attendance records"""
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    checked_in_at = models.DateTimeField(auto_now_add=True)
    
    # Location verification with elevation support
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    accuracy = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="GPS accuracy in meters")
    elevation = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        help_text="Student's elevation in meters when checking in"
    )
    location_verified = models.BooleanField(default=False)
    
    # Distance from venue center (for analytics)
    distance_from_venue = models.DecimalField(
        max_digits=20, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Distance in meters from venue center"
    )
    trust_score = models.IntegerField(default=0, help_text="Final confidence score (0-100)")
    verification_metadata = models.JSONField(null=True, blank=True, help_text="Detailed audit flags and signals")
    
    # Status
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused'),
        ('FLAGGED', 'Flagged'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    
    class Meta:
        db_table = 'attendances'
        unique_together = [['session', 'student']]
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['student']),
            models.Index(fields=['checked_in_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.session}"


class ManualAttendanceRecord(models.Model):
    """Manual attendance entries keyed primarily by matric number."""

    SOURCE_MANUAL = 'MANUAL'
    SOURCE_CHOICES = [
        (SOURCE_MANUAL, 'Manual'),
    ]

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='manual_attendance_records'
    )
    matric_number = models.CharField(max_length=50)
    full_name = models.CharField(max_length=255)
    student = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='manual_attendance_records',
        null=True,
        blank=True
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='recorded_manual_attendance_records',
        null=True,
        blank=True
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default=SOURCE_MANUAL)
    linked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'manual_attendance_records'
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'matric_number'],
                name='unique_manual_attendance_per_session_matric'
            )
        ]
        indexes = [
            models.Index(fields=['matric_number']),
            models.Index(fields=['student']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.matric_number:
            self.matric_number = self.matric_number.strip().upper()
        if self.full_name:
            self.full_name = self.full_name.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.matric_number} - session {self.session_id}"


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
        return not self.is_used and django_timezone.now() < self.expires_at
    
    @staticmethod
    def generate_otp():
        """Generate a cryptographically secure 6-digit OTP"""
        import secrets
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    @classmethod
    def create_otp(cls, user):
        """Create a new OTP for user"""
        otp = cls.generate_otp()
        expires_at = django_timezone.now() + django_timezone.timedelta(minutes=15)  # 15 minutes validity
        return cls.objects.create(
            user=user,
            otp=otp,
            expires_at=expires_at
        )


class Timetable(models.Model):
    """Timetable entries (DEFERRED - Currently disabled)"""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='timetable_entries')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_entries')
    
    # Day and time
    DAY_CHOICES = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    ]
    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # Context
    semester = models.CharField(max_length=20, choices=Course.SEMESTER_CHOICES, default='FIRST')
    academic_year = models.CharField(max_length=20, default="2025/2026", blank=True, help_text="e.g. 2023/2024")
    
    # Recurrence
    is_recurring = models.BooleanField(default=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Ownership & Status
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_timetables', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'timetables'
        indexes = [
            models.Index(fields=['course', 'day_of_week']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.course.code} - {self.get_day_of_week_display()} {self.start_time}"

class AuditLog(models.Model):
    """Audit logs for tracking system activities"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)  # e.g., "COURSE_ENROLLMENT", "COURSE_DROP"
    resource_type = models.CharField(max_length=100)  # e.g., "COURSE", "ENROLLMENT"
    resource_id = models.CharField(max_length=255, blank=True, null=True)
    details = models.JSONField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email if self.user else 'System'} - {self.action} - {self.timestamp}"


class RBACPermission(models.Model):
    """Atomic permission with a scalable resource.action codename."""
    codename = models.CharField(max_length=120, unique=True)  # e.g. venues.create
    name = models.CharField(max_length=200)
    group = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    is_dangerous = models.BooleanField(default=False)
    enabled_by_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rbac_permissions'
        indexes = [
            models.Index(fields=['codename']),
            models.Index(fields=['group']),
        ]
        ordering = ['group', 'codename']

    def __str__(self):
        return self.codename


class StaffRole(models.Model):
    """Role template that bundles default permissions for staff members."""
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_roles'
        ordering = ['name']

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """Through model for role -> permission mappings."""
    role = models.ForeignKey(StaffRole, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(RBACPermission, on_delete=models.CASCADE, related_name='role_permissions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'role_permissions'
        unique_together = [['role', 'permission']]
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['permission']),
        ]


class StaffProfile(models.Model):
    """Staff-specific status and role assignment for users."""
    STATUS_PENDING = 'PENDING'
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_SUSPENDED = 'SUSPENDED'
    STATUS_REVOKED = 'REVOKED'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_SUSPENDED, 'Suspended'),
        (STATUS_REVOKED, 'Revoked'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    role = models.ForeignKey(StaffRole, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_profiles')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_invited_profiles')
    invited_at = models.DateTimeField(null=True, blank=True)
    invitation_accepted_at = models.DateTimeField(null=True, blank=True)
    last_active_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_profiles'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.user.email} ({self.status})"


class UserPermission(models.Model):
    """Direct per-user permission override. allowed=False explicitly denies."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rbac_user_permissions')
    permission = models.ForeignKey(RBACPermission, on_delete=models.CASCADE, related_name='user_overrides')
    allowed = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='permission_changes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_permissions'
        unique_together = [['user', 'permission']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['permission']),
            models.Index(fields=['allowed']),
        ]


class StaffInvitation(models.Model):
    """Tokenized invitation flow for staff onboarding."""
    STATUS_PENDING = 'PENDING'
    STATUS_ACCEPTED = 'ACCEPTED'
    STATUS_REVOKED = 'REVOKED'
    STATUS_EXPIRED = 'EXPIRED'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_REVOKED, 'Revoked'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    email = models.EmailField()
    full_name = models.CharField(max_length=200)
    role = models.ForeignKey(StaffRole, on_delete=models.SET_NULL, null=True, blank=True, related_name='invitations')
    custom_permissions = models.JSONField(blank=True, null=True)
    token_hash = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_invitations_sent')
    invited_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_invitations_received')
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_invitations'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.status})"


class SpatialCategory(models.TextChoices):
    CAMPUS = 'CAMPUS', 'Campus Boundary'
    COLLEGE_ZONE = 'COLLEGE_ZONE', 'College / Faculty Zone'
    BUILDING = 'BUILDING', 'Building Structure'
    ROOM = 'ROOM', 'Room / Venue / Hall'
    ROAD = 'ROAD', 'Road / Driveway'
    PEDESTRIAN_PATH = 'PEDESTRIAN_PATH', 'Pedestrian Walkway / Path'
    ENTRANCE = 'ENTRANCE', 'Entrance / Gate'
    LANDMARK_POI = 'LANDMARK_POI', 'Landmark / Point of Interest'
    PARKING = 'PARKING', 'Parking Area'
    FACILITY = 'FACILITY', 'Utility / Facility'


class SpatialGeometryType(models.TextChoices):
    POINT = 'Point', 'Point'
    POLYGON = 'Polygon', 'Polygon'
    MULTI_POLYGON = 'MultiPolygon', 'MultiPolygon'
    LINE_STRING = 'LineString', 'LineString'


class SpatialVerificationMethod(models.TextChoices):
    PHYSICAL_GEOMETRY = 'PHYSICAL_GEOMETRY', 'Use Physical Geometry Boundary'
    RADIUS = 'RADIUS', 'Use Center Point Radius'
    CUSTOM_POLYGON = 'CUSTOM_POLYGON', 'Use Custom Geofence Polygon'


class SpatialVerificationStatus(models.TextChoices):
    UNVERIFIED = 'UNVERIFIED', 'Unverified Draft'
    VERIFIED = 'VERIFIED', 'Verified & Ground-Truthed'
    FLAGGED = 'FLAGGED', 'Flagged for Review'


class AccessRestriction(models.TextChoices):
    PUBLIC = 'PUBLIC', 'Public Access'
    STUDENTS_ONLY = 'STUDENTS_ONLY', 'Students Only'
    STAFF_ONLY = 'STAFF_ONLY', 'Staff Only'
    RESTRICTED = 'RESTRICTED', 'Restricted Access'


class EntranceType(models.TextChoices):
    MAIN = 'MAIN', 'Main Entrance'
    SIDE = 'SIDE', 'Side Entrance'
    ACCESSIBLE = 'ACCESSIBLE', 'Wheelchair Accessible Entrance'
    EMERGENCY = 'EMERGENCY', 'Emergency Exit Only'
    SERVICE = 'SERVICE', 'Service / Loading Dock'


class SpatialFeature(models.Model):
    """Canonical production-grade spatial model for all campus features."""
    
    # 1. Identity
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=30, choices=SpatialCategory.choices, db_index=True)
    subcategory = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # 2. Geometry (Canonical GeoJSON storage & Shapely derivations)
    geometry_type = models.CharField(max_length=20, choices=SpatialGeometryType.choices, default=SpatialGeometryType.POLYGON)
    geojson_geometry = models.JSONField(
        help_text="Canonical GeoJSON geometry object (WGS84: [lng, lat])"
    )
    derived_centroid = models.JSONField(
        blank=True, null=True,
        help_text="Auto-computed centroid coordinate [lng, lat]"
    )
    derived_bbox = models.JSONField(
        blank=True, null=True,
        help_text="Auto-computed bounding box [min_lng, min_lat, max_lng, max_lat]"
    )
    derived_area_sqm = models.FloatField(blank=True, null=True)
    derived_length_m = models.FloatField(blank=True, null=True)
    elevation_m = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)

    # 3. Location (Denormalized center lat/long for fast querying & backward compatibility)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, db_index=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, db_index=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state_province = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='Nigeria')

    # 4. Hierarchical Spatial Relationships
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, null=True, blank=True, related_name='spatial_features'
    )
    college = models.ForeignKey(
        College, on_delete=models.SET_NULL, null=True, blank=True, related_name='spatial_features'
    )
    departments = models.ManyToManyField(Department, blank=True, related_name='spatial_features')

    # 8. Geofencing & Verification
    verification_method = models.CharField(
        max_length=30, choices=SpatialVerificationMethod.choices, default=SpatialVerificationMethod.PHYSICAL_GEOMETRY
    )
    verification_radius_m = models.IntegerField(default=50)
    custom_geofence_geometry = models.JSONField(blank=True, null=True)
    elevation_tolerance_m = models.FloatField(default=10.0)

    # 9. Map Display & Visual Styling
    label_position = models.JSONField(
        blank=True, null=True,
        help_text="Independent label anchor coordinate [lng, lat]"
    )
    venue_color = models.CharField(max_length=20, default='#6366f1')
    venue_opacity = models.FloatField(default=0.15)
    border_width = models.IntegerField(default=2)
    stroke_dasharray = models.CharField(max_length=20, blank=True, null=True)
    icon_name = models.CharField(max_length=50, blank=True, null=True)
    min_zoom = models.FloatField(default=10.0)
    max_zoom = models.FloatField(default=22.0)
    is_visible_on_map = models.BooleanField(default=True)

    # 10. Data Provenance & Audit Metadata
    source = models.CharField(max_length=50, default='MANUAL_DRAW')
    source_provider = models.CharField(max_length=100, blank=True, null=True)
    mapping_method = models.CharField(max_length=50, blank=True, null=True)
    confidence_score = models.FloatField(default=1.0)
    verification_status = models.CharField(
        max_length=20, choices=SpatialVerificationStatus.choices, default=SpatialVerificationStatus.UNVERIFIED
    )
    mapped_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mapped_features'
    )
    mapped_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_features'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    # 11. Status & Lifecycle
    is_active = models.BooleanField(default=True, db_index=True)
    is_operational = models.BooleanField(default=True)
    access_restriction = models.CharField(max_length=20, choices=AccessRestriction.choices, default=AccessRestriction.PUBLIC)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'spatial_features'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['institution', 'category']),
            models.Index(fields=['parent', 'category']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.name} [{self.category}]"

    def clean(self):
        super().clean()
        from .spatial_utils import validate_geojson_geometry
        if self.geojson_geometry:
            is_valid, err = validate_geojson_geometry(self.geojson_geometry)
            if not is_valid:
                from django.core.exceptions import ValidationError
                raise ValidationError({'geojson_geometry': err})

    def save(self, *args, **kwargs):
        from .spatial_utils import validate_geojson_geometry, compute_derived_spatial_properties
        if self.geojson_geometry:
            is_valid, err = validate_geojson_geometry(self.geojson_geometry)
            if not is_valid:
                raise ValueError(f"Invalid GeoJSON geometry: {err}")

            self.geometry_type = self.geojson_geometry.get('type', self.geometry_type)
            derived = compute_derived_spatial_properties(self.geojson_geometry)

            self.derived_centroid = derived['derived_centroid']
            self.derived_bbox = derived['derived_bbox']
            self.derived_area_sqm = derived['derived_area_sqm']
            self.derived_length_m = derived['derived_length_m']

            self.longitude = float(derived['derived_centroid'][0])
            self.latitude = float(derived['derived_centroid'][1])

            if not self.label_position:
                self.label_position = self.derived_centroid

        super().save(*args, **kwargs)


class BuildingProperties(models.Model):
    """Specialized structural properties for BUILDING spatial features."""
    spatial_feature = models.OneToOneField(
        SpatialFeature, on_delete=models.CASCADE, related_name='building_properties'
    )
    building_code = models.CharField(max_length=50, blank=True, null=True)
    floors_above_ground = models.IntegerField(default=1)
    floors_below_ground = models.IntegerField(default=0)
    gross_area_sqm = models.FloatField(blank=True, null=True)
    year_built = models.IntegerField(blank=True, null=True)
    hvac_type = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'building_properties'

    def __str__(self):
        return f"BuildingProperties for {self.spatial_feature.name}"


class RoomProperties(models.Model):
    """Specialized properties for ROOM spatial features."""
    spatial_feature = models.OneToOneField(
        SpatialFeature, on_delete=models.CASCADE, related_name='room_properties'
    )
    building_code = models.CharField(max_length=50, blank=True, null=True)
    floor_number = models.CharField(max_length=20, blank=True, null=True)
    room_number = models.CharField(max_length=50, blank=True, null=True)
    wing = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.IntegerField(default=0)
    room_type = models.CharField(max_length=50, default='CLASSROOM')
    has_projector = models.BooleanField(default=False)
    has_computers = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=False)
    has_microphone = models.BooleanField(default=False)
    has_air_conditioning = models.BooleanField(default=False)
    is_wheelchair_accessible = models.BooleanField(default=False)

    class Meta:
        db_table = 'room_properties'

    def __str__(self):
        return f"RoomProperties for {self.spatial_feature.name}"


class RoadProperties(models.Model):
    """Specialized navigation properties for ROAD and PEDESTRIAN_PATH features."""
    spatial_feature = models.OneToOneField(
        SpatialFeature, on_delete=models.CASCADE, related_name='road_properties'
    )
    surface_type = models.CharField(max_length=50, default='PAVED')
    lanes = models.IntegerField(default=2)
    speed_limit_kmh = models.FloatField(blank=True, null=True)
    one_way = models.BooleanField(default=False)
    is_passable = models.BooleanField(default=True)

    class Meta:
        db_table = 'road_properties'

    def __str__(self):
        return f"RoadProperties for {self.spatial_feature.name}"


class EntranceProperties(models.Model):
    """Specialized entrance metadata and link to parent Building."""
    spatial_feature = models.OneToOneField(
        SpatialFeature, on_delete=models.CASCADE, related_name='entrance_properties'
    )
    building = models.ForeignKey(
        SpatialFeature, on_delete=models.CASCADE, null=True, blank=True, related_name='building_entrances'
    )
    entrance_type = models.CharField(
        max_length=30, choices=EntranceType.choices, default=EntranceType.MAIN
    )
    is_wheelchair_accessible = models.BooleanField(default=False)
    floor_level = models.CharField(max_length=20, default='0')
    opening_hours = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'entrance_properties'

    def __str__(self):
        return f"EntranceProperties for {self.spatial_feature.name}"

