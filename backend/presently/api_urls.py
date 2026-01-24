from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy"}, status=200)

schema_view = get_schema_view(
   openapi.Info(
      title="Presently API",
      default_version='v1',
      description="""
      # Presently API Documentation
      
      Complete API for the Presently attendance management system.
      
      ## Features
      - 🔐 JWT Authentication
      - 🎓 Institution, College, Department Management
      - 📚 Course Management
      - ✅ Attendance Sessions & Check-ins
      - 📊 Real-time Analytics & Insights
      - 🔔 Push Notifications (FCM)
      - 📄 PDF/Excel Report Generation
      - 🎯 Automated Exam Clearance
      - 🗺️ GPS Geofencing
      - 📱 QR Code Scanning
      
      ## Authentication
      Use JWT tokens obtained from `/api/auth/login/` endpoint.
      Include in request headers: `Authorization: Bearer <token>`
      """,
      contact=openapi.Contact(email="contact@presently.app"),
      license=openapi.License(name="Proprietary License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Health Check
    path('health/', health_check, name='health-check'),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='api-root'),
    
    # Core APIs
    path('', include('institutions.urls')),  # Auth, Institutions, Courses, Sessions, Attendance
    
    # Feature APIs
    path('notifications/', include('notifications.urls')),  # Push notifications, FCM
    path('analytics/', include('analytics.urls')),  # Real-time analytics, insights
    path('reports/', include('reports.urls')),  # PDF/Excel exports
    path('exam-clearance/', include('exam_clearance.urls')),  # Exam clearance management
    path('system/', include('system.urls')),  # System logs, stats, config
]

