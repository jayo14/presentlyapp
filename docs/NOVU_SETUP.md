# Novu Integration Setup Guide

This guide explains how to set up Novu for all email and notification sending in Presently.

## Overview

Novu is now the centralized notification service for Presently. All emails (verification, password reset, security alerts, invitations) are sent exclusively through Novu.

## Prerequisites

- Novu account (https://novu.co)
- Novu API key (Secret Key)
- Email provider configured in Novu (SendGrid, Mailgun, etc.)
- NOVU_SECRET_KEY set in your .env file

## Environment Setup

### 1. Backend Configuration

Add your Novu Secret Key to `.env`:

```bash
# Novu Configuration
NOVU_SECRET_KEY=your_novu_secret_key_here
```

### 2. Frontend Configuration (Optional - for Notification Center)

If you want to use Novu's Notification Center UI:

```bash
VITE_NOVU_APPLICATION_IDENTIFIER=your_application_identifier
```

## Required Novu Templates

Create the following notification templates in your Novu dashboard:

### 1. **auth-email-verification**
**Trigger:** Email verification OTP during registration

**Variables:**
- `user_email`: User's email address
- `user_name`: User's full name
- `otp_code`: 6-digit OTP code
- `expires_in`: Expiration time in seconds (900 = 15 minutes)

**Template Example:**
```
Subject: Welcome to Presently - Verify Your Email

Hello {{user_name}},

Thank you for signing up for Presently!

Your email verification code is: {{otp_code}}

This code will expire in 15 minutes.

Best regards,
The Presently Team
```

---

### 2. **auth-otp-resend**
**Trigger:** OTP resend when user requests a new verification code

**Variables:**
- `user_email`: User's email address
- `user_name`: User's full name
- `otp_code`: 6-digit OTP code
- `expires_in`: Expiration time in seconds (900 = 15 minutes)

**Template Example:**
```
Subject: Your New Verification Code - Presently

Hello {{user_name}},

Here's your new email verification code:

{{otp_code}}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
The Presently Team
```

---

### 3. **auth-password-reset**
**Trigger:** Password reset link sent when user requests password recovery

**Variables:**
- `user_email`: User's email address
- `user_name`: User's full name
- `reset_link`: Password reset link with token
- `expires_in`: Expiration time in seconds (86400 = 24 hours)

**Template Example:**
```
Subject: Password Reset Request - Presently

Hello {{user_name}},

You requested to reset your password for your Presently account.

Click the link below to reset your password:
{{reset_link}}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
The Presently Team
```

---

### 4. **auth-password-reset-otp**
**Trigger:** OTP verification for password reset (if using OTP method)

**Variables:**
- `user_email`: User's email address
- `user_name`: User's full name
- `otp_code`: 6-digit OTP code
- `expires_in`: Expiration time in seconds (600 = 10 minutes)

**Template Example:**
```
Subject: Password Reset Verification - Presently

Hello {{user_name}},

To ensure your account remains safe, please enter the following verification code to proceed with your password change:

{{otp_code}}

This code will expire in 10 minutes.

If you did not request this, please contact our security department immediately.

Best regards,
The Presently Team
```

---

### 5. **security-new-device-alert**
**Trigger:** New device login detected (security alert)

**Variables:**
- `user_email`: User's email address
- `user_name`: User's full name
- `device_type`: Device category (e.g., "Mobile", "Desktop")
- `device_name`: Device model/name
- `browser`: Browser name and version
- `os`: Operating system and version
- `ip_address`: IP address of login
- `login_time`: Time of login

**Template Example:**
```
Subject: New Login Detected - Presently

Hello {{user_name}},

We detected a login to your Presently account from a new device.

Device Details:
- Device: {{device_name}} ({{device_type}})
- Browser: {{browser}}
- OS: {{os}}
- Location: {{ip_address}}
- Time: {{login_time}}

If this was not you, please secure your account immediately by resetting your password.

Best regards,
The Presently Team
```

---

### 6. **onboarding-user-invitation**
**Trigger:** User invitation email sent by institution admin

**Variables:**
- `user_email`: Email of invited user
- `user_name`: Name of invited user
- `inviter_name`: Name of person sending invitation
- `invitation_link`: Link to accept invitation
- `institution_name`: Name of institution

**Template Example:**
```
Subject: Invitation to join {{institution_name}} on Presently

Hello {{user_name}},

You have been invited to join {{institution_name}} on Presently by {{inviter_name}}.

Click the link below to accept your invitation and set up your account:
{{invitation_link}}

This invitation will expire in 7 days.

Best regards,
The {{institution_name}} Team
```

---

## Using the Novu Service

### In Your Views

```python
from utils.novu_service import NovuService

# Send email verification OTP
NovuService.send_email_verification_otp(
    user_id=str(user.id),
    user_email=user.email,
    user_name=user.full_name,
    otp_code=otp_code
)

# Send password reset email
NovuService.send_password_reset(
    user_id=str(user.id),
    user_email=user.email,
    user_name=user.full_name,
    reset_link=reset_link
)

# Send new device alert
NovuService.send_new_device_alert(
    user_id=str(user.id),
    user_email=user.email,
    user_name=user.full_name,
    device_info={
        'device_type': 'Mobile',
        'device_name': 'iPhone 13',
        'browser': 'Safari',
        'os': 'iOS 16'
    },
    ip_address='192.168.1.1'
)

# Send user invitation
NovuService.send_user_invitation(
    user_email='user@example.com',
    user_name='John Doe',
    inviter_name='Jane Smith',
    invitation_link='https://example.com/invite?token=xyz',
    institution_name='Tech University'
)
```

## Monitoring

### Check Notification Status

You can monitor sent notifications in your Novu dashboard:

1. Go to **Activity** section
2. Filter by template name
3. View delivery status (Sent, Failed, etc.)

### Error Logging

All Novu calls are logged to Django's logger at the `institutions.views` level:

```python
import logging
logger = logging.getLogger('institutions.views')  # or __name__
```

Errors will appear in:
- Console output during development
- Application logs in production

## Troubleshooting

### No notifications being sent

1. **Check API Key**: Verify `NOVU_SECRET_KEY` is correct
2. **Check Environment**: Run `python manage.py shell` and test:
   ```python
   from utils.novu_service import NovuService
   print(NovuService.is_available())
   ```
3. **Check Novu Dashboard**: Verify templates exist with correct trigger IDs

### Templates not found

1. Ensure template trigger IDs match exactly:
   - `auth-email-verification`
   - `auth-otp-resend`
   - `auth-password-reset`
   - `auth-password-reset-otp`
   - `security-new-device-alert`
   - `onboarding-user-invitation`

2. Verify email provider is active in Novu workspace

### Emails not being delivered

1. Check email provider configuration in Novu
2. Verify subscriber email addresses are correct
3. Check spam folder
4. Review email provider logs (SendGrid, Mailgun, etc.)

## Advanced Usage

### Bulk Notifications

Send notifications to multiple users:

```python
from utils.novu_service import NovuService

recipients = [
    {"subscriberId": "user1", "email": "user1@example.com"},
    {"subscriberId": "user2", "email": "user2@example.com"},
]

payload = {
    "message": "Important announcement",
    "details": "All users should update their passwords"
}

NovuService.send_bulk_notification(
    notification_type="general-announcement",
    recipients=recipients,
    payload=payload
)
```

### Custom Notifications

To create custom notification types:

1. Create new template in Novu dashboard
2. Add method to `NovuService` class
3. Use in views

Example:

```python
@staticmethod
def send_course_update(user_id: str, user_email: str, course_name: str, update_content: str) -> bool:
    """Send course update notification."""
    if not NOVU_AVAILABLE:
        return False
    
    try:
        novu_client.trigger(
            name="course-update",
            recipients=[{"subscriberId": str(user_id), "email": user_email}],
            payload={
                "course_name": course_name,
                "update_content": update_content
            }
        )
        logger.info(f"Course update notification sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send course update: {str(e)}", exc_info=True)
        return False
```

## Migration Notes

All previous email templates have been removed from:
- `templates/emails/welcome_otp.html`
- `templates/emails/password_reset.html`
- `templates/emails/new_device_alert.html`
- `templates/emails/user_invitation.html`

These are no longer used. Design your email templates directly in Novu for consistency and easier management.

## Support

For Novu support, visit: https://docs.novu.co
