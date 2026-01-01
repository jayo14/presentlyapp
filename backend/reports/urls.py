from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Report management
    path('', views.ReportListView.as_view(), name='report-list'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('<int:pk>/download/', views.DownloadReportView.as_view(), name='report-download'),
    path('<int:pk>/delete/', views.DeleteReportView.as_view(), name='report-delete'),
    
    # Generate reports
    path('generate/attendance/', views.GenerateAttendanceReportView.as_view(), name='generate-attendance'),
    path('generate/exam-clearance/', views.GenerateExamClearanceReportView.as_view(), name='generate-exam-clearance'),
    path('generate/session/', views.GenerateSessionReportView.as_view(), name='generate-session'),
    path('generate/student/', views.GenerateStudentReportView.as_view(), name='generate-student'),
    path('generate/course/', views.GenerateCourseReportView.as_view(), name='generate-course'),
    path('generate/department/', views.GenerateDepartmentReportView.as_view(), name='generate-department'),
    
    # Scheduled reports
    path('scheduled/', views.ScheduledReportListView.as_view(), name='scheduled-list'),
    path('scheduled/create/', views.CreateScheduledReportView.as_view(), name='scheduled-create'),
    path('scheduled/<int:pk>/', views.ScheduledReportDetailView.as_view(), name='scheduled-detail'),
    path('scheduled/<int:pk>/toggle/', views.ToggleScheduledReportView.as_view(), name='scheduled-toggle'),
    
    # Quick exports
    path('export/attendance/', views.QuickExportAttendanceView.as_view(), name='export-attendance'),
    path('export/students/', views.QuickExportStudentsView.as_view(), name='export-students'),
]
