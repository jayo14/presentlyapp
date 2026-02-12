import secrets
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Institution, College, Department, Course, CourseEnrollment, AttendanceSession, 
    Attendance, UserRole, Venue, Timetable
)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'password2']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=UserRole.STUDENT,  # Default role
            onboarding_complete=False
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              username=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        attrs['user'] = user
        return attrs


class InstitutionSerializer(serializers.ModelSerializer):
    """Serializer for Institution model"""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = [
            'id', 'full_name', 'short_name', 'abbreviation', 'description', 'website_url',
            'contact_email', 'contact_phone', 'country', 'state_province', 'city',
            'address', 'latitude', 'longitude', 'postal_code', 'established_year',
            'institution_type', 'accreditation_status', 'logo_url', 'cover_image_url',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_latitude(self, obj):
        if obj.location:
            return obj.location.y
        return None

    def get_longitude(self, obj):
        if obj.location:
            return obj.location.x
        return None


class CollegeSerializer(serializers.ModelSerializer):
    """Serializer for College model"""
    institution_name = serializers.CharField(source='institution.full_name', read_only=True)
    
    class Meta:
        model = College
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    college_name = serializers.CharField(source='college.name', read_only=True)
    institution_name = serializers.CharField(source='institution.full_name', read_only=True)
    
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue model"""
    institution_name = serializers.CharField(source='institution.full_name', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    boundary_coordinates = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = [
            'id', 'institution', 'institution_name', 'college', 'name', 'code', 'description',
            'building', 'building_name', 'floor_number', 'room_number', 'capacity',
            'venue_type', 'has_projector', 'has_computers', 'has_whiteboard', 'has_microphone',
            'latitude', 'longitude', 'elevation', 'boundary_coordinates',
            'gps_radius', 'verification_radius', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_latitude(self, obj):
        if obj.location:
            return obj.location.y
        return None

    def get_longitude(self, obj):
        if obj.location:
            return obj.location.x
        return None

    def get_boundary_coordinates(self, obj):
        if obj.boundary:
            return obj.boundary.coords
        return None
    
    def validate_boundary_coordinates(self, value):
        """Validate that boundary coordinates are properly formatted if provided"""
        if value is not None and len(value) > 0:
            if not isinstance(value, list):
                raise serializers.ValidationError("Boundary coordinates must be an array")
            
            if len(value) < 3:
                raise serializers.ValidationError("Boundary must have at least 3 coordinate pairs if provided")
            
            for coord in value:
                if not isinstance(coord, list) or len(coord) != 2:
                    raise serializers.ValidationError(
                        "Each coordinate must be an array of [latitude, longitude]"
                    )
                
                lat, lng = coord
                if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
                    raise serializers.ValidationError("Coordinates must be numeric")
                
                if not (-90 <= lat <= 90):
                    raise serializers.ValidationError("Latitude must be between -90 and 90")
                
                if not (-180 <= lng <= 180):
                    raise serializers.ValidationError("Longitude must be between -180 and 180")
        
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    institution_name = serializers.CharField(source='institution.full_name', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    name = serializers.CharField(source='full_name', read_only=True)  # Add 'name' field for frontend compatibility
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'name', 'role', 'avatar_url', 'onboarding_complete',
            'institution', 'institution_name', 'college', 'college_name',
            'phone_number', 'matric_number', 'department', 'level',
            'staff_id', 'courses', 'assigned_lecturer',
            'notifications_enabled', 'location_enabled', 'dark_mode', 'timezone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']


class OnboardingSerializer(serializers.ModelSerializer):
    """Serializer for user onboarding"""
    
    class Meta:
        model = User
        fields = [
            'role', 'phone_number', 'matric_number', 'department', 'level',
            'staff_id', 'courses', 'assigned_lecturer', 'institution', 'college',
            'avatar_url', 'notifications_enabled', 'location_enabled', 'dark_mode', 'timezone'
        ]
    
    def update(self, instance, validated_data):
        from .models import CourseEnrollment, Course, UserRole
        import logging
        logger = logging.getLogger(__name__)
        
        # Extract courses before updating
        courses_data = validated_data.pop('courses', None)
        
        # Update all provided fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        # Mark onboarding as complete
        instance.onboarding_complete = True
        instance.save()
        
        # Handle course enrollment for students
        if instance.role == UserRole.STUDENT and courses_data:
            # Parse course IDs from comma-separated string
            course_ids = []
            invalid_ids = []
            
            for cid in courses_data.split(','):
                cid = cid.strip()
                if not cid:
                    continue
                if cid.isdigit():
                    course_ids.append(int(cid))
                else:
                    invalid_ids.append(cid)
            
            # Log invalid course IDs
            if invalid_ids:
                logger.warning(f"Invalid course IDs during onboarding for user {instance.email}: {', '.join(invalid_ids)}")
            
            # Enroll student in selected courses
            enrolled_count = 0
            for course_id in course_ids:
                try:
                    course = Course.objects.get(id=course_id, is_active=True)
                    # Create enrollment if it doesn't exist
                    enrollment, created = CourseEnrollment.objects.get_or_create(
                        student=instance,
                        course=course,
                        defaults={'is_active': True}
                    )
                    if created:
                        enrolled_count += 1
                except Course.DoesNotExist:
                    logger.warning(f"Course with ID {course_id} not found for user {instance.email}")
            
            logger.info(f"Enrolled user {instance.email} in {enrolled_count} courses during onboarding")
        
        return instance


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), many=True)
    department_name = serializers.SerializerMethodField()
    college_name = serializers.SerializerMethodField()
    institution_name = serializers.SerializerMethodField()
    lecturer_name = serializers.CharField(source='lecturer.full_name', read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()
    applicable_levels = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_department_name(self, obj):
        """Return a comma-separated list of department names"""
        return ", ".join([d.name for d in obj.department.all()])

    def get_college_name(self, obj):
        """Return first college name found"""
        first_dept = obj.department.first()
        return first_dept.college.name if first_dept and first_dept.college else None

    def get_institution_name(self, obj):
        """Return first institution name found"""
        first_dept = obj.department.first()
        return first_dept.institution.full_name if first_dept and first_dept.institution else None
    
    def get_enrolled_students_count(self, obj):
        """Get the count of enrolled students"""
        from .models import CourseEnrollment
        return CourseEnrollment.objects.filter(course=obj, is_active=True).count()
    
    def get_applicable_levels(self, obj):
        """Get list of applicable levels for this course based on duration"""
        return obj.get_applicable_levels()


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Course Enrollment"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_matric = serializers.CharField(source='student.matric_number', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = '__all__'
        read_only_fields = ['enrolled_at', 'updated_at']


class TimetableSerializer(serializers.ModelSerializer):
    """Serializer for Timetable (DEFERRED FEATURE - Read-only)"""
    course_details = CourseSerializer(source='course', read_only=True)
    venue_details = VenueSerializer(source='venue', read_only=True)
    
    class Meta:
        model = Timetable
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_active']  # is_active should remain False


class AttendanceSessionSerializer(serializers.ModelSerializer):
    """Serializer for Attendance Session model"""
    course_name = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    venue_code = serializers.CharField(source='venue.code', read_only=True)
    attendee_count = serializers.SerializerMethodField()
    location_data = serializers.SerializerMethodField()
    venue_details = VenueSerializer(source='venue', read_only=True)
    attendee_count = serializers.SerializerMethodField()
    qr_code_data = serializers.SerializerMethodField()
    qr_code_url = serializers.URLField(read_only=True)
    is_within_time = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSession
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'session_code', 'qr_code_url']
    
    def get_attendee_count(self, obj):
        return obj.attendances.count()
    
    def get_location_data(self, obj):
        """Get complete location data including venue boundary"""
        return obj.get_location_coords()
    def get_qr_code_data(self, obj):
        """Generate QR code as base64 image"""
        import qrcode
        import io
        import base64
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(obj.qr_code_url or obj.session_code)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def get_is_within_time(self, obj):
        """Check if session is currently active"""
        return obj.is_within_time_range()
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        # Hide sensitive session data from students
        if request and hasattr(request.user, 'role') and request.user.role == 'STUDENT':
            ret.pop('session_code', None)
            ret.pop('qr_code_url', None)
            ret.pop('qr_code_data', None)
        return ret
    
    def create(self, validated_data):
        # Session code and QR URL will be auto-generated in model's save method
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_matric = serializers.CharField(source='student.matric_number', read_only=True)
    student_avatar = serializers.URLField(source='student.avatar_url', read_only=True)
    student_department = serializers.CharField(source='student.department', read_only=True)
    course_code = serializers.CharField(source='session.course.code', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['checked_in_at']
    
    def validate(self, attrs):
        # Check if student has already checked in for this session
        session = attrs.get('session')
        student = attrs.get('student')
        
        if Attendance.objects.filter(session=session, student=student).exists():
            raise serializers.ValidationError("Student has already checked in for this session.")
        
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True, required=True, label="Confirm New Password")
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user