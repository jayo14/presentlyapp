# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for web push notifications in Presently.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Create Firebase Project](#create-firebase-project)
3. [Enable Cloud Messaging](#enable-cloud-messaging)
4. [Get Configuration Values](#get-configuration-values)
5. [Generate VAPID Keys](#generate-vapid-keys)
6. [Configure the Application](#configure-the-application)
7. [Update Service Worker](#update-service-worker)
8. [Backend Integration](#backend-integration)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Google account
- Access to Firebase Console
- Node.js and npm installed
- Presently application running locally or deployed

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter a project name (e.g., "Presently")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Enable Cloud Messaging

1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Navigate to the "Cloud Messaging" tab
4. Note: Cloud Messaging is enabled by default for web apps

## Get Configuration Values

### Step 1: Register Web App

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "Presently Web")
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"

### Step 2: Copy Configuration

You'll see a code snippet with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

## Generate VAPID Keys

VAPID keys are required for web push notifications.

### Step 1: Generate Keys

1. In Firebase Console, go to Project Settings
2. Navigate to the "Cloud Messaging" tab
3. Scroll down to "Web Push certificates"
4. Click "Generate key pair"
5. Copy the generated key (starts with `B...`)

### Step 2: Save VAPID Key

This is your `VITE_FIREBASE_VAPID_KEY`. Save it securely.

## Configure the Application

### Step 1: Create Environment File

In the `frontend` directory, create a `.env.local` file (or copy from `.env.example`):

```bash
cd frontend
cp .env.example .env.local
```

### Step 2: Add Firebase Configuration

Edit `.env.local` and add your Firebase configuration values:

```bash
# Firebase Cloud Messaging Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Cloud Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=BCfy...
```

**Important:** 
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file
- For production, set these values in your hosting platform's environment variables (e.g., Vercel, Netlify)

## Update Service Worker

### Step 1: Update Firebase Configuration in Service Worker

Edit `frontend/public/firebase-messaging-sw.js` and replace the placeholder configuration:

```javascript
// Replace these values with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Note:** You don't need to include the VAPID key in the service worker. It's safe to expose these Firebase config values as they are public identifiers.

## Backend Integration

### Python/Django Example

Create an endpoint to send push notifications:

```python
import json
import requests
from django.conf import settings

def send_push_notification(fcm_token, title, body, data=None):
    """
    Send push notification via FCM
    """
    url = 'https://fcm.googleapis.com/fcm/send'
    
    headers = {
        'Authorization': f'key={settings.FCM_SERVER_KEY}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'to': fcm_token,
        'notification': {
            'title': title,
            'body': body,
            'icon': '/icon-192.png',
            'badge': '/icon-192.png',
        },
        'data': data or {},
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()
```

### Node.js/Express Example

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send notification
async function sendPushNotification(fcmToken, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### Get Server Key

1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Find "Server key" under "Cloud Messaging API (Legacy)"
3. Copy this key for backend use
4. **Keep this key secret!** Never expose it in frontend code

### Store FCM Tokens

Create a backend endpoint to receive and store FCM tokens:

```python
# Django REST Framework example
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_device(request):
    """
    Store FCM token for a user's device
    """
    fcm_token = request.data.get('fcm_token')
    user = request.user
    
    # Store token in database
    Device.objects.update_or_create(
        user=user,
        fcm_token=fcm_token,
        defaults={
            'device_type': request.data.get('device_type', 'web'),
            'browser': request.data.get('browser', ''),
            'is_active': True,
        }
    )
    
    return Response({'status': 'success'})
```

## Testing

### Test Notification Permission

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser
3. Navigate to Settings > Notifications
4. Click "Enable Push Notifications"
5. Grant permission when prompted

### Send Test Notification from Firebase Console

1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter a notification title and text
4. Click "Send test message"
5. Paste your FCM token (shown in app settings when debugging)
6. Click the (+) button and then "Test"

### Test with cURL

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "FCM_TOKEN_HERE",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test from cURL",
      "icon": "/icon-192.png"
    },
    "data": {
      "url": "/dashboard"
    }
  }'
```

## Troubleshooting

### Notifications Not Working

**Check Browser Support:**
- Push notifications are supported in Chrome, Firefox, Edge, Opera
- Safari supports push notifications on macOS 13+ and iOS 16.4+
- Check if browser is up to date

**Check Permission Status:**
- Browser Settings > Privacy & Security > Site Settings > Notifications
- Ensure notifications are allowed for your site

**Check Console for Errors:**
- Open browser DevTools (F12)
- Check Console tab for error messages
- Common errors:
  - "Firebase not configured" - Check environment variables
  - "Permission denied" - User blocked notifications
  - "VAPID key not found" - Check VAPID key configuration

**Check Service Worker:**
- Open DevTools > Application > Service Workers
- Verify service worker is registered and active
- Check for service worker errors

### Firebase Configuration Issues

**"Firebase app not initialized":**
- Verify all Firebase environment variables are set
- Check that values don't have extra quotes or spaces
- Restart development server after changing .env files

**"Messaging not supported":**
- Check if site is served over HTTPS (required for push notifications)
- Localhost is allowed for development

### Token Not Saved

**Check Network Tab:**
- Open DevTools > Network
- Look for request to `/api/notifications/register-device/`
- Check if request succeeds (status 200)
- Verify request payload includes FCM token

**Backend Issues:**
- Check backend logs for errors
- Verify endpoint exists and is accessible
- Check authentication (if endpoint requires auth)

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ✅ (macOS 13+) | ✅ (iOS 16.4+) | Limited support |
| Edge | ✅ | ✅ | Full support |
| Opera | ✅ | ✅ | Full support |

## Best Practices

1. **Request Permission Contextually:**
   - Don't request permission immediately on page load
   - Explain why notifications are useful before requesting
   - Provide clear value proposition

2. **Handle Denial Gracefully:**
   - Don't repeatedly prompt if user denies
   - Provide instructions on how to enable if blocked
   - Offer alternative notification methods

3. **Keep Tokens Updated:**
   - Monitor token refresh events
   - Update backend when token changes
   - Remove expired/invalid tokens

4. **Test Thoroughly:**
   - Test on multiple browsers and devices
   - Test foreground and background notifications
   - Test notification click actions

5. **Security:**
   - Keep server key secure on backend only
   - Use HTTPS in production (required for push notifications)
   - Validate notification payloads on backend

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [PWABuilder Documentation](https://docs.pwabuilder.com/)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify Firebase configuration
4. Check Firebase Console for quota limits
5. Review Firebase Cloud Messaging documentation

For additional help, contact your system administrator or create an issue in the project repository.
