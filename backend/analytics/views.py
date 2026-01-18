from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, F
from django.utils import timezone
from datetime import timedelta
from institutions.models import AttendanceSession, Attendance, Course, User, UserRole


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'dashboard': {}})


class StudentDashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """
        Get comprehensive dashboard data for student
        Returns: user info, enrolled courses, attendance stats, next class, recent activity
        """
        user = request.user
        
        if user.role != UserRole.STUDENT:
            return Response({
                'error': 'This endpoint is only for students'
            }, status=403)
        
        from institutions.models import CourseEnrollment
        from datetime import datetime
        
        # Get enrolled courses with attendance stats
        enrollments = CourseEnrollment.objects.filter(
            student=user,
            is_active=True
        ).select_related('course').prefetch_related('course__department')
        
        enrolled_courses = []
        total_present = 0
        total_late = 0
        total_absent = 0
        total_sessions_overall = 0
        
        for enrollment in enrollments:
            course = enrollment.course
            
            # Get total sessions for this course
            total_sessions = AttendanceSession.objects.filter(course=course).count()
            
            # Get student's attendance for this course
            attendances = Attendance.objects.filter(
                student=user,
                session__course=course
            )
            
            sessions_attended = attendances.count()
            present_count = attendances.filter(status='PRESENT').count()
            late_count = attendances.filter(status='LATE').count()
            
            # Calculate percentage
            attendance_percentage = round((sessions_attended / total_sessions) * 100) if total_sessions > 0 else 0
            
            # Determine status
            if attendance_percentage >= 75:
                status = 'Good'
            elif attendance_percentage >= 50:
                status = 'Average'
            else:
                status = 'Warning'
            
            enrolled_courses.append({
                'id': enrollment.id,
                'course': course.id,
                'course_code': course.code,
                'course_name': course.title,
                'course_title': course.title,
                'department': course.department.id if course.department else None,
                'department_name': course.department.name if course.department else None,
                'semester': course.semester,
                'level': course.level,
                'credit_units': course.credit_units,
                'lecturer_name': course.lecturer.full_name if course.lecturer else None,
                'is_active': enrollment.is_active,
                'enrolled_at': enrollment.created_at.isoformat(),
                'attendance_percentage': attendance_percentage,
                'sessions_attended': sessions_attended,
                'total_sessions': total_sessions,
                'status': status
            })
            
            # Aggregate stats
            total_present += present_count
            total_late += late_count
            total_absent += (total_sessions - sessions_attended)
            total_sessions_overall += total_sessions
        
        # Calculate average attendance
        avg_attendance = round(sum([c['attendance_percentage'] for c in enrolled_courses]) / len(enrolled_courses)) if enrolled_courses else 0
        
        # Get next upcoming class (from timetable or sessions)
        from institutions.models import Timetable
        now = timezone.now()
        
        # Try to find next session
        next_session = AttendanceSession.objects.filter(
            course__in=[e.course for e in enrollments],
            start_time__gt=now,
            is_active=True
        ).order_by('start_time').first()
        
        next_class = None
        if next_session:
            next_class = {
                'id': next_session.id,
                'course_code': next_session.course.code,
                'course_name': next_session.course.title,
                'start_time': next_session.start_time.isoformat(),
                'venue_name': next_session.venue.name if next_session.venue else None,
                'venue_code': next_session.venue.code if next_session.venue else None,
            }
        
        # Get recent activity (last 10 attendance records)
        recent_attendances = Attendance.objects.filter(
            student=user
        ).select_related('session', 'session__course').order_by('-checked_in_at')[:10]
        
        recent_activity = []
        for attendance in recent_attendances:
            recent_activity.append({
                'id': attendance.id,
                'type': 'attendance',
                'course_code': attendance.session.course.code,
                'course_name': attendance.session.course.title,
                'timestamp': attendance.checked_in_at.isoformat(),
                'status': attendance.status,
                'description': f"Marked {attendance.status.lower()} for {attendance.session.course.code}"
            })
        
        return Response({
            'user': {
                'id': str(user.id),
                'full_name': user.full_name,
                'email': user.email,
                'matric_number': user.matric_number,
                'level': user.level,
                'department': user.department,  # department is a CharField, not a ForeignKey
                'college': user.college.name if user.college else None,
                'institution': user.institution.full_name if user.institution else None,
            },
            'enrolled_courses': enrolled_courses,
            'attendance_stats': {
                'average_attendance': avg_attendance,
                'total_present': total_present,
                'total_late': total_late,
                'total_absent': total_absent,
                'total_sessions': total_sessions_overall,
            },
            'next_class': next_class,
            'recent_activity': recent_activity
        })


class LecturerDashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """
        Get comprehensive dashboard analytics for lecturer
        Returns: total sessions, avg attendance, active sessions, weekly overview
        """
        user = request.user
        
        # Get courses taught by this lecturer
        lecturer_courses = Course.objects.filter(lecturer=user, is_active=True)
        
        # Total sessions for all lecturer's courses
        total_sessions = AttendanceSession.objects.filter(
            course__in=lecturer_courses
        ).count()
        
        # Active sessions (ongoing)
        now = timezone.now()
        active_sessions = AttendanceSession.objects.filter(
            course__in=lecturer_courses,
            is_active=True,
            start_time__lte=now,
            end_time__gte=now
        ).count()
        
        # Calculate average attendance percentage
        sessions_with_attendance = AttendanceSession.objects.filter(
            course__in=lecturer_courses
        ).annotate(
            attendee_count=Count('attendances')
        )
        
        if sessions_with_attendance.exists():
            total_attendance = sum([s.attendee_count for s in sessions_with_attendance])
            total_capacity = sessions_with_attendance.count() * 100  # Assume 100 students per course
            avg_attendance_pct = round((total_attendance / total_capacity * 100), 1) if total_capacity > 0 else 0
        else:
            avg_attendance_pct = 0
        
        # Weekly overview - attendance by day of week for past 7 days
        week_ago = now - timedelta(days=7)
        weekly_sessions = AttendanceSession.objects.filter(
            course__in=lecturer_courses,
            start_time__gte=week_ago,
            start_time__lte=now
        ).annotate(
            attendee_count=Count('attendances')
        ).values('start_time', 'attendee_count')
        
        # Group by day of week
        weekly_data = {'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0}
        for session in weekly_sessions:
            day_name = session['start_time'].strftime('%a')
            weekly_data[day_name] += session['attendee_count']
            
        # Get total unique students enrolled in lecturer's courses
        from institutions.models import CourseEnrollment
        total_students = CourseEnrollment.objects.filter(
            course__in=lecturer_courses,
            is_active=True
        ).values('student').distinct().count()
        
        return Response({
            'total_sessions': total_sessions,
            'avg_attendance_percentage': avg_attendance_pct,
            'active_sessions_count': active_sessions,
            'total_students': total_students,
            'weekly_overview': [
                {'name': day, 'attendees': count} 
                for day, count in weekly_data.items()
            ]
        })


class AdminDashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'admin_dashboard': {}})


class AttendanceOverviewView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'overview': {}})


class AttendanceTrendsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'trends': []})


class CourseAttendanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, course_id):
        """
        Get detailed attendance analytics for a specific course
        Returns: student list with attendance records, percentages, at-risk students
        """
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        
        # Check if user has permission (lecturer of this course or admin)
        user = request.user
        if user.role not in [UserRole.LECTURER, UserRole.ADMIN] and course.lecturer != user:
            return Response({'error': 'Permission denied'}, status=403)
        
        # Get all sessions for this course
        total_sessions = AttendanceSession.objects.filter(course=course).count()
        
        if total_sessions == 0:
            return Response({
                'course_id': course_id,
                'course_code': course.code,
                'course_name': course.title,
                'total_sessions': 0,
                'students': [],
                'avg_attendance': 0,
                'at_risk_count': 0,
                'good_standing_count': 0
            })
        
        # Get enrolled students for this course using the enrollment system
        from institutions.models import CourseEnrollment
        enrolled_student_ids = CourseEnrollment.objects.filter(
            course=course,
            is_active=True
        ).values_list('student_id', flat=True)
        
        # Get students who have attended at least one session but might not be enrolled
        attending_student_ids = Attendance.objects.filter(
            session__course=course
        ).values_list('student_id', flat=True).distinct()
        
        # Combine both sets of student IDs
        all_student_ids = set(enrolled_student_ids) | set(attending_student_ids)
        
        # Fetch user objects
        all_students = User.objects.filter(id__in=all_student_ids)
        
        # Build student analytics
        student_analytics = []
        benchmark = int(request.GET.get('benchmark', 70))
        
        for student in all_students:
            attended_count = Attendance.objects.filter(
                student=student,
                session__course=course
            ).count()
            
            attendance_percentage = round((attended_count / total_sessions) * 100) if total_sessions > 0 else 0
            
            student_analytics.append({
                'id': str(student.id),
                'name': student.full_name,
                'matric': student.matric_number or 'N/A',
                'department': student.department or 'N/A',
                'level': student.level or 'N/A',
                'attended': attended_count,
                'total': total_sessions,
                'percentage': attendance_percentage
            })
        
        # Sort by attendance percentage (descending)
        student_analytics.sort(key=lambda x: x['percentage'], reverse=True)
        
        # Calculate summary statistics
        avg_attendance = round(sum([s['percentage'] for s in student_analytics]) / len(student_analytics)) if student_analytics else 0
        at_risk_count = len([s for s in student_analytics if s['percentage'] < benchmark])
        good_standing_count = len([s for s in student_analytics if s['percentage'] >= benchmark])
        
        return Response({
            'course_id': course_id,
            'course_code': course.code,
            'course_name': course.title,
            'total_sessions': total_sessions,
            'students': student_analytics,
            'avg_attendance': avg_attendance,
            'at_risk_count': at_risk_count,
            'good_standing_count': good_standing_count,
            'benchmark': benchmark
        })


class StudentAttendanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, student_id):
        return Response({'student_id': student_id, 'analytics': {}})


class SessionStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'statistics': {}})


class SessionAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, session_id):
        return Response({'session_id': session_id, 'analytics': {}})


class LiveSessionAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'live_sessions': []})


class AtRiskStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'at_risk_students': []})


class StudentPerformanceView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'performance': {}})


class StudentEngagementView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'engagement': {}})


class CourseStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'statistics': {}})


class CourseComparisonView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'comparison': {}})


class DepartmentAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, department_id):
        return Response({'department_id': department_id, 'analytics': {}})


class CollegeAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, college_id):
        return Response({'college_id': college_id, 'analytics': {}})


class AttendancePredictionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'predictions': []})


class DropoutPredictionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'predictions': []})