from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Dashboard analytics
    path('dashboard/', views.DashboardAnalyticsView.as_view(), name='dashboard'),
    path('dashboard/student/', views.StudentDashboardAnalyticsView.as_view(), name='student-dashboard'),
    path('dashboard/lecturer/', views.LecturerDashboardAnalyticsView.as_view(), name='lecturer-dashboard'),
    path('dashboard/admin/', views.AdminDashboardAnalyticsView.as_view(), name='admin-dashboard'),
    
    # Attendance analytics
    path('attendance/overview/', views.AttendanceOverviewView.as_view(), name='attendance-overview'),
    path('attendance/trends/', views.AttendanceTrendsView.as_view(), name='attendance-trends'),
    path('attendance/course/<int:course_id>/', views.CourseAttendanceAnalyticsView.as_view(), name='course-attendance'),
    path('attendance/student/<str:student_id>/', views.StudentAttendanceAnalyticsView.as_view(), name='student-attendance'),
    
    # Session analytics
    path('sessions/statistics/', views.SessionStatisticsView.as_view(), name='session-statistics'),
    path('sessions/<int:session_id>/analytics/', views.SessionAnalyticsView.as_view(), name='session-analytics'),
    path('sessions/live/', views.LiveSessionAnalyticsView.as_view(), name='live-session'),
    
    # Student analytics
    path('students/at-risk/', views.AtRiskStudentsView.as_view(), name='at-risk-students'),
    path('students/performance/', views.StudentPerformanceView.as_view(), name='student-performance'),
    path('students/engagement/', views.StudentEngagementView.as_view(), name='student-engagement'),
    
    # Course analytics
    path('courses/statistics/', views.CourseStatisticsView.as_view(), name='course-statistics'),
    path('courses/comparison/', views.CourseComparisonView.as_view(), name='course-comparison'),
    
    # Department/College analytics
    path('department/<int:department_id>/analytics/', views.DepartmentAnalyticsView.as_view(), name='department-analytics'),
    path('college/<int:college_id>/analytics/', views.CollegeAnalyticsView.as_view(), name='college-analytics'),
    
    # Predictive analytics
    path('predictions/attendance/', views.AttendancePredictionView.as_view(), name='attendance-prediction'),
    path('predictions/dropouts/', views.DropoutPredictionView.as_view(), name='dropout-prediction'),
]
