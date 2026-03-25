# CHECK-IN 403 DEBUGGING GUIDE
## Phase 1 & 2: Systematic Diagnosis

---

## What You Need To Do NOW

### Step 1: Trigger the 403 Error Again
1. Open your Django logs (Render dashboard or local terminal)
2. Make a check-in attempt from the mobile device
3. **Watch the logs for these new messages:**

```
=== CHECK-IN DEBUG ===
REQUEST USER: ...
IS AUTHENTICATED: ...
AUTH HEADER: ...
USER ROLE: ...
IS ENROLLED: ...
=== END DEBUG ===
```

And also:

```
=== PERMISSION CHECK: ROLE ===
IS_SUPERUSER: ...
USER_ROLE: ...
=== END ROLE CHECK ===

=== PERMISSION CHECK: ENROLLMENT ===
...
=== END ENROLLMENT CHECK ===
```

---

## How to Read the Debug Logs

### Case A: You See "REQUEST USER: AnonymousUser"
**Problem:** JWT token is NOT being attached to the POST request.

**Cause:**
- Token not stored on mobile device (login failed, or token cleared)
- Axios/fetch interceptor not adding `Authorization: Bearer <token>` header
- Token fetching from storage is async but not awaited

**Fix:**
```typescript
// In mobile/services/client.ts - verify this looks correct:
this.client.interceptors.request.use(
  async (config) => {
    const token = await storage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // ...
);
```

**Debug Steps:**
```typescript
// Add this in your mobile app before check-in call:
const token = await storage.getAuthToken();
console.log('Token from storage:', token);
console.log('Full token string:', token ? `Bearer ${token}` : 'NO TOKEN');

// Make the check-in call and inspect the network request in DevTools
// Check the REQUEST HEADERS tab - should show:
// Authorization: Bearer eyJhbG...
```

---

### Case B: You See "REQUEST USER: [StudentName]" but IS_AUTHENTICATED: False
**Problem:** User object loaded but not properly marked as authenticated.

**This is unusual.** Likely a custom authentication backend issue.

**Fix:** Check that DRF JWT authentication is the FIRST in the list:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # ← Must be first
        # 'rest_framework.authentication.SessionAuthentication',      # ← Remove if present
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}
```

---

### Case C: You See "REQUEST USER: [StudentName]" and IS_AUTHENTICATED: True, but "IS ENROLLED: False"
**Problem:** User is logged in but NOT enrolled in the course.

**Root Causes:**
1. ✗ Student never enrolled in this course
2. ✗ Enrollment exists but `is_active=False`
3. ✗ Enrollment was deleted/deactivated
4. ✗ Student enrolled in WRONG course
5. ✗ Session's course is different from what they're enrolled in

**Diagnosis:**
The DEBUG logs will show:
```
ENROLLMENT EXISTS: False
ENROLLMENT COUNT: 0
Total enrollments: 3
  - Enrolled in: Math 101 (Active: True)
  - Enrolled in: Physics 102 (Active: False)
  - Enrolled in: Biology 103 (Active: True)
```

**This tells you:**
- Student IS enrolled in other courses
- But NOT enrolled in the course of this check-in session

**Solution:** Enroll the student in the course first, then retry check-in. If auto-enroll is supposed to happen, see **Case D** below.

---

### Case D: Auto-Enroll Logic Not Working
**Problem:** Check-in view is supposed to auto-enroll a student, but it's failing.

**Where to look:**
Your requirements mentioned "auto-enroll-then-check-in logic". Need to find this code:

```bash
# Search for these patterns in your code:
grep -r "CourseEnrollment.objects.create" backend/
grep -r "auto.*enroll" backend/
grep -r "enroll_student" backend/
```

**If auto-enroll exists, add logging:**

```python
def perform_attendance_check_in(request, session):
    # ... earlier debug code ...
    
    # BEFORE checking enrollment, try to auto-enroll
    if not CourseEnrollment.objects.filter(
        student=request.user,
        course=session.course,
        is_active=True,
    ).exists():
        try:
            logger.warning(f"ATTEMPTING AUTO-ENROLL: {request.user} → {session.course}")
            enroll = CourseEnrollment.objects.create(
                student=request.user,
                course=session.course,
                is_active=True,
            )
            logger.warning(f"AUTO-ENROLL SUCCESS: {enroll}")
        except Exception as e:
            logger.error(f"AUTO-ENROLL FAILED: {e}", exc_info=True)
            return Response({
                'success': False,
                'status': 'error',
                'error': f'Auto-enrollment failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # ... rest of the function ...
```

---

## Checklist: Common Issues to Verify

### Frontend/Mobile JWT Issues

- [ ] **Token is being stored**
  ```typescript
  // In mobile app after successful login:
  const token = await storage.getAuthToken();
  console.log('Token stored?', !!token);
  ```

- [ ] **Token is valid (not expired)**
  ```bash
  # Decode the JWT at jwt.io or use a CLI tool:
  echo "eyJhbGc..." | jq .  # Requires jq
  # Check the "exp" claim - should be in the future
  ```

- [ ] **Token is being sent with requests**
  - Open mobile app DevTools / Network tab
  - Make check-in request
  - Check REQUEST HEADERS
  - Should show: `Authorization: Bearer eyJhbGc...`

- [ ] **Axios/fetch interceptor is working**
  ```typescript
  // Add debug logging to interceptor:
  this.client.interceptors.request.use(
    async (config) => {
      const token = await storage.getAuthToken();
      console.log('[INTERCEPTOR] Attaching token:', !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  );
  ```

### Backend DRF Issues

- [ ] **JWT authentication is configured correctly**
  ```python
  # settings.py should have:
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': (
          'rest_framework_simplejwt.authentication.JWTAuthentication',
      ),
  }
  ```

- [ ] **CSRF is NOT interfering**
  - If you see CSRF token errors in logs, your issue is CSRF, not auth
  - Fix: Remove `SessionAuthentication` from DEFAULT_AUTHENTICATION_CLASSES
  - Or: Ensure CSRF middleware isn't enforcing on API endpoints

- [ ] **User model has required fields**
  ```python
  # Your User model should have:
  is_authenticated  # Property that returns True for authenticated users
  role  # Should be set to UserRole.STUDENT
  id  # Primary key
  ```

### Enrollment/Permission Issues

- [ ] **Course enrollment exists and is active**
  ```bash
  # Django shell:
  python manage.py shell
  ```
  ```python
  from institutions.models import CourseEnrollment, User
  
  student = User.objects.get(email='student@example.com')
  course_id = 123  # The course from the session
  
  enroll = CourseEnrollment.objects.filter(
      student=student,
      course_id=course_id,
      is_active=True
  ).first()
  
  print(f"Enrollment: {enroll}")
  print(f"Is active: {enroll.is_active if enroll else 'NO ENROLLMENT'}")
  ```

- [ ] **Auto-enroll is actually being called**
  - Add try/except with logging around CourseEnrollment.objects.create()
  - Check if it raises `IntegrityError` (duplicate) or other exception

---

## Production Debugging (Render)

### View Live Logs

```bash
# SSH into Render and tail logs
render logs <service-id> --tail

# Or use Render dashboard:
# 1. Go to your service
# 2. Click "Logs" tab
# 3. Filter by "CHECK-IN DEBUG"
```

### Check Database Directly

```bash
# If you have psql access:
psql <DATABASE_URL>

# Check student enrollment:
SELECT * FROM institutions_courseenrollment 
WHERE student_id = <student_id> 
AND course_id = <course_id>;

# Check all enrollments for a student:
SELECT course_id, is_active FROM institutions_courseenrollment 
WHERE student_id = <student_id>;
```

---

## If Still Stuck: Next Level Debugging

### Add More Detailed Logging

```python
def perform_attendance_check_in(request, session):
    # ... debug code ...
    
    # Log the exact request headers
    logger.warning("=== REQUEST HEADERS ===")
    for header, value in request.META.items():
        if 'HTTP_' in header or 'CONTENT' in header:
            logger.warning(f"{header}: {value[:100]}")  # Truncate long values
    logger.warning("=== END HEADERS ===")
```

### Check for Middleware Interference

```bash
# Check your middleware in settings.py
# Order matters! Should be:
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # ← MUST be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',    # ← CSRF after session
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### Test with cURL (to isolate frontend/mobile issues)

```bash
# Get a valid JWT token first (from login endpoint)
TOKEN="eyJhbGc..."

# Test the check-in endpoint
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "samples": [{"latitude": 6.5189, "longitude": 3.3653, "accuracy": 15}],
    "visitorId": "test-device",
    "motion_detected": true
  }' \
  https://presentlyapp.onrender.com/api/check-in/ABC123/

# Expected response:
# - If 401: Token invalid/missing/expired
# - If 403: User not enrolled/wrong role
# - If 400: Bad request data (missing location, etc)
# - If 200: Success!
```

---

## Expected Success Flow

```
Mobile App
    ↓
[Check Token in Storage]
    ↓
[POST /api/check-in/ABC123/]
    + Authorization: Bearer eyJhbGc...
    + Location data
    ↓
Backend: public_check_in_view()
    ↓
[Check: is_authenticated?]
    ↓ YES
execute perform_attendance_check_in(request, session)
    ↓
[Check: is_superuser OR role == STUDENT?]
    ↓ YES
[Check: is_enrolled?]
    ↓ YES (or auto-enroll succeeds)
[Run anti-spoofing checks]
    ↓
[Return 200 with success]
    ↓
Mobile: Show "Check-in Successful"
```

---

## Quick Fixes Summary

| Symptom | Most Likely Cause | Quick Fix |
|---------|-------------------|-----------|
| 403 with `AnonymousUser` | Token not sent | Check interceptor, re-login, clear storage |
| 403 with user but `IS_ENROLLED: False` | Student not enrolled | Enroll student manually or fix auto-enroll |
| 403 with auth problems | SessionAuthentication + CSRF | Remove SessionAuthentication from DRF config |
| 401 (not 403) | Token missing/expired | Check if token is being stored, re-login |
| 200 but "Low confidence score" | Anti-spoofing too strict | Check geofence, GPS accuracy, device fingerprint |

---

## Run These Commands After Implementing Debug Logging

```bash
# 1. Rebuild and redeploy to Render
git add backend/institutions/attendance_logic.py
git commit -m "Add Phase 1 & 2 debug logging for 403 check-in"
git push origin main

# 2. Wait for deploy to complete

# 3. View the logs
# Dashboard → Logs → Filter "CHECK-IN DEBUG"

# 4. Make a test check-in from mobile
# Watch the logs appear in real-time
```

---

## Still Need Help?

If debug logs show something unexpected:
1. Share the full log output with details
2. Mention the exact error/status from mobile
3. Confirm: Is this before or after the debug logging was added?
4. Check: Did you redeploy the code changes to Render?

---

**Last Updated:** March 25, 2026  
**Status:** Ready to Diagnose 403 Errors  
**Next Actions:** Follow Phase 1 steps, run from mobile, capture logs
