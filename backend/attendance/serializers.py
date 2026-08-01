from rest_framework import serializers
from .models import AttendanceSubmission, AttendanceRecord
from institutions.models import AttendanceSession


class SessionConfigSerializer(serializers.ModelSerializer):
    """Session configuration returned to the mobile app for Phase 1-3 setup."""

    lecturer_lat = serializers.SerializerMethodField()
    lecturer_lng = serializers.SerializerMethodField()
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id',
            'session_code',
            'course_code',
            'course_title',
            'lecturer_lat',
            'lecturer_lng',
            'allowed_radius_meters',
            'required_presence_window_ms',
            'min_samples',
            'strict_mode',
            'is_active',
            'expires_at',
            'start_time',
            'end_time',
        ]

    def get_lecturer_lat(self, obj):
        if obj.lecturer_coordinates:
            return obj.lecturer_coordinates.get('lat')
        return float(obj.latitude) if obj.latitude else None

    def get_lecturer_lng(self, obj):
        if obj.lecturer_coordinates:
            return obj.lecturer_coordinates.get('lng')
        return float(obj.longitude) if obj.longitude else None


class AttendanceSubmissionCreateSerializer(serializers.Serializer):
    """Validates the payload POSTed by the mobile app."""

    session_id = serializers.IntegerField()
    coordinates = serializers.DictField(
        child=serializers.FloatField(),
        help_text="{lat, lng, accuracyMeters}"
    )
    sample_count = serializers.IntegerField(min_value=0)
    mock_gps_flag = serializers.BooleanField(default=False)
    network_type = serializers.ChoiceField(
        choices=AttendanceSubmission.NETWORK_CHOICES,
        default=AttendanceSubmission.NETWORK_NONE
    )
    movement_variance = serializers.FloatField(default=0.0)
    suspiciously_still = serializers.BooleanField(default=False)
    collection_duration_ms = serializers.IntegerField(min_value=0, default=0)
    confidence_score = serializers.IntegerField(min_value=0, max_value=100)
    score_breakdown = serializers.DictField(default=dict, required=False)
    fail_reasons = serializers.ListField(
        child=serializers.CharField(), default=list, required=False
    )
    behavioral_flags = serializers.DictField(default=dict, required=False)
    device_fingerprint = serializers.CharField(
        max_length=512, allow_blank=True, required=False, default=''
    )
    sample_spread = serializers.FloatField(required=False, allow_null=True)
    rejected_outlier_count = serializers.IntegerField(required=False, allow_null=True)

    def validate_coordinates(self, value):
        for key in ('lat', 'lng'):
            if key not in value:
                raise serializers.ValidationError(
                    f"coordinates must include '{key}'"
                )
        return value


class AttendanceSubmissionDetailSerializer(serializers.ModelSerializer):
    """Full submission details for the lecturer view."""

    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = AttendanceSubmission
        fields = [
            'id',
            'session_id',
            'student_email',
            'student_name',
            'submitted_at',
            'coordinates',
            'sample_count',
            'sample_spread',
            'rejected_outlier_count',
            'mock_gps_flag',
            'network_type',
            'movement_variance',
            'suspiciously_still',
            'collection_duration_ms',
            'confidence_score',
            'server_confidence_score',
            'verdict',
            'score_breakdown',
            'fail_reasons',
            'behavioral_flags',
            'ip_address',
            'device_fingerprint',
            'overridden_by_id',
            'override_reason',
            'overridden_at',
        ]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'session_id',
            'student_email',
            'student_name',
            'final_verdict',
            'confidence_score',
            'created_at',
            'updated_at',
        ]


class LecturerOverrideSerializer(serializers.Serializer):
    verdict = serializers.ChoiceField(
        choices=[
            AttendanceSubmission.VERDICT_ACCEPTED,
            AttendanceSubmission.VERDICT_REJECTED,
        ]
    )
    reason = serializers.CharField(max_length=1000, required=True)


class SubmissionStatusSerializer(serializers.ModelSerializer):
    """Lightweight polling response for GET /api/attendance/submission/<id>/status/."""

    confidenceScore = serializers.IntegerField(source='server_confidence_score')
    message = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSubmission
        fields = [
            'id',
            'verdict',
            'confidenceScore',
            'message',
            'fail_reasons',
        ]

    def get_message(self, obj):
        if obj.verdict == AttendanceSubmission.VERDICT_PENDING:
            return 'Submission received. Scoring in progress.'
        if obj.verdict == AttendanceSubmission.VERDICT_ACCEPTED:
            return 'Attendance accepted.'
        if obj.verdict == AttendanceSubmission.VERDICT_FLAGGED:
            return 'Attendance flagged for manual review.'
        if obj.verdict == AttendanceSubmission.VERDICT_REJECTED:
            return 'Attendance rejected.'
        return 'Unknown verdict.'
