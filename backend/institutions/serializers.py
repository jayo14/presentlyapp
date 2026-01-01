import secrets
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Institution, College, Department, Course, AttendanceSession, 
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
    
    class Meta:
        model = Institution
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


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
    
    class Meta:
        model = Venue
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_boundary_coordinates(self, value):
        """Validate that boundary coordinates are properly formatted"""
        if value is not None:
            if not isinstance(value, list):
                raise serializers.ValidationError("Boundary coordinates must be an array")
            
            if len(value) < 3:
                raise serializers.ValidationError("Boundary must have at least 3 coordinate pairs")
            
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
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'avatar_url', 'onboarding_complete',
            'institution', 'institution_name', 'college', 'college_name',
            'phone_number', 'matric_number', 'department', 'level',
            'staff_id', 'courses', 'assigned_lecturer',
            'notifications_enabled', 'location_enabled', 'dark_mode',
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
            'avatar_url', 'notifications_enabled', 'location_enabled', 'dark_mode'
        ]
    
    def update(self, instance, validated_data):
        # Update all provided fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        # Mark onboarding as complete
        instance.onboarding_complete = True
        instance.save()
        return instance


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    lecturer_name = serializers.CharField(source='lecturer.full_name', read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue"""
    
    class Meta:
        model = Venue
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


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
        return obj.is_within_time()
    
    def create(self, validated_data):
        # Session code and QR URL will be auto-generated in model's save method
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_matric = serializers.CharField(source='student.matric_number', read_only=True)
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
