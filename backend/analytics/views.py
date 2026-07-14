import csv
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, F
from django.http import HttpResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
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
                'department': course.department.first().id if course.department.exists() else None,
                'department_name': course.department.first().name if course.department.exists() else None,
                'semester': course.semester,
                'level': course.level,
                'credit_units': course.credit_units,
                'lecturer_name': course.lecturer.full_name if course.lecturer else None,
                'is_active': enrollment.is_active,
                'enrolled_at': enrollment.enrolled_at.isoformat(),
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
        
        # Weekly attendance (last 4 weeks)
        weekly_attendance = []
        for i in range(3, -1, -1):
            start_date = now - timedelta(days=(i+1)*7)
            end_date = now - timedelta(days=i*7)
            
            week_sessions = AttendanceSession.objects.filter(
                course__in=[e.course for e in enrollments],
                start_time__gte=start_date,
                start_time__lte=end_date
            )
            
            if week_sessions.exists():
                week_attended = Attendance.objects.filter(
                    student=user,
                    session__in=week_sessions
                ).count()
                week_total = week_sessions.count()
                week_pct = round((week_attended / week_total) * 100) if week_total > 0 else 0
            else:
                week_pct = 0
                
            weekly_attendance.append({
                'week': f"Week {4-i}",
                'attendance': week_pct
            })

        return Response({
            'user': {
                'id': str(user.id),
                'full_name': user.full_name,
                'email': user.email,
                'matric_number': user.matric_number,
                'level': user.level,
                'department': user.department.name if hasattr(user.department, 'name') else user.department,
                'college': user.college.name if user.college else None,
                'institution': user.institution.full_name if user.institution else None,
            },
            'enrolled_courses': enrolled_courses,
            'attendance_stats': {
                'average_attendance': avg_attendance,
                'total_present': total_present,
                'total_late': total_late,
                'total_absent': max(0, total_sessions_overall - (total_present + total_late)),
                'total_sessions': total_sessions_overall,
            },
            'status_breakdown': {
                'present': total_present,
                'late': total_late,
                'absent': max(0, total_sessions_overall - (total_present + total_late)),
            },
            'weekly_attendance': weekly_attendance,
            'next_class': next_class,
            'recent_activity': recent_activity
        })


class LecturerDashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    @method_decorator(cache_page(60))
    @method_decorator(vary_on_headers('Authorization'))
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
            st = session['start_time']
            if isinstance(st, str):
                from django.utils.dateparse import parse_datetime
                st = parse_datetime(st)
            
            if st:
                day_name = st.strftime('%a')
                if day_name in weekly_data:
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
        """Get summary statistics for the admin dashboard"""
        total_users = User.objects.count()
        students = User.objects.filter(role=UserRole.STUDENT).count()
        lecturers = User.objects.filter(role=UserRole.LECTURER).count()
        admins = User.objects.filter(role=UserRole.ADMIN).count()
        
        # Other useful stats for admin
        total_courses = Course.objects.count()
        total_sessions = AttendanceSession.objects.count()
        total_attendances = Attendance.objects.count()
        
        return Response({
            'success': True,
            'data': {
                'users': {
                    'total': total_users,
                    'students': students,
                    'lecturers': lecturers,
                    'admins': admins
                },
                'platform': {
                    'courses': total_courses,
                    'sessions': total_sessions,
                    'attendances': total_attendances
                }
            }
        })


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

    @method_decorator(cache_page(30))
    @method_decorator(vary_on_headers('Authorization'))
    def get(self, request, course_id):
        """
        Get detailed attendance analytics for a specific course.
        Returns students sorted by matric number (ascending) with:
        Matric Number, Full Name, Total Sessions, Sessions Attended,
        Attendance Rate (%), Status (Present/Absent).
        """
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

        user = request.user
        if user.role not in [UserRole.LECTURER, UserRole.ADMIN] and not course.is_user_lecturer(user):
            return Response({'error': 'Permission denied'}, status=403)

        # Optional date-range filters
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        department_id = request.query_params.get('department_id')
        college_id = request.query_params.get('college_id')
        benchmark = int(request.query_params.get('benchmark', 75))

        sessions_qs = AttendanceSession.objects.filter(course=course)
        if date_from:
            sessions_qs = sessions_qs.filter(start_time__date__gte=date_from)
        if date_to:
            sessions_qs = sessions_qs.filter(start_time__date__lte=date_to)
        total_sessions = sessions_qs.count()

        if total_sessions == 0:
            return Response({
                'course_id': course_id,
                'course_code': course.code,
                'course_name': course.title,
                'lecturer': course.lecturer.full_name if course.lecturer else None,
                'total_sessions': 0,
                'students': [],
                'avg_attendance': 0,
                'at_risk_count': 0,
                'good_standing_count': 0,
                'benchmark': benchmark,
                'date_from': date_from,
                'date_to': date_to,
            })

        from institutions.models import CourseEnrollment
        enrolled_qs = CourseEnrollment.objects.filter(course=course, is_active=True)
        enrolled_student_ids = enrolled_qs.values_list('student_id', flat=True)

        attending_student_ids = Attendance.objects.filter(
            session__in=sessions_qs
        ).values_list('student_id', flat=True).distinct()

        all_student_ids = {sid for sid in (set(enrolled_student_ids) | set(attending_student_ids)) if sid}

        students_qs = User.objects.filter(id__in=all_student_ids)
        if department_id:
            students_qs = students_qs.filter(department_id=department_id)
        if college_id:
            students_qs = students_qs.filter(college_id=college_id)

        student_analytics = []
        for student in students_qs:
            attended_count = Attendance.objects.filter(
                student=student,
                session__in=sessions_qs,
            ).count()

            attendance_rate = round((attended_count / total_sessions) * 100, 1) if total_sessions > 0 else 0.0
            status = 'Present' if attendance_rate >= benchmark else 'Absent'

            dept = student.department
            dept_name = dept.name if hasattr(dept, 'name') else (dept or 'N/A')

            student_analytics.append({
                'id': str(student.id),
                'matric_number': student.matric_number or 'N/A',
                'full_name': student.full_name,
                'department': dept_name,
                'level': student.level or 'N/A',
                'total_sessions': total_sessions,
                'sessions_attended': attended_count,
                'attendance_rate': attendance_rate,
                'status': status,
                # Legacy fields kept for backward-compat
                'name': student.full_name,
                'matric': student.matric_number or 'N/A',
                'attended': attended_count,
                'total': total_sessions,
                'percentage': attendance_rate,
            })

        # Sort ascending by matric number (PRD requirement)
        student_analytics.sort(key=lambda x: (x['matric_number'] == 'N/A', x['matric_number']))

        avg_attendance = round(
            sum(s['attendance_rate'] for s in student_analytics) / len(student_analytics), 1
        ) if student_analytics else 0.0
        at_risk_count = sum(1 for s in student_analytics if s['attendance_rate'] < benchmark)
        good_standing_count = sum(1 for s in student_analytics if s['attendance_rate'] >= benchmark)

        return Response({
            'course_id': course_id,
            'course_code': course.code,
            'course_name': course.title,
            'lecturer': course.lecturer.full_name if course.lecturer else None,
            'total_sessions': total_sessions,
            'students': student_analytics,
            'avg_attendance': avg_attendance,
            'at_risk_count': at_risk_count,
            'good_standing_count': good_standing_count,
            'benchmark': benchmark,
            'date_from': date_from,
            'date_to': date_to,
        })


class CourseAttendanceTableExportView(APIView):
    """
    Export the attendance analytics table as CSV, Excel or PDF.
    GET /analytics/attendance/course/<course_id>/export/<fmt>/
    Supported fmt values: csv, excel, xlsx, pdf
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, fmt):
        from reports.export_services import generate_attendance_csv, generate_attendance_excel, generate_attendance_pdf

        fmt = fmt.lower()
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        try:
            if fmt == 'csv':
                content = generate_attendance_csv(course_id, date_from, date_to)
                resp = HttpResponse(content, content_type='text/csv')
                resp['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.csv"'
                return resp
            elif fmt in ('excel', 'xlsx'):
                content = generate_attendance_excel(course_id, date_from, date_to)
                resp = HttpResponse(
                    content,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                )
                resp['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.xlsx"'
                return resp
            elif fmt == 'pdf':
                content = generate_attendance_pdf(course_id, date_from, date_to)
                resp = HttpResponse(content, content_type='application/pdf')
                resp['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.pdf"'
                return resp
            else:
                return Response({'error': f'Unsupported format: {fmt}. Use csv, excel/xlsx, or pdf.'}, status=400)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception:
            return Response({'error': 'Failed to generate export. Please try again.'}, status=500)


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
        from institutions.models import AttendanceSession, CourseEnrollment
        from institutions.serializers import AttendanceSessionSerializer
        from django.utils import timezone

        user = request.user
        now = timezone.now()

        # Get active sessions for courses student is enrolled in
        if user.role == 'STUDENT':
            enrollments = CourseEnrollment.objects.filter(student=user, is_active=True)
            courses = [e.course for e in enrollments]

            live_sessions = AttendanceSession.objects.filter(
                course__in=courses,
                start_time__lte=now,
                end_time__gte=now,
                is_active=True
            ).select_related('course', 'venue', 'course__lecturer')
        else:
            # For lecturers, get their own active sessions
            live_sessions = AttendanceSession.objects.filter(
                course__lecturer=user,
                start_time__lte=now,
                end_time__gte=now,
                is_active=True
            ).select_related('course', 'venue', 'course__lecturer')

        serializer = AttendanceSessionSerializer(live_sessions, many=True, context={'request': request})
        return Response({'live_sessions': serializer.data})


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