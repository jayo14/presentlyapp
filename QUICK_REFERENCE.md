# Quick Reference - Novu Integration & API Configuration

## What Was Completed ✅

### 1. Novu Email Integration
- ✅ Created `backend/utils/novu_service.py` - Centralized notification service
- ✅ Updated `backend/institutions/views.py` - All 6 email endpoints use Novu
- ✅ Removed Django email code - Clean, maintainable codebase
- ✅ Proper error handling and logging

### 2. Frontend API Configuration  
- ✅ Verified `VITE_API_URL` environment variable usage
- ✅ Confirmed NO relative paths (all absolute URLs)
- ✅ Service worker properly receives API URL via query parameter
- ✅ Graceful fallback to localhost for development

### 3. Documentation
- ✅ `docs/NOVU_SETUP.md` - Complete setup guide with 6 templates
- ✅ `docs/API_CONFIGURATION.md` - API routing and environment setup
- ✅ `NOVU_INTEGRATION_SUMMARY.md` - Implementation details
- ✅ `IMPLEMENTATION_COMPLETE.md` - Final checklist

## Quick Start

### 1. Backend Setup (1 min)
```bash
# .env configuration
NOVU_SECRET_KEY=your_novu_api_key_here
```

### 2. Create Novu Templates (5 min each)
Go to https://dashboard.novu.co and create 6 email templates:
1. `auth-email-verification` 
2. `auth-otp-resend`
3. `auth-password-reset`
4. `auth-password-reset-otp`
5. `security-new-device-alert`
6. `onboarding-user-invitation`

See `docs/NOVU_SETUP.md` for template content examples.

### 3. Frontend Setup (1 min)
```bash
# .env.local (development)
VITE_API_URL=http://localhost:8000

# .env.production (production)
VITE_API_URL=https://your-api-domain.com
```

### 4. Test (5 min)
```bash
# Register a new user → Should trigger email-verification email
# Try password reset → Should trigger password-reset email
# Login from new device → Should trigger new-device-alert email
```

## Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Email Verification OTP | ✅ Ready | Sends on registration |
| OTP Resend | ✅ Ready | Resend when code expires |
| Password Reset Email | ✅ Ready | Sends reset link |
| Password Reset OTP | ✅ Ready | Optional 2nd factor |
| Device Security Alert | ✅ Ready | New device login alert |
| User Invitation | ✅ Ready | Admin invites users |
| Bulk Notifications | ✅ Ready | Send to multiple users |
| API Configuration | ✅ Done | Env-based, no relative paths |

## API Configuration Status

✅ **Frontend client:** Uses `VITE_API_URL` from environment
✅ **Service Worker:** Receives API URL via query parameter  
✅ **No relative paths:** All URLs absolute (http/https)
✅ **Validation:** URLs without protocol rejected with fallback
✅ **Flexibility:** Can switch backends by changing env var

## File Locations

**New Service:**
- `backend/utils/novu_service.py` - Main Novu integration

**Updated Files:**
- `backend/institutions/views.py` - All views use NovuService
- `backend/utils/__init__.py` - Package marker

**Documentation:**
- `docs/NOVU_SETUP.md` - Complete setup guide
- `docs/API_CONFIGURATION.md` - API configuration detail
- `NOVU_INTEGRATION_SUMMARY.md` - Implementation summary
- `IMPLEMENTATION_COMPLETE.md` - Full checklist

## Code Example

```python
# Before (old approach)
from django.core.mail import EmailMultiAlternatives
msg = EmailMultiAlternatives(subject, plain, from_email, [to_email])
msg.attach_alternative(html_message, "text/html")
msg.send()

# After (new approach)
from utils.novu_service import NovuService
NovuService.send_email_verification_otp(
    user_id=str(user.id),
    user_email=user.email,
    user_name=user.full_name,
    otp_code=otp_code
)
```

## Troubleshooting

**Issue: "NOVU_SECRET_KEY not set"**
→ Add `NOVU_SECRET_KEY=your_key` to `.env`

**Issue: Templates not found in Novu**
→ Create missing templates in Novu dashboard with exact trigger IDs

**Issue: API requests failing**
→ Check `VITE_API_URL` is absolute URL with http/https

**Issue: Service Worker not syncing correctly**
→ Clear cache & service workers, hard refresh browser

## Environment Variables

```
Backend (.env):
- NOVU_SECRET_KEY (required for notifications)
- FRONTEND_URL (for password reset links)

Frontend (.env.local / .env.production):
- VITE_API_URL (required - absolute URL like http://localhost:8000)

Frontend (optional):
- VITE_NOVU_APPLICATION_IDENTIFIER (for notification center UI)
```

## Production Checklist

- [ ] Set `NOVU_SECRET_KEY` in production environment
- [ ] Create all 6 Novu templates
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Test email delivery in staging
- [ ] Configure email provider in Novu (SendGrid, Mailgun, etc.)
- [ ] Set `FRONTEND_URL` for reset/invite links
- [ ] Monitor Novu dashboard for delivery status
- [ ] Set up error logging/alerts

## Support

📖 **Full Documentation:**
- Novu Setup: `docs/NOVU_SETUP.md`
- API Configuration: `docs/API_CONFIGURATION.md`

🔗 **External Resources:**
- Novu Docs: https://docs.novu.co
- Novu Dashboard: https://dashboard.novu.co

💬 **Questions?**
- Check documentation files first
- Review code comments in `backend/utils/novu_service.py`

---

**Status:** ✅ Implementation Complete
**Validation:** ✅ Python syntax verified
**Ready for:** Novu template creation & environment configuration
**Date:** March 17, 2026
