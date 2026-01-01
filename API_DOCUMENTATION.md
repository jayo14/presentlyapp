# Presently API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: Valid for 1 hour
- **Refresh Token**: Valid for 7 days
- Tokens are automatically rotated on refresh

---

## Authentication Endpoints

### Register User
**POST** `/auth/register/`

Register a new user account.

**Request:**
```json
{
  "email": "student@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123!",
  "password2": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "full_name": "John Doe",
    "role": "STUDENT",
    "onboarding_complete": false
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "requires_onboarding": true
}
```

---

### Login
**POST** `/auth/login/`

Authenticate and receive JWT tokens.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "full_name": "John Doe",
    "role": "STUDENT",
    "onboarding_complete": true,
    "avatar_url": null
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "requires_onboarding": false
}
```

---

### Logout
**POST** `/auth/logout/`
🔒 **Requires Authentication**

Invalidate refresh token (blacklist it).

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Current User
**GET** `/auth/me/`
🔒 **Requires Authentication**

Get the authenticated user's profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "full_name": "John Doe",
    "role": "STUDENT",
    "avatar_url": null,
    "onboarding_complete": true,
    "institution": 1,
    "institution_name": "Obafemi Awolowo University",
    "college": 1,
    "college_name": "College of Science",
    "phone_number": "+234800000000",
    "matric_number": "CSC/2021/001",
    "department": "Computer Science",
    "level": "300",
    "notifications_enabled": true,
    "location_enabled": false,
    "dark_mode": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### Complete Onboarding
**POST** `/auth/onboarding/`
🔒 **Requires Authentication**

Complete user onboarding by providing role-specific information.

**Request (Student):**
```json
{
  "role": "STUDENT",
  "phone_number": "+234800000000",
  "matric_number": "CSC/2021/001",
  "department": "Computer Science",
  "level": "300",
  "institution": 1,
  "college": 1,
  "notifications_enabled": true,
  "location_enabled": true,
  "dark_mode": true
}
```

**Request (Lecturer):**
```json
{
  "role": "LECTURER",
  "phone_number": "+234800000000",
  "staff_id": "LEC/2020/001",
  "courses": "CSC402, CSC404",
  "institution": 1,
  "college": 1
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": { /* Full user profile */ }
}
```

---

### Change Password
**POST** `/auth/change-password/`
🔒 **Requires Authentication**

Change the authenticated user's password.

**Request:**
```json
{
  "old_password": "OldSecurePass123!",
  "new_password": "NewSecurePass456!",
  "new_password2": "NewSecurePass456!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Request Password Reset
**POST** `/auth/password-reset/request/`

Request a password reset email.

**Request:**
```json
{
  "email": "student@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Note:** For security, the response is the same whether the email exists or not.

---

### Verify Reset Token
**POST** `/auth/password-reset/verify/`

Verify if a password reset token is valid.

**Request:**
```json
{
  "uid": "MQ",
  "token": "c6f2k5-abc123def456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "valid": true,
  "email": "student@example.com"
}
```

Or if invalid:
```json
{
  "success": true,
  "valid": false,
  "error": "Invalid or expired token"
}
```

---

### Reset Password
**POST** `/auth/password-reset/confirm/`

Reset password using the token from email.

**Request:**
```json
{
  "uid": "MQ",
  "token": "c6f2k5-abc123def456",
  "new_password": "NewSecurePass789!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### Refresh Token
**POST** `/auth/token/refresh/`

Get a new access token using the refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."  // New refresh token (rotation enabled)
}
```

---

## Institution Management

### List Institutions
**GET** `/institutions/`
🔒 **Requires Authentication**

Get all institutions (active only for non-admin users).

**Query Parameters:**
- None

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "full_name": "Obafemi Awolowo University",
    "short_name": "OAU",
    "abbreviation": "OAU",
    "city": "Ile-Ife",
    "country": "Nigeria",
    "institution_type": "UNIVERSITY",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

### Create Institution
**POST** `/institutions/`
🔒 **Requires Admin Role**

Create a new institution.

---

## College Management

### List Colleges
**GET** `/colleges/`
🔒 **Requires Authentication**

**Query Parameters:**
- `institution` (optional): Filter by institution ID

**Response:** `200 OK`

---

## Course Management

### List Courses
**GET** `/courses/`
🔒 **Requires Authentication**

**Query Parameters:**
- `department` (optional): Filter by department ID
- `lecturer` (optional): Filter by lecturer ID

---

## Attendance Session Management

### List Sessions
**GET** `/sessions/`
🔒 **Requires Authentication**

**Query Parameters:**
- `course` (optional): Filter by course ID
- `active` (optional): Filter by active status (true/false)

### Check In to Session
**POST** `/sessions/{id}/check_in/`
🔒 **Requires Student Role**

Check in to an attendance session.

**Request:**
```json
{
  "latitude": 7.5629,
  "longitude": 4.5200,
  "location_verified": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": 1,
    "session": 1,
    "student": "uuid",
    "checked_in_at": "2026-01-01T10:30:00Z",
    "status": "PRESENT",
    "location_verified": true
  }
}
```

---

## Attendance Records

### List Attendances
**GET** `/attendances/`
🔒 **Requires Authentication**

**Query Parameters:**
- `session` (optional): Filter by session ID
- `student` (optional): Filter by student ID

**Note:** Students can only see their own attendance records.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting using `django-ratelimit`. Excessive requests will result in:

**Response:** `429 Too Many Requests`
```json
{
  "detail": "Request was throttled. Expected available in X seconds."
}
```

---

## Password Reset Flow

1. **User requests reset**: `POST /auth/password-reset/request/` with email
2. **User receives email** with reset link: `http://frontend.com/reset-password?uid=MQ&token=abc123`
3. **Frontend verifies token** (optional): `POST /auth/password-reset/verify/`
4. **User submits new password**: `POST /auth/password-reset/confirm/`
5. **User redirected to login**

---

## Email Configuration

### Development
Emails are printed to the Django console:
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### Production (Gmail Example)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'app-specific-password'
```

**Note:** For Gmail, you need to generate an App Password in your Google Account settings.

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test User","password":"SecurePass123!","password2":"SecurePass123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for `base_url` and `access_token`
3. Use Bearer Token authentication for protected endpoints

---

## Frontend Integration

See `frontend/services/api/` for TypeScript API client and `frontend/hooks/useAuth.ts` for React hooks.

**Example:**
```typescript
import { useLogin } from '../hooks/useAuth';

const { mutate: login, isLoading, error } = useLogin();

login({ email: 'test@example.com', password: 'SecurePass123!' });
```
