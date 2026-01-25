# PWA Testing & Validation Checklist

This document provides a comprehensive checklist for testing and validating the Progressive Web App features in Presently.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Testing Setup](#local-testing-setup)
3. [Lighthouse PWA Audit](#lighthouse-pwa-audit)
4. [PWABuilder Validation](#pwabuilder-validation)
5. [Manual Testing](#manual-testing)
6. [Browser Compatibility](#browser-compatibility)
7. [Production Deployment](#production-deployment)

## Prerequisites

### Required Tools
- Modern web browser (Chrome, Firefox, or Edge)
- Browser DevTools
- Internet connection (for Firebase setup)
- HTTPS connection (required for PWA features in production)

### Optional Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- Mobile device for mobile testing
- [ngrok](https://ngrok.com/) or similar for HTTPS testing locally

## Local Testing Setup

### 1. Environment Configuration

Create `.env.local` file:

```bash
cd frontend
cp .env.example .env.local
```

**Minimum configuration for PWA testing (without push notifications):**
```bash
VITE_API_URL=http://localhost:8000
```

**Full configuration (with push notifications):**
```bash
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_VAPID_KEY=your_vapid_key
# ... other Firebase vars
```

### 2. Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

### 3. Production Build Testing

For accurate PWA testing, test with production build:

```bash
# Build
npm run build

# Preview (serves production build)
npm run preview
```

Open: http://localhost:4173

**Note**: Service workers behave differently in development vs production.

## Lighthouse PWA Audit

### Running Lighthouse

#### Method 1: Chrome DevTools
1. Open DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select categories:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
4. Select "Desktop" or "Mobile"
5. Click "Analyze page load"

#### Method 2: Command Line
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:4173
```

### Expected Scores

| Category | Target Score | Notes |
|----------|--------------|-------|
| PWA | 90-100 | Should be near perfect |
| Performance | 85+ | Depends on content |
| Best Practices | 90+ | Should be high |
| Accessibility | 85+ | Depends on content |
| SEO | 90+ | Should be high |

### Key PWA Checks

Lighthouse verifies:

- ✅ **Registers a service worker**
- ✅ **Responds with 200 when offline**
- ✅ **Contains a valid manifest.json**
- ✅ **Manifest has a name or short_name**
- ✅ **Manifest has icons at least 192px and 512px**
- ✅ **Manifest start_url is present**
- ✅ **Manifest display is standalone or fullscreen**
- ✅ **Viewport meta tag is present**
- ✅ **Content is sized correctly for viewport**
- ✅ **Has a themed omnibox**
- ✅ **Provides an installable web app**

### Troubleshooting Lighthouse Issues

**"Page does not respond with 200 when offline"**
- Ensure service worker is registered and active
- Check cache strategy in service-worker.js
- Test offline mode manually first

**"Manifest doesn't have a maskable icon"**
- Check manifest.json for maskable icons
- Verify icon files exist in public directory

**"Does not provide a valid apple-touch-icon"**
- Check index.html for apple-touch-icon link
- Verify icon file exists

## PWABuilder Validation

### Online Validation

1. Go to [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed site URL
3. Click "Start"
4. Review the PWA score and recommendations

### Expected Results

**Manifest Score**: Should be near perfect (40/40 points)
- Valid manifest structure
- All required fields present
- Icons of correct sizes
- Proper display mode

**Service Worker Score**: Should be excellent (30/30 points)
- Service worker registered
- Caching implemented
- Offline support working

**Security Score**: Should be perfect (20/20 points)
- HTTPS enabled
- No security warnings

**Overall PWA Score**: 90+ / 100

### PWABuilder Checklist

- [ ] Web manifest is valid
- [ ] Service worker is registered
- [ ] App is installable
- [ ] App works offline
- [ ] HTTPS is enabled
- [ ] Icons are provided
- [ ] Viewport meta tag is present
- [ ] Theme color is set

## Manual Testing

### Installation Testing

#### Desktop (Chrome/Edge)
1. Open app in browser
2. Look for install icon in address bar
3. Click install icon
4. App should install and open in window
5. Verify app appears in Start Menu/Applications
6. Test launching from installed location

#### Desktop (Firefox)
1. Click menu (≡)
2. Select "Install [App Name]"
3. Follow installation prompts

#### Mobile (Android)
1. Open in Chrome/Edge
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home screen"
4. App icon should appear on home screen
5. Launch and verify standalone mode

#### Mobile (iOS Safari)
1. Tap share button
2. Tap "Add to Home Screen"
3. App icon appears on home screen
4. Launch and verify

**Expected Behavior**:
- ✅ App opens in standalone window (no browser UI)
- ✅ App icon shows correctly
- ✅ Theme color applied to window
- ✅ App can be uninstalled

### Service Worker Testing

#### 1. Verify Registration

Open DevTools > Application > Service Workers

**Check**:
- [ ] Service worker is registered
- [ ] Status shows "activated and running"
- [ ] Scope is "/"
- [ ] Update on reload is available

#### 2. Test Caching

Open DevTools > Application > Cache Storage

**Check**:
- [ ] Cache named "presently-v3" exists
- [ ] Cache contains expected files:
  - index.html
  - manifest.json
  - Icons (192px, 512px)
  - offline.html
  - CSS/JS bundles

#### 3. Test Offline Mode

**Method A: DevTools Network Tab**
1. Open DevTools > Network
2. Select "Offline" from throttling dropdown
3. Reload page

**Expected**: App loads from cache

**Method B: Service Worker Offline**
1. Open DevTools > Application > Service Workers
2. Check "Offline" checkbox
3. Navigate the app

**Expected**: App remains functional

**Test Cases**:
- [ ] Home page loads when offline
- [ ] Previously visited pages load
- [ ] Images from cache display
- [ ] Navigation works
- [ ] Offline page shows for uncached pages

#### 4. Test Update Mechanism

1. Modify a source file (e.g., add comment)
2. Build the app
3. Without closing the app, deploy new version
4. Wait ~60 seconds or manually check for updates
5. Update notification should appear
6. Click "Update Now"
7. App should reload with new version

**Expected**:
- [ ] Update notification appears
- [ ] Update completes successfully
- [ ] Old cache is removed
- [ ] New cache is created

### Push Notifications Testing

**Prerequisites**: Firebase configured

#### 1. Permission Request

Navigate to Settings > Notifications

**Check**:
- [ ] Browser support detected correctly
- [ ] Firebase configuration status shown
- [ ] "Enable Push Notifications" button visible
- [ ] Clicking button triggers permission prompt

#### 2. Grant Permission

Click "Enable Push Notifications"

**Expected**:
- [ ] Browser shows permission prompt
- [ ] After granting, status updates to "enabled"
- [ ] FCM token is generated
- [ ] Token is sent to backend (check network tab)

#### 3. Test Foreground Notifications

With app open and focused:

**Send test notification via Firebase Console**:
1. Firebase Console > Cloud Messaging
2. Send test message
3. Paste FCM token (from app settings debug view)
4. Send

**Expected**:
- [ ] Notification appears in browser
- [ ] Notification shows correct title/body
- [ ] Notification icon displays
- [ ] Clicking notification opens correct page

#### 4. Test Background Notifications

With app closed or in background:

**Send test notification**

**Expected**:
- [ ] Notification appears
- [ ] Clicking opens app
- [ ] Clicking navigates to correct page

#### 5. Test Notification Click Actions

**Expected**:
- [ ] Clicking notification focuses existing window if open
- [ ] Clicking notification opens new window if closed
- [ ] URL from notification data is respected

### Offline Support Testing

#### Scenario 1: First Visit While Online
1. Clear browser data
2. Visit app
3. Wait for page to load
4. Open DevTools > Application > Cache Storage
5. Verify cache is populated

**Expected**:
- [ ] Service worker registers
- [ ] Assets cached
- [ ] App shell cached

#### Scenario 2: Subsequent Visit While Offline
1. Visit app online
2. Navigate to multiple pages
3. Close browser
4. Disconnect from internet
5. Reopen browser and visit app

**Expected**:
- [ ] App loads from cache
- [ ] Previously visited pages work
- [ ] Uncached pages show offline page

#### Scenario 3: Navigation While Offline
1. Go offline (DevTools Network > Offline)
2. Navigate to different sections

**Expected**:
- [ ] Cached pages load instantly
- [ ] Navigation is smooth
- [ ] No errors in console

#### Scenario 4: API Requests While Offline
1. Go offline
2. Trigger an API request (e.g., load attendance)

**Expected**:
- [ ] Cached API responses are used if available
- [ ] Graceful error message if not cached
- [ ] No app crashes

### Background Sync Testing

**Note**: Background Sync is Chrome/Edge only

#### Setup
1. Open DevTools > Application > Background Sync
2. Check "Force sync"

#### Test Scenario
1. Go offline
2. Perform an action that should sync (e.g., mark attendance)
3. Go back online
4. Observe DevTools console

**Expected**:
- [ ] Sync event fires when online
- [ ] Queued data is sent to backend
- [ ] Success notification appears
- [ ] Data is removed from queue

### Performance Testing

#### Load Time Testing

**First Load (Cold Cache)**:
1. Clear browser cache
2. Open DevTools > Network
3. Reload page
4. Check DOMContentLoaded and Load times

**Target**: < 3 seconds on 3G

**Subsequent Load (Warm Cache)**:
1. With cache populated
2. Reload page
3. Check times

**Target**: < 1 second

#### Web Vitals

Monitor in DevTools > Performance Insights:

**Metrics**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 600ms

### Responsive Design Testing

Test on different viewports:

**Desktop**:
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (Laptop)
- [ ] 1280x720 (HD)

**Tablet**:
- [ ] 768x1024 (iPad)
- [ ] 820x1180 (iPad Air)

**Mobile**:
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12/13)
- [ ] 412x915 (Pixel 5)

**Check**:
- [ ] Layout adapts correctly
- [ ] No horizontal scrolling
- [ ] Touch targets are adequate (44x44px minimum)
- [ ] Text is readable without zooming

## Browser Compatibility

### Desktop Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Installation | ✅ Test | ✅ Test | ✅ Test | ✅ Test |
| Service Worker | ✅ Test | ✅ Test | ✅ Test | ✅ Test |
| Push Notifications | ✅ Test | ✅ Test | ⚠️ Test* | ✅ Test |
| Background Sync | ✅ Test | ❌ Skip | ❌ Skip | ✅ Test |
| Offline Support | ✅ Test | ✅ Test | ✅ Test | ✅ Test |

\* Safari 13+ on macOS only

### Mobile Testing Matrix

| Feature | Chrome (Android) | Firefox (Android) | Safari (iOS) |
|---------|------------------|-------------------|--------------|
| Installation | ✅ Test | ✅ Test | ✅ Test |
| Service Worker | ✅ Test | ✅ Test | ✅ Test |
| Push Notifications | ✅ Test | ✅ Test | ⚠️ Test* |
| Offline Support | ✅ Test | ✅ Test | ✅ Test |

\* iOS 16.4+ only

### Testing Notes by Browser

**Chrome/Edge**:
- Full PWA support
- All features should work
- Test both desktop and mobile

**Firefox**:
- Good PWA support
- No Background Sync API
- Push notifications work differently

**Safari**:
- Limited PWA support
- Push notifications: macOS 13+, iOS 16.4+
- Install via share menu on iOS
- Some features may be restricted

## Production Deployment

### Pre-Deployment Checklist

**Code**:
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Bundle size acceptable

**Configuration**:
- [ ] Environment variables set
- [ ] Firebase configured
- [ ] API URLs updated
- [ ] HTTPS enabled
- [ ] Caching headers configured

**Service Worker**:
- [ ] Cache version incremented
- [ ] Firebase config updated
- [ ] All assets listed
- [ ] No hardcoded values

**Manifest**:
- [ ] URLs are absolute
- [ ] Icons exist
- [ ] Start URL correct
- [ ] Theme colors set

### Post-Deployment Verification

After deploying to production:

**Immediate Checks**:
- [ ] Site loads over HTTPS
- [ ] No console errors
- [ ] Service worker registers
- [ ] Manifest is accessible

**Run Audits**:
- [ ] Lighthouse PWA audit
- [ ] PWABuilder validation
- [ ] Test on real devices

**Feature Testing**:
- [ ] Installation works
- [ ] Offline mode works
- [ ] Push notifications work
- [ ] Updates work

### Deployment Platforms

#### Vercel
- Automatic HTTPS
- Service Worker support
- Edge caching
- Preview deployments

**Configure** `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

#### Netlify
- Automatic HTTPS
- Service Worker support
- CDN distribution

**Configure** `netlify.toml`:
```toml
[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

## Troubleshooting

### Common Issues

**Issue**: Service worker won't register
- **Fix**: Check HTTPS, clear cache, check console

**Issue**: App won't install
- **Fix**: Check manifest, ensure HTTPS, check icons

**Issue**: Offline mode doesn't work
- **Fix**: Verify service worker active, check cache

**Issue**: Push notifications don't work
- **Fix**: Check Firebase config, verify VAPID key, check permissions

**Issue**: Updates don't appear
- **Fix**: Increment cache version, hard refresh, clear cache

## Success Criteria

### Minimum Requirements

- ✅ Lighthouse PWA score > 90
- ✅ PWABuilder score > 85
- ✅ Installs on desktop and mobile
- ✅ Works offline
- ✅ No console errors
- ✅ Fast load times (< 3s)

### Recommended Goals

- ✅ Lighthouse PWA score = 100
- ✅ PWABuilder score > 95
- ✅ Push notifications working
- ✅ Background sync implemented
- ✅ All browser tests passing
- ✅ Performance score > 90

## Documentation

Keep testing documentation up to date:

- [ ] Update version numbers
- [ ] Document known issues
- [ ] Add browser-specific notes
- [ ] Include screenshots
- [ ] Note any workarounds

---

**Last Updated**: January 2026
**Tested With**:
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+
