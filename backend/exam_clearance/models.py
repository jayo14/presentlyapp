from django.db import models
from django.conf import settings
from institutions.models import Course


class ExamClearanceStatus(models.TextChoices):
    """Exam clearance status choices"""
    PENDING = 'PENDING', 'Pending'
    CLEARED = 'CLEARED', 'Cleared'
    NOT_CLEARED = 'NOT_CLEARED', 'Not Cleared'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'


class ExamClearance(models.Model):
    """Exam clearance records for students"""
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_clearances')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exam_clearances')
    
    # Attendance metrics
    total_sessions = models.IntegerField(default=0)
    attended_sessions = models.IntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Clearance details
    status = models.CharField(max_length=20, choices=ExamClearanceStatus.choices, default=ExamClearanceStatus.PENDING)
    is_cleared = models.BooleanField(default=False)
    clearance_date = models.DateTimeField(null=True, blank=True)
    
    # Requirements
    minimum_attendance_required = models.DecimalField(max_digits=5, decimal_places=2, default=75.0)
    
    # Additional conditions
    has_outstanding_fees = models.BooleanField(default=False)
    has_disciplinary_issues = models.BooleanField(default=False)
    
    # Remarks
    remarks = models.TextField(blank=True, null=True)
    cleared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='clearances_approved'
    )
    
    # Metadata
    semester = models.CharField(max_length=20, blank=True, null=True)
    academic_year = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'exam_clearances'
        unique_together = [['student', 'course', 'semester', 'academic_year']]
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course']),
            models.Index(fields=['is_cleared']),
            models.Index(fields=['semester', 'academic_year']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.code} - {self.status}"
    
    def calculate_attendance_percentage(self):
        """Calculate and update attendance percentage"""
        if self.total_sessions > 0:
            self.attendance_percentage = (self.attended_sessions / self.total_sessions) * 100
        else:
            self.attendance_percentage = 0.0
        self.save()
    
    def check_clearance_status(self):
        """Check if student meets clearance requirements"""
        self.calculate_attendance_percentage()
        
        if (self.attendance_percentage >= self.minimum_attendance_required and 
            not self.has_outstanding_fees and 
            not self.has_disciplinary_issues):
            self.is_cleared = True
            self.status = ExamClearanceStatus.CLEARED
        else:
            self.is_cleared = False
            self.status = ExamClearanceStatus.NOT_CLEARED
        
        self.save()
        return self.is_cleared

