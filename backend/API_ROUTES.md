# Presently API - Complete Endpoint Reference

## Base URL
```
http://localhost:8000/api
```

## API Documentation
- **Swagger UI**: http://localhost:8000/api/swagger/
- **ReDoc**: http://localhost:8000/api/redoc/

---

## Authentication Endpoints

### POST /api/auth/register/
Register a new user account

### POST /api/auth/login/
Login and obtain JWT tokens

### POST /api/auth/logout/
Logout and blacklist refresh token

### GET /api/auth/me/
Get current user profile

### POST /api/auth/onboarding/
Complete user onboarding

### POST /api/auth/change-password/
Change user password

### POST /api/auth/token/refresh/
Refresh access token

### POST /api/auth/email-verification/send/
Send email verification OTP

### POST /api/auth/email-verification/verify/
Verify email with OTP

### POST /api/auth/password-reset/request/
Request password reset

### POST /api/auth/password-reset/verify/
Verify password reset token

### POST /api/auth/password-reset/confirm/
Confirm password reset

---

## Institution Management

### Institutions
- GET /api/institutions/ - List institutions
- POST /api/institutions/ - Create institution
- GET /api/institutions/{id}/ - Get institution details
- PUT /api/institutions/{id}/ - Update institution
- PATCH /api/institutions/{id}/ - Partial update
- DELETE /api/institutions/{id}/ - Delete institution

### Colleges
- GET /api/colleges/ - List colleges
- POST /api/colleges/ - Create college
- GET /api/colleges/{id}/ - Get college details
- PUT /api/colleges/{id}/ - Update college
- PATCH /api/colleges/{id}/ - Partial update
- DELETE /api/colleges/{id}/ - Delete college

### Departments
- GET /api/departments/ - List departments
- POST /api/departments/ - Create department
- GET /api/departments/{id}/ - Get department details
- PUT /api/departments/{id}/ - Update department
- PATCH /api/departments/{id}/ - Partial update
- DELETE /api/departments/{id}/ - Delete department

---

## Course & Attendance Management

### Courses
- GET /api/courses/ - List courses
- POST /api/courses/ - Create course
- GET /api/courses/{id}/ - Get course details
- PUT /api/courses/{id}/ - Update course
- PATCH /api/courses/{id}/ - Partial update
- DELETE /api/courses/{id}/ - Delete course

### Sessions
- GET /api/sessions/ - List attendance sessions
- POST /api/sessions/ - Create session (generates QR code)
- GET /api/sessions/{id}/ - Get session details
- PUT /api/sessions/{id}/ - Update session
- PATCH /api/sessions/{id}/ - Partial update
- DELETE /api/sessions/{id}/ - Delete session
- POST /api/sessions/{id}/check_in/ - Student check-in (QR + GPS)

### Attendances
- GET /api/attendances/ - List attendance records
- POST /api/attendances/ - Mark attendance
- GET /api/attendances/{id}/ - Get attendance details
- PUT /api/attendances/{id}/ - Update attendance
- PATCH /api/attendances/{id}/ - Partial update
- DELETE /api/attendances/{id}/ - Delete attendance

---

## Analytics Endpoints

### Dashboard Analytics
- GET /api/analytics/dashboard/ - General dashboard analytics
- GET /api/analytics/dashboard/student/ - Student dashboard data
- GET /api/analytics/dashboard/lecturer/ - Lecturer dashboard data
- GET /api/analytics/dashboard/admin/ - Admin dashboard data

### Attendance Analytics
- GET /api/analytics/attendance/overview/ - Attendance overview
- GET /api/analytics/attendance/trends/ - Attendance trends
- GET /api/analytics/attendance/course/{course_id}/ - Course attendance
- GET /api/analytics/attendance/student/{student_id}/ - Student attendance

### Session Analytics
- GET /api/analytics/sessions/statistics/ - Session statistics
- GET /api/analytics/sessions/{session_id}/analytics/ - Session analytics
- GET /api/analytics/sessions/live/ - Live session monitoring

### Student Analytics
- GET /api/analytics/students/at-risk/ - At-risk students detection
- GET /api/analytics/students/performance/ - Student performance metrics
- GET /api/analytics/students/engagement/ - Student engagement analytics

### Course Analytics
- GET /api/analytics/courses/statistics/ - Course statistics
- GET /api/analytics/courses/comparison/ - Course comparison

### Department/College Analytics
- GET /api/analytics/department/{department_id}/analytics/ - Department analytics
- GET /api/analytics/college/{college_id}/analytics/ - College analytics

### Predictive Analytics
- GET /api/analytics/predictions/attendance/ - Attendance predictions
- GET /api/analytics/predictions/dropouts/ - Dropout risk predictions

---

## Notifications & FCM

### Notifications
- GET /api/notifications/ - List user notifications
- GET /api/notifications/{id}/ - Get notification details
- POST /api/notifications/{id}/read/ - Mark as read
- POST /api/notifications/mark-all-read/ - Mark all as read
- GET /api/notifications/unread-count/ - Get unread count

### FCM Device Management
- GET /api/notifications/devices/ - List registered devices
- POST /api/notifications/devices/register/ - Register FCM device token
- GET /api/notifications/devices/{id}/ - Get device details
- POST /api/notifications/devices/{id}/deactivate/ - Deactivate device

### Notification Preferences
- GET /api/notifications/preferences/ - Get preferences
- PATCH /api/notifications/preferences/ - Update preferences

### Send Notifications (Admin/Lecturer)
- POST /api/notifications/send/ - Send to specific users
- POST /api/notifications/broadcast/ - Broadcast to all/groups

---

## Reports Generation

### Generate Reports
- POST /api/reports/generate/attendance/ - Generate attendance report
- POST /api/reports/generate/exam-clearance/ - Generate clearance report
- POST /api/reports/generate/session/ - Generate session report
- POST /api/reports/generate/student/ - Generate student report
- POST /api/reports/generate/course/ - Generate course report
- POST /api/reports/generate/department/ - Generate department report

### Report Management
- GET /api/reports/ - List generated reports
- GET /api/reports/{id}/ - Get report details
- GET /api/reports/{id}/download/ - Download report file
- DELETE /api/reports/{id}/delete/ - Delete report

### Scheduled Reports
- GET /api/reports/scheduled/ - List scheduled reports
- POST /api/reports/scheduled/create/ - Create scheduled report
- GET /api/reports/scheduled/{id}/ - Get scheduled report details
- POST /api/reports/scheduled/{id}/toggle/ - Enable/disable schedule

### Quick Exports
- POST /api/reports/export/attendance/ - Quick export attendance
- POST /api/reports/export/students/ - Quick export students

---

## Exam Clearance

### Clearance Management
- GET /api/exam-clearance/ - List clearances
- GET /api/exam-clearance/{id}/ - Get clearance details
- GET /api/exam-clearance/student/{student_id}/ - Student clearances
- GET /api/exam-clearance/course/{course_id}/ - Course clearances

### Clearance Operations
- POST /api/exam-clearance/{id}/calculate/ - Calculate clearance
- POST /api/exam-clearance/{id}/approve/ - Approve clearance
- POST /api/exam-clearance/{id}/reject/ - Reject clearance

### Bulk Operations
- POST /api/exam-clearance/calculate-all/ - Calculate all clearances
- POST /api/exam-clearance/generate/ - Generate clearances

### Reports & Certificates
- GET /api/exam-clearance/report/ - Clearance report
- GET /api/exam-clearance/{id}/certificate/ - Generate PDF certificate

---

## User Management (Admin Only)

- GET /api/users/ - List users
- POST /api/users/ - Create user
- GET /api/users/{id}/ - Get user details
- PUT /api/users/{id}/ - Update user
- PATCH /api/users/{id}/ - Partial update
- DELETE /api/users/{id}/ - Delete user

---

## Authentication

All endpoints (except /api/auth/register/, /api/auth/login/) require JWT authentication.

Include the token in request headers:
```
Authorization: Bearer <access_token>
```

---

## Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { ... }
}
```

---

## Pagination

List endpoints support pagination:
- `?page=1` - Page number
- `?page_size=30` - Results per page (default: 30, max: 100)

---

## Filtering

Endpoints support query parameters for filtering:
- `?course_id=1` - Filter by course
- `?student_id=uuid` - Filter by student
- `?status=active` - Filter by status
- `?start_date=2024-01-01` - Filter by date range
- `?end_date=2024-12-31`

---

## Export Formats

Reports can be exported in multiple formats:
- PDF - Professional formatted reports
- Excel (.xlsx) - Spreadsheet format
- CSV - Comma-separated values

Specify format in request:
```json
{
  "format": "PDF" | "EXCEL" | "CSV"
}
```
