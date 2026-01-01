from django.db import models
from django.conf import settings


class Venue(models.Model):
    """Physical locations for attendance sessions"""
    
    name = models.CharField(max_length=200)
    building = models.CharField(max_length=100, blank=True, null=True)
    room_number = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.IntegerField(default=0, help_text="Maximum capacity")
    
    # Location for GPS verification
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    gps_radius = models.IntegerField(default=100, help_text="GPS verification radius in meters")
    
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
    
    # Institution relationship
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, related_name='venues', null=True, blank=True)
    college = models.ForeignKey('institutions.College', on_delete=models.CASCADE, related_name='venues', null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
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
        location = f"{self.building} - {self.room_number}" if self.building and self.room_number else self.name
        return location


class Timetable(models.Model):
    """Timetable entries (DEFERRED - Currently disabled)"""
    
    course = models.ForeignKey('institutions.Course', on_delete=models.CASCADE, related_name='timetable_entries')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_entries')
    
    # Day and time
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # Recurrence
    is_recurring = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Status
    is_active = models.BooleanField(default=False, help_text="DEFERRED FEATURE - Keep disabled")
    
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
