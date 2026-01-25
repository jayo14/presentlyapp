# Progressive Web App (PWA) Implementation Guide

This document provides comprehensive information about the PWA features implemented in Presently, including setup, testing, and best practices.

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Service Worker](#service-worker)
6. [Push Notifications](#push-notifications)
7. [Offline Support](#offline-support)
8. [Background Sync](#background-sync)
9. [Testing](#testing)
10. [Browser Support](#browser-support)
11. [Troubleshooting](#troubleshooting)

## Overview

Presently is now a fully-functional Progressive Web App (PWA) that provides:
- **Installability**: Can be installed on desktop and mobile devices
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time alerts via Firebase Cloud Messaging
- **Background Sync**: Syncs data when connection is restored
- **App-like Experience**: Standalone mode with no browser UI
- **Fast Performance**: Optimized loading and caching

## Features

### ✅ Implemented Features

#### 1. Web App Manifest
- **Location**: `/frontend/public/manifest.json`
- **Compliant with**: PWABuilder and MDN standards
- **Includes**:
  - App name and short name
  - Start URL and scope
  - Display mode: standalone
  - Theme and background colors
  - Multiple icon sizes (192x192, 512x512)
  - Maskable icons for adaptive icons
  - Screenshots for app store listing
  - App shortcuts (Dashboard, Check In)
  - Categories and language settings

#### 2. Service Worker
- **Location**: `/frontend/public/service-worker.js`
- **Firebase Service Worker**: `/frontend/public/firebase-messaging-sw.js`
- **Features**:
  - Smart caching strategies
  - Offline fallback page
  - Background message handling
  - Cache versioning and cleanup
  - SKIP_WAITING support for updates

#### 3. Push Notifications (FCM)
- **Configuration**: `/frontend/services/firebase/config.ts`
- **Utilities**: `/frontend/services/firebase/notifications.ts`
- **React Hook**: `/frontend/hooks/usePushNotifications.ts`
- **UI Component**: `/frontend/components/PushNotifications/PushNotificationSettings.tsx`
- **Features**:
  - Permission request handling
  - Foreground and background notifications
  - Notification click actions
  - Token management
  - Server integration ready

#### 4. Installation Prompt
- **Location**: `/frontend/components/Layout.tsx`
- **Features**:
  - beforeinstallprompt event handling
  - Install button in sidebar
  - Smart detection of installed state
  - User choice tracking

#### 5. Update Notifier
- **Location**: `/frontend/components/ServiceWorkerUpdateNotifier.tsx`
- **Features**:
  - Detects new app versions
  - User-friendly update prompt
  - Automatic reload on update
  - Periodic update checks

## Architecture

### Service Worker Strategy

The application uses different caching strategies for different resource types:

#### Cache First (Static Assets)
Used for: CSS, JS, images, fonts
- Returns cached version immediately
- Updates cache in background
- Best for static assets that don't change often

```javascript
// Pseudo-code
if (cached) {
  return cached;
  updateInBackground();
} else {
  fetchAndCache();
}
```

#### Network First (API Requests)
Used for: API calls, dynamic data
- Tries network first
- Falls back to cache if offline
- Best for frequently changing data

```javascript
// Pseudo-code
try {
  response = fetch();
  cache(response);
  return response;
} catch {
  return cached || offlineResponse;
}
```

#### Stale-While-Revalidate (Other Resources)
Used for: General resources
- Returns cached version immediately
- Fetches fresh version in background
- Updates cache for next time

```javascript
// Pseudo-code
return cached;
fetchAndCacheInBackground();
```

### Firebase Cloud Messaging Flow

```
User → Browser → App → FCM Token
                    ↓
                  Backend
                    ↓
              Store Token
                    ↓
        Send Notification → FCM → Browser → App
                                      ↓
                                  User Sees
```

## Installation

### Prerequisites

```bash
# Install dependencies
cd frontend
npm install

# Firebase dependency (already installed)
npm install firebase
```

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Configure Firebase (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)):
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
# ... other Firebase variables
```

3. Update Firebase service worker:
- Edit `public/firebase-messaging-sw.js`
- Replace placeholder config with your Firebase config

### Build and Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Service Worker

### Registration

Service worker is registered in `/frontend/index.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(error => {
        console.warn('SW registration failed: ', error);
      });
  });
}
```

### Updating Service Worker

When you make changes to the service worker:

1. Update the `CACHE_NAME` version in `service-worker.js`:
```javascript
const CACHE_NAME = 'presently-v4'; // Increment version
```

2. Build and deploy the updated service worker

3. Users will see an update prompt automatically

### Manual Service Worker Update

In browser console:
```javascript
// Check for updates
navigator.serviceWorker.getRegistration().then(reg => reg.update());

// Unregister (for testing)
navigator.serviceWorker.getRegistration().then(reg => reg.unregister());
```

## Push Notifications

### Setup Guide

Complete setup instructions: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Using the Hook

```typescript
import { usePushNotifications } from '../hooks/usePushNotifications';

function MyComponent() {
  const {
    permission,
    isSupported,
    token,
    requestPermission,
    subscribe,
  } = usePushNotifications((payload) => {
    console.log('Notification received:', payload);
  });

  const handleEnable = async () => {
    await requestPermission();
    await subscribe();
  };

  return (
    <button onClick={handleEnable}>
      Enable Notifications
    </button>
  );
}
```

### Sending Notifications

#### From Backend (Python/Django)

```python
def send_notification(fcm_token, title, body):
    import requests
    
    url = 'https://fcm.googleapis.com/fcm/send'
    headers = {
        'Authorization': f'key={FCM_SERVER_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'to': fcm_token,
        'notification': {
            'title': title,
            'body': body,
            'icon': '/icon-192.png',
        },
        'data': {
            'url': '/dashboard',
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()
```

#### From Backend (Node.js)

```javascript
const admin = require('firebase-admin');

async function sendNotification(fcmToken, title, body) {
  const message = {
    notification: { title, body },
    token: fcmToken,
  };
  
  return await admin.messaging().send(message);
}
```

## Offline Support

### Offline Page

When completely offline and no cached content is available, users see:
- **Location**: `/frontend/public/offline.html`
- **Features**:
  - Clean, branded offline page
  - Connection status indicator
  - Auto-refresh when back online
  - List of available offline features

### Cached Resources

The service worker automatically caches:
- App shell (HTML, CSS, JS)
- Icons and images
- Fonts
- Previously visited pages
- API responses (when configured)

### Testing Offline Mode

#### Method 1: Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" in throttling dropdown
4. Reload page

#### Method 2: Service Worker Offline
1. Open DevTools (F12)
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Navigate the app

## Background Sync

### Overview

Background Sync allows the app to sync data when the connection is restored.

### Current Implementation

Located in `service-worker.js`:

```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceData());
  }
});
```

### Registering a Sync

```javascript
// When user submits data while offline
async function submitAttendance(data) {
  try {
    await fetch('/api/attendance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Queue for background sync
    await navigator.serviceWorker.ready;
    await registration.sync.register('sync-attendance');
  }
}
```

### Browser Support

- Chrome: ✅ Full support
- Edge: ✅ Full support
- Firefox: ❌ Not supported
- Safari: ❌ Not supported

For unsupported browsers, implement manual retry logic.

## Testing

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select categories:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
4. Click "Analyze page load"

**Expected Scores:**
- PWA: 100 (or close)
- Performance: 90+
- Best Practices: 95+

### PWABuilder Validation

1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your site URL
3. Click "Start"
4. Review PWA score and recommendations

### Manual Testing Checklist

#### Installation
- [ ] Install prompt appears on supported browsers
- [ ] App installs successfully
- [ ] App opens in standalone mode
- [ ] App icon appears on home screen/desktop

#### Offline Support
- [ ] App works when offline
- [ ] Cached pages load correctly
- [ ] Offline page appears when no cache
- [ ] Auto-reconnect when back online

#### Push Notifications
- [ ] Permission request appears
- [ ] Notifications work when app is open
- [ ] Notifications work when app is closed
- [ ] Notification click opens correct page
- [ ] Token is sent to backend

#### Service Worker Updates
- [ ] Update prompt appears when new version available
- [ ] App updates when user clicks "Update"
- [ ] Old cache is cleaned up

#### Performance
- [ ] Initial load < 3 seconds
- [ ] Subsequent loads < 1 second
- [ ] Smooth animations (60 FPS)
- [ ] No layout shifts

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge | Opera |
|---------|--------|---------|--------|------|-------|
| Service Workers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅* | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ | ✅ |
| Installation | ✅ | ✅ | ✅** | ✅ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Safari: macOS 13+ and iOS 16.4+ only
\*\* Safari: Installation via share menu

## Troubleshooting

### Service Worker Not Registering

**Problem**: Console shows "SW registration failed"

**Solutions**:
1. Check if site is served over HTTPS (required in production)
2. Verify service worker file is at root: `/service-worker.js`
3. Check for syntax errors in service worker
4. Clear browser cache and reload
5. Check browser console for specific errors

### Push Notifications Not Working

**Problem**: Notifications don't appear

**Solutions**:
1. Verify Firebase is configured (check `.env.local`)
2. Check notification permission status
3. Ensure VAPID key is correct
4. Verify service worker is active
5. Check FCM token is being sent to backend
6. Test with Firebase Console test message
7. Check browser notification settings

### Offline Page Not Showing

**Problem**: White screen when offline

**Solutions**:
1. Verify `offline.html` is in cache list
2. Check service worker is active
3. Clear cache and reload while online
4. Check browser console for errors

### App Not Installing

**Problem**: No install prompt appears

**Solutions**:
1. Check manifest.json is valid (use validator)
2. Ensure service worker is registered
3. Verify all required icons exist
4. Check that app isn't already installed
5. Try in incognito/private mode
6. Some browsers require HTTPS

### Update Not Appearing

**Problem**: New version doesn't show update prompt

**Solutions**:
1. Increment `CACHE_NAME` version
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Unregister service worker and re-register
4. Clear application cache in DevTools
5. Check update interval (default: 60 minutes)

## Best Practices

### 1. Keep Service Worker Simple
- Avoid complex logic in fetch handlers
- Cache strategically, not everything
- Set appropriate cache sizes

### 2. Test Thoroughly
- Test on real devices
- Test on slow networks (3G simulation)
- Test offline scenarios
- Test on different browsers

### 3. Monitor Performance
- Use Lighthouse regularly
- Monitor bundle sizes
- Check Core Web Vitals
- Use performance profiling

### 4. Handle Errors Gracefully
- Provide meaningful error messages
- Implement retry logic
- Show offline indicators
- Cache error pages

### 5. Update Regularly
- Keep dependencies updated
- Monitor for security issues
- Test updates before deploying
- Communicate changes to users

## Performance Optimization

### Bundle Size
Current bundle sizes (gzipped):
- Main bundle: ~17KB
- React vendor: ~87KB
- Map vendor: ~203KB (lazy loaded)
- Total initial: ~120KB

### Caching Strategy
- Static assets: 1 year cache
- Service worker: No cache
- Manifest: 24 hour cache
- API responses: Network first

### Loading Optimization
- Critical CSS inlined
- Fonts preloaded
- Code splitting enabled
- Lazy loading for routes

## Resources

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWABuilder Documentation](https://docs.pwabuilder.com/)
- [Google Workbox](https://developers.google.com/web/tools/workbox)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)

## Support

For issues or questions:
1. Check this documentation
2. Review [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
3. Check browser console for errors
4. Review service worker logs
5. Create an issue in the repository

---

**Last Updated**: January 2026
**PWA Version**: v3
**Firebase SDK Version**: 10.7.1
