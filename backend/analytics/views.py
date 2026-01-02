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
        return Response({'student_dashboard': {}})


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
        
        return Response({
            'total_sessions': total_sessions,
            'avg_attendance_percentage': avg_attendance_pct,
            'active_sessions_count': active_sessions,
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
        enrolled_students = CourseEnrollment.objects.filter(
            course=course,
            is_active=True
        ).select_related('student')
        
        # Build student analytics
        student_analytics = []
        benchmark = int(request.GET.get('benchmark', 70))
        
        for enrollment in enrolled_students:
            student = enrollment.student
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
