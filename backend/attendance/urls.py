from django.urls import path
from .views import (
    SubmitAttendanceView,
    SessionConfigView,
    LecturerSessionSubmissionsView,
    LecturerOverrideView,
)

app_name = 'attendance'

urlpatterns = [
    # Student endpoints
    path('submit/', SubmitAttendanceView.as_view(), name='submit'),
    path('session/<int:session_id>/', SessionConfigView.as_view(), name='session-config'),

    # Lecturer endpoints
    path(
        'lecturer/session/<int:session_id>/submissions/',
        LecturerSessionSubmissionsView.as_view(),
        name='lecturer-submissions',
    ),
    path(
        'lecturer/override/<int:submission_id>/',
        LecturerOverrideView.as_view(),
        name='lecturer-override',
    ),
]
