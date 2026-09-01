import secrets
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from system.feature_flags import (
    default_strict_venue_validation_enabled,
    default_venue_max_boundary_points,
    default_venue_max_payload_chars,
    get_feature_flag,
    get_feature_int,
)
from .models import (
    User, Institution, College, Department, Course, CourseMembership, CourseEnrollment, AttendanceSession, 
    Attendance, UserRole, Venue, Timetable, AuditLog,
    RBACPermission, StaffRole, RolePermission, StaffProfile, UserPermission, StaffInvitation,
    SpatialFeature, BuildingProperties, RoomProperties, RoadProperties, EntranceProperties,
    SpatialCategory, SpatialGeometryType, SpatialVerificationMethod, SpatialVerificationStatus,
    AccessRestriction, EntranceType
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
            onboarding_complete=False,
            signup_method='email'
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
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Latitude and longitude are now direct fields, no conversion needed
        return ret

    def validate(self, attrs):
        # No GIS conversion needed - lat/long are regular decimal fields
        latitude = attrs.get('latitude')
        longitude = attrs.get('longitude')
        
        if (latitude is not None and longitude is None) or (latitude is None and longitude is not None):
            raise serializers.ValidationError("Both latitude and longitude must be provided together.")
            
        return attrs


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
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    boundary_coordinates = serializers.ListField(
        child=serializers.ListField(child=serializers.FloatField()),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Venue
        fields = [
            'id', 'institution', 'institution_name', 'college', 'name', 'code', 'description',
            'building', 'building_name', 'floor_number', 'room_number', 'capacity',
            'venue_type', 'has_projector', 'has_computers', 'has_whiteboard', 'has_microphone',
            'latitude', 'longitude', 'elevation', 'boundary_coordinates', 'boundary',
            'gps_radius', 'verification_radius',
            'venue_color', 'venue_opacity', 'border_width',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'boundary']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Latitude and longitude are now direct fields
        if instance.latitude is not None and instance.longitude is not None:
            ret['latitude'] = instance.latitude
            ret['longitude'] = instance.longitude
        if instance.boundary:
            # Boundary is now stored as JSON, return it directly
            ret['boundary_coordinates'] = instance.boundary
        return ret

    def _strict_venue_limits(self):
        strict_enabled = get_feature_flag(
            'strict_venue_payload_validation',
            default=default_strict_venue_validation_enabled(),
        )
        max_points = get_feature_int(
            'venue_max_boundary_points',
            default=default_venue_max_boundary_points(),
        )
        max_payload_chars = get_feature_int(
            'venue_max_payload_chars',
            default=default_venue_max_payload_chars(),
        )
        return strict_enabled, max_points, max_payload_chars

    def validate(self, attrs):
        # No GIS conversion needed
        latitude = attrs.get('latitude')
        longitude = attrs.get('longitude')
        boundary_coords = attrs.get('boundary_coordinates')
        strict_enabled, max_points, max_payload_chars = self._strict_venue_limits()
        
        if (latitude is not None and longitude is None) or (latitude is None and longitude is not None):
            raise serializers.ValidationError({"latitude": "Both latitude and longitude must be provided together."})
            
        if boundary_coords is not None and len(boundary_coords) > 0:
            if strict_enabled and len(boundary_coords) > max_points:
                raise serializers.ValidationError(
                    {
                        'boundary_coordinates': (
                            f'Boundary has {len(boundary_coords)} points, which exceeds '
                            f'the configured limit of {max_points}.'
                        )
                    }
                )

            if strict_enabled:
                estimated_chars = len(boundary_coords) * 24
                if estimated_chars > max_payload_chars:
                    raise serializers.ValidationError(
                        {
                            'boundary_coordinates': (
                                'Boundary payload is too large for configured limits. '
                                f'Estimated size {estimated_chars} chars exceeds {max_payload_chars}.'
                            )
                        }
                    )

            if not isinstance(boundary_coords, list):
                raise serializers.ValidationError({"boundary_coordinates": "Boundary must be an array of coordinate pairs."})
            
            if len(boundary_coords) < 3:
                raise serializers.ValidationError({"boundary_coordinates": "Boundary must have at least 3 coordinate pairs."})
            
            # Ensure the polygon is closed
            if boundary_coords[0] != boundary_coords[-1]:
                boundary_coords.append(boundary_coords[0])
            
            # Store as JSON array (boundary takes priority over radius-based verification)
            attrs['boundary'] = boundary_coords

        # Remove boundary_coordinates since it is not a Venue model field
        attrs.pop('boundary_coordinates', None)
        return attrs
    
    def validate_boundary_coordinates(self, value):
        """Validate that boundary coordinates are properly formatted if provided"""
        if value is not None and len(value) > 0:
            strict_enabled, max_points, max_payload_chars = self._strict_venue_limits()

            if strict_enabled and len(value) > max_points:
                raise serializers.ValidationError(
                    f"Boundary has {len(value)} points, which exceeds the configured limit of {max_points}."
                )

            if strict_enabled:
                estimated_chars = len(value) * 24
                if estimated_chars > max_payload_chars:
                    raise serializers.ValidationError(
                        (
                            'Boundary payload is too large for configured limits. '
                            f'Estimated size {estimated_chars} chars exceeds {max_payload_chars}.'
                        )
                    )

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


class BuildingPropertiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingProperties
        fields = ['building_code', 'floors_above_ground', 'floors_below_ground', 'gross_area_sqm', 'year_built', 'hvac_type']


class RoomPropertiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomProperties
        fields = [
            'building_code', 'floor_number', 'room_number', 'wing', 'capacity',
            'room_type', 'has_projector', 'has_computers', 'has_whiteboard',
            'has_microphone', 'has_air_conditioning', 'is_wheelchair_accessible'
        ]


class RoadPropertiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadProperties
        fields = ['surface_type', 'lanes', 'speed_limit_kmh', 'one_way', 'is_passable']


class EntrancePropertiesSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)

    class Meta:
        model = EntranceProperties
        fields = ['building', 'building_name', 'entrance_type', 'is_wheelchair_accessible', 'floor_level', 'opening_hours']


class SpatialFeatureSerializer(serializers.ModelSerializer):
    """
    Canonical Serializer for Spatial Features with clean 10-section API structure.
    """
    identity = serializers.SerializerMethodField()
    geometry = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    relationships = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()
    navigation = serializers.SerializerMethodField()
    display = serializers.SerializerMethodField()
    geofence = serializers.SerializerMethodField()
    provenance = serializers.SerializerMethodField()
    lifecycle = serializers.SerializerMethodField()

    building_properties = BuildingPropertiesSerializer(required=False, allow_null=True)
    room_properties = RoomPropertiesSerializer(required=False, allow_null=True)
    road_properties = RoadPropertiesSerializer(required=False, allow_null=True)
    entrance_properties = EntrancePropertiesSerializer(required=False, allow_null=True)

    class Meta:
        model = SpatialFeature
        fields = [
            'id', 'uuid', 'name', 'code', 'slug', 'category', 'subcategory', 'description',
            'geometry_type', 'geojson_geometry', 'derived_centroid', 'derived_bbox',
            'derived_area_sqm', 'derived_length_m', 'elevation_m', 'latitude', 'longitude',
            'address', 'city', 'state_province', 'country', 'parent', 'institution', 'college',
            'departments', 'verification_method', 'verification_radius_m', 'custom_geofence_geometry',
            'elevation_tolerance_m', 'label_position', 'venue_color', 'venue_opacity', 'border_width',
            'stroke_dasharray', 'icon_name', 'min_zoom', 'max_zoom', 'is_visible_on_map',
            'source', 'source_provider', 'mapping_method', 'confidence_score', 'verification_status',
            'mapped_by', 'mapped_at', 'verified_by', 'verified_at', 'notes', 'is_active',
            'is_operational', 'access_restriction', 'created_at', 'updated_at',
            'identity', 'geometry', 'location', 'relationships', 'properties', 'navigation',
            'display', 'geofence', 'provenance', 'lifecycle',
            'building_properties', 'room_properties', 'road_properties', 'entrance_properties'
        ]
        read_only_fields = [
            'id', 'uuid', 'derived_centroid', 'derived_bbox', 'derived_area_sqm',
            'derived_length_m', 'latitude', 'longitude', 'mapped_at', 'created_at', 'updated_at'
        ]

    def get_identity(self, obj):
        return {
            'id': obj.id,
            'uuid': str(obj.uuid),
            'code': obj.code,
            'slug': obj.slug,
            'name': obj.name,
            'category': obj.category,
            'subcategory': obj.subcategory,
            'description': obj.description,
        }

    def get_geometry(self, obj):
        return {
            'type': obj.geometry_type,
            'coordinates': obj.geojson_geometry.get('coordinates', []) if obj.geojson_geometry else [],
            'derived_centroid': obj.derived_centroid,
            'derived_bbox': obj.derived_bbox,
            'derived_area_sqm': obj.derived_area_sqm,
            'derived_length_m': obj.derived_length_m,
            'elevation_m': float(obj.elevation_m) if obj.elevation_m is not None else None,
        }

    def get_location(self, obj):
        return {
            'latitude': float(obj.latitude) if obj.latitude is not None else None,
            'longitude': float(obj.longitude) if obj.longitude is not None else None,
            'address': obj.address,
            'city': obj.city,
            'state_province': obj.state_province,
            'country': obj.country,
        }

    def get_relationships(self, obj):
        return {
            'parent_id': obj.parent_id,
            'institution_id': obj.institution_id,
            'college_id': obj.college_id,
            'department_ids': list(obj.departments.values_list('id', flat=True)),
        }

    def get_properties(self, obj):
        if hasattr(obj, 'building_properties'):
            return BuildingPropertiesSerializer(obj.building_properties).data
        elif hasattr(obj, 'room_properties'):
            return RoomPropertiesSerializer(obj.room_properties).data
        elif hasattr(obj, 'road_properties'):
            return RoadPropertiesSerializer(obj.road_properties).data
        elif hasattr(obj, 'entrance_properties'):
            return EntrancePropertiesSerializer(obj.entrance_properties).data
        return {}

    def get_navigation(self, obj):
        entrances_data = []
        if hasattr(obj, 'building_entrances'):
            for ent in obj.building_entrances.all():
                entrances_data.append({
                    'id': ent.spatial_feature_id,
                    'name': ent.spatial_feature.name,
                    'entrance_type': ent.entrance_type,
                    'coordinates': ent.spatial_feature.derived_centroid,
                    'is_wheelchair_accessible': ent.is_wheelchair_accessible,
                    'floor_level': ent.floor_level,
                })
        road_data = {}
        if hasattr(obj, 'road_properties'):
            road_data = {
                'one_way': obj.road_properties.one_way,
                'speed_limit_kmh': obj.road_properties.speed_limit_kmh,
                'is_passable': obj.road_properties.is_passable,
            }
        return {
            'entrances': entrances_data,
            **road_data
        }

    def get_display(self, obj):
        return {
            'label_position': obj.label_position,
            'venue_color': obj.venue_color,
            'venue_opacity': obj.venue_opacity,
            'border_width': obj.border_width,
            'stroke_dasharray': obj.stroke_dasharray,
            'icon_name': obj.icon_name,
            'min_zoom': obj.min_zoom,
            'max_zoom': obj.max_zoom,
            'is_visible_on_map': obj.is_visible_on_map,
        }

    def get_geofence(self, obj):
        return {
            'verification_method': obj.verification_method,
            'verification_radius_m': obj.verification_radius_m,
            'custom_geofence_geometry': obj.custom_geofence_geometry,
            'elevation_tolerance_m': obj.elevation_tolerance_m,
        }

    def get_provenance(self, obj):
        return {
            'source': obj.source,
            'source_provider': obj.source_provider,
            'mapping_method': obj.mapping_method,
            'confidence_score': obj.confidence_score,
            'verification_status': obj.verification_status,
            'mapped_by': obj.mapped_by.email if obj.mapped_by else None,
            'mapped_at': obj.mapped_at,
            'verified_by': obj.verified_by.email if obj.verified_by else None,
            'verified_at': obj.verified_at,
            'notes': obj.notes,
        }

    def get_lifecycle(self, obj):
        return {
            'is_active': obj.is_active,
            'is_operational': obj.is_operational,
            'access_restriction': obj.access_restriction,
            'created_at': obj.created_at,
            'updated_at': obj.updated_at,
        }

    def validate_geojson_geometry(self, value):
        from .spatial_utils import validate_geojson_geometry
        if value:
            is_valid, err = validate_geojson_geometry(value)
            if not is_valid:
                raise serializers.ValidationError(err)
        return value


class GeoJSONFeatureSerializer(serializers.Serializer):
    """
    Serializes SpatialFeature into standard GeoJSON Feature (RFC 7946).
    """
    def to_representation(self, instance):
        props = SpatialFeatureSerializer(instance).data
        properties_dict = {
            'name': instance.name,
            'code': instance.code,
            'category': instance.category,
            'subcategory': instance.subcategory,
            'description': instance.description,
            'venue_color': instance.venue_color,
            'venue_opacity': instance.venue_opacity,
            'border_width': instance.border_width,
            'verification_radius_m': instance.verification_radius_m,
            'is_active': instance.is_active,
            'canonical_details': props
        }
        return {
            'type': 'Feature',
            'id': instance.id,
            'geometry': instance.geojson_geometry,
            'properties': properties_dict
        }



class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    institution_name = serializers.CharField(source='institution.full_name', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    name = serializers.CharField(source='full_name', read_only=True)  # Add 'name' field for frontend compatibility
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'name', 'role', 'avatar_url', 'email_verified', 'onboarding_complete', 'signup_method',
            'institution', 'institution_name', 'college', 'college_name',
            'phone_number', 'matric_number', 'department', 'department_name', 'level',
            'staff_id', 'courses', 'assigned_lecturer', 'signature_image',
            'notifications_enabled', 'location_enabled', 'dark_mode', 'timezone', 'permissions',
            'is_restricted', 'restriction_reason', 'restriction_note', 'restricted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at', 'is_restricted', 'restriction_reason', 'restriction_note', 'restricted_at']


    def get_permissions(self, obj):
        from .rbac import get_user_effective_permissions

        return get_user_effective_permissions(obj)


class OnboardingSerializer(serializers.ModelSerializer):
    """Serializer for user onboarding"""
    first_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'role', 'phone_number', 'matric_number', 'department', 'level',
            'staff_id', 'courses', 'assigned_lecturer', 'institution', 'college',
            'avatar_url', 'notifications_enabled', 'location_enabled', 'dark_mode', 'timezone'
        ]
    
    def update(self, instance, validated_data):
        from .models import CourseEnrollment, Course, UserRole
        import logging
        logger = logging.getLogger(__name__)
        
        # Extract first_name to map to full_name
        first_name = validated_data.pop('first_name', None)
        
        # Extract courses before updating
        courses_data = validated_data.pop('courses', None)
        
        # Set full_name from first_name if provided
        if first_name:
            instance.full_name = first_name
        
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
    name = serializers.CharField(source='title', read_only=True)
    instructor = serializers.CharField(source='lecturer.full_name', read_only=True)
    attendance_percentage = serializers.SerializerMethodField()
    sessions_attended = serializers.SerializerMethodField()
    total_sessions = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    

    def get_attendance_percentage(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.role != 'STUDENT':
            return 0
        total = AttendanceSession.objects.filter(course=obj).count()
        if total == 0:
            return 0
        attended = Attendance.objects.filter(student=request.user, session__course=obj).count()
        return round((attended / total) * 100)

    def get_percentage(self, obj):
        return self.get_attendance_percentage(obj)

    def get_sessions_attended(self, obj):
        request = self.context.get('request')
        if not request or not request.user or request.user.role != 'STUDENT':
            return 0
        return Attendance.objects.filter(student=request.user, session__course=obj).count()

    def get_total_sessions(self, obj):
        return AttendanceSession.objects.filter(course=obj).count()

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

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return CourseEnrollment.objects.filter(
            student=request.user,
            course=obj,
            is_active=True
        ).exists()


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Course Enrollment"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_matric = serializers.CharField(source='student.matric_number', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)
    lecturer_name = serializers.CharField(source='course.lecturer.full_name', read_only=True, allow_null=True)
    
    # Extra stats
    attendance_percentage = serializers.SerializerMethodField()
    sessions_attended = serializers.SerializerMethodField()
    total_sessions = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'student', 'student_name', 'student_email', 'student_matric',
            'course', 'course_code', 'course_title', 'course_name', 'lecturer_name',
            'attendance_percentage', 'sessions_attended', 'total_sessions',
            'is_active', 'enrolled_at', 'updated_at'
        ]
        read_only_fields = ['enrolled_at', 'updated_at']

    def get_attendance_percentage(self, obj):
        total = AttendanceSession.objects.filter(course=obj.course).count()
        if total == 0: return 0
        attended = Attendance.objects.filter(student=obj.student, session__course=obj.course).count()
        return round((attended / total) * 100)

    def get_sessions_attended(self, obj):
        return Attendance.objects.filter(student=obj.student, session__course=obj.course).count()

    def get_total_sessions(self, obj):
        return AttendanceSession.objects.filter(course=obj.course).count()


class TimetableSerializer(serializers.ModelSerializer):
    """Serializer for Timetable (DEFERRED FEATURE - Read-only)"""
    course_details = CourseSerializer(source='course', read_only=True)
    venue_details = VenueSerializer(source='venue', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Timetable
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']


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
        read_only_fields = ['created_at', 'updated_at', 'session_code', 'qr_code_url', 'is_valid', 'invalidation_reason']
    
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
    course_name = serializers.CharField(source='session.course.title', read_only=True)
    lecturer_name = serializers.CharField(source='session.course.lecturer.full_name', read_only=True, allow_null=True)
    
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


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['timestamp']


class RBACPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RBACPermission
        fields = [
            'id', 'codename', 'name', 'group', 'description', 'is_dangerous',
            'enabled_by_default', 'created_at', 'updated_at'
        ]


class StaffRoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = StaffRole
        fields = ['id', 'name', 'slug', 'description', 'is_system', 'is_active', 'permissions']

    def get_permissions(self, obj):
        return list(
            obj.role_permissions.select_related('permission').values_list('permission__codename', flat=True)
        )


class StaffProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_slug = serializers.CharField(source='role.slug', read_only=True)
    last_active = serializers.DateTimeField(source='last_active_at', read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user_id', 'full_name', 'email', 'status', 'role', 'role_name', 'role_slug',
            'invited_at', 'invitation_accepted_at', 'last_active', 'deactivated_at',
            'created_at', 'updated_at'
        ]


class StaffInvitationSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = StaffInvitation
        fields = [
            'id', 'email', 'full_name', 'role', 'role_name', 'custom_permissions', 'status', 'expires_at',
            'accepted_at', 'revoked_at', 'created_at', 'updated_at'
        ]


class StaffInviteRequestSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    role_id = serializers.IntegerField(required=False, allow_null=True)
    permissions = serializers.ListField(child=serializers.CharField(), required=False)


class StaffAcceptInviteSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=256)
    password = serializers.CharField(min_length=8, max_length=128)


class StaffPermissionUpdateSerializer(serializers.Serializer):
    role_id = serializers.IntegerField(required=False, allow_null=True)
    permissions = serializers.ListField(child=serializers.CharField(), required=False)
    status = serializers.ChoiceField(choices=StaffProfile.STATUS_CHOICES, required=False)


class CourseMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True, allow_null=True)

    class Meta:
        model = CourseMembership
        fields = [
            'id', 'course', 'user', 'user_name', 'user_email', 'role',
            'is_active', 'assigned_by', 'assigned_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
