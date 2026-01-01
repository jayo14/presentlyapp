from django.urls import path
from . import views

app_name = 'exam_clearance'

urlpatterns = [
    # Exam clearance management
    path('', views.ExamClearanceListView.as_view(), name='clearance-list'),
    path('<int:pk>/', views.ExamClearanceDetailView.as_view(), name='clearance-detail'),
    path('student/<str:student_id>/', views.StudentClearanceView.as_view(), name='student-clearance'),
    path('course/<int:course_id>/', views.CourseClearanceView.as_view(), name='course-clearance'),
    
    # Clearance operations
    path('<int:pk>/calculate/', views.CalculateClearanceView.as_view(), name='clearance-calculate'),
    path('<int:pk>/approve/', views.ApproveClearanceView.as_view(), name='clearance-approve'),
    path('<int:pk>/reject/', views.RejectClearanceView.as_view(), name='clearance-reject'),
    
    # Bulk operations
    path('calculate-all/', views.CalculateAllClearancesView.as_view(), name='clearance-calculate-all'),
    path('generate/', views.GenerateClearancesView.as_view(), name='clearance-generate'),
    
    # Reports
    path('report/', views.ClearanceReportView.as_view(), name='clearance-report'),
    path('<int:pk>/certificate/', views.GenerateClearanceCertificateView.as_view(), name='clearance-certificate'),
]
