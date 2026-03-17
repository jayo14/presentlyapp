# API Configuration - Frontend & Backend Setup

## Overview

The Presently application uses a centralized API configuration to ensure all frontend requests are sent to the backend API URL specified in environment variables, not to the frontend host.

## Frontend Architecture

### 1. Main API Client (`frontend/services/api/client.ts`)

**Purpose:** Handles all backend API requests from the React SPA

**Configuration:**
- Reads `VITE_API_URL` from environment variables
- Normalizes URL to ensure `/api` suffix
- Validates absolute HTTP/HTTPS URLs
- Falls back to `http://localhost:8000/api` if not configured

**Implementation:**
```typescript
const DEFAULT_API_URL = 'http://localhost:8000/api';

const normalizeApiBaseUrl = (apiUrl?: string): string => {
  const trimmedUrl = (apiUrl || '').trim();
  
  if (!trimmedUrl) {
    return DEFAULT_API_URL;
  }
  
  const normalizedUrl = trimmedUrl.replace(/\/$/, '');
  const withApiSuffix = normalizedUrl.endsWith('/api')
    ? normalizedUrl
    : `${normalizedUrl}/api`;
  
  if (!/^https?:\/\//i.test(withApiSuffix)) {
    console.warn('[API Client] VITE_API_URL must be absolute (http/https).');
    return DEFAULT_API_URL;
  }
  
  return withApiSuffix;
};

const rawApiUrl: string = import.meta.env.VITE_API_URL || '';
const API_BASE_URL: string = normalizeApiBaseUrl(rawApiUrl);
```

### 2. Service Worker (`frontend/public/service-worker.js`)

**Purpose:** Handles background sync and offline functionality with proper API routing

**Configuration:**
- Receives API base URL as query parameter from `index.tsx`
- Resolves URL the same way as main client
- Uses it for all background operations

**Flow:**
1. **index.tsx** reads `VITE_API_URL`
2. Normalizes it with same logic
3. Passes as query parameter: `/service-worker.js?apiBaseUrl=...`
4. Service worker extracts via: `new URL(self.location.href).searchParams.get('apiBaseUrl')`

**Code in public/service-worker.js:**
```javascript
const resolveApiBaseUrl = () => {
  const configuredUrl = new URL(self.location.href).searchParams.get('apiBaseUrl') 
    || 'http://localhost:8000/api';
  const normalizedUrl = configuredUrl.replace(/\/$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();
```

### 3. Service Worker Registration (`frontend/index.tsx`)

**How API URL is passed to Service Worker:**
```typescript
// Get the API base URL (normalized from VITE_API_URL env var)
const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// Register service worker with API URL as query parameter
const serviceWorkerUrl = `/service-worker.js?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;

navigator.serviceWorker.register(serviceWorkerUrl)
  .then(registration => {
    console.log('Service Worker registered');
  })
  .catch(error => {
    console.warn('Service Worker registration failed:', error);
  });
```

## Environment Configuration

### Frontend `.env.local`

```bash
# Required: Backend API URL - must be absolute (http/https)
VITE_API_URL=https://api.yourdomain.com

# Optional: Novu notification center
VITE_NOVU_APPLICATION_IDENTIFIER=your_novu_app_id
```

### Frontend `.env.development`

```bash
# Development backend
VITE_API_URL=http://localhost:8000
```

### Frontend `.env.production`

```bash
# Production backend
VITE_API_URL=https://presently-api.yourdomain.com
```

## Key Points

✅ **No Relative Paths:** All API URLs are absolute (must include http/https)
✅ **Environment-Based:** API URL source is `.env` files, not hardcoded
✅ **Service Worker Support:** Background sync uses same API URL
✅ **Validation:** Invalid URLs fall back to default localhost
✅ **Normalization:** Automatically handles trailing slashes and `/api` suffix

## API Request Flow

```
User Action
    ↓
React Component
    ↓
API Client Hook (e.g., useAuth)
    ↓
API Service (e.g., authApi)
    ↓
axios Instance with baseURL = VITE_API_URL
    ↓
POST/GET/PUT/DELETE to {API_BASE_URL}/endpoint
    ↓
Django Backend (http://localhost:8000/api or configured URL)
```

## Troubleshooting

### API Requests failing with 404 or connection refused

**Check:**
1. Verify `VITE_API_URL` is set: `echo $VITE_API_URL`
2. Ensure URL is absolute: Must start with `http://` or `https://`
3. Ensure URL is correct: `http://localhost:8000` or your production URL
4. Check browser console for warnings like: `[API Client] VITE_API_URL must be absolute`

### Service Worker not using correct API URL

**Fix:**
1. Clear service workers: DevTools → Application → Service Workers → Unregister
2. Clear cache: DevTools → Application → Cache Storage → Delete all
3. Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

### Different API URL for different deployments

**Solution:**
Create separate `.env` files:
- `.env.development` → Local dev
- `.env.staging` → Staging server
- `.env.production` → Production server

Build command: `VITE_API_URL=https://api.example.com npm run build`

## Backend Configuration

### Django (`backend/.env`)

```bash
# Allowed hosts for API
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Frontend URL (for password reset links, invitations, etc.)
FRONTEND_URL=https://yourdomain.com

# CORS settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Backend Settings (`backend/presently/settings.py`)

**CORS Configuration Example:**
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",     # Local development
    "https://yourdomain.com",     # Production
    "https://staging.yourdomain.com",  # Staging
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]
```

## Testing API Configuration

### 1. Check Frontend API Client

```typescript
// In browser console
import { apiClient } from '@/services/api/client.ts'
// Should show the correct API_BASE_URL
```

### 2. Test API Call

```typescript
// In browser console
fetch('http://yourapi.com/api/auth/me/', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(r => r.json())
```

### 3. Check Service Worker

```javascript
// In Service Worker DevTools
// Should show correct API_BASE_URL from query parameter
```

## Security Considerations

1. **No API Keys in Frontend Code:** Backend API should use JWT tokens from `/auth/login/`
2. **CORS Configuration:** Backend must allow requests from frontend domain
3. **Environment Variables:** Never hardcode API URLs in source code
4. **HTTPS in Production:** Always use `https://` URLs in production

## Migration Guide

If switching backends (e.g., different host):

1. **Update Environment Variables:**
   ```bash
   VITE_API_URL=https://new-api.domain.com
   ```

2. **Update Django Settings:**
   ```python
   CORS_ALLOWED_ORIGINS = ["https://new-api.domain.com", ...]
   FRONTEND_URL = "https://new-frontend.domain.com"
   ```

3. **Clear Frontend Cache:**
   - Delete localStorage
   - Delete service worker cache
   - Hard refresh browser

4. **Verify Connectivity:**
   - Test API calls in browser console
   - Check Network tab in DevTools
   - Verify CORS headers in response

---

**Last Updated:** March 17, 2026
**Status:** All API URLs configured via environment variables
**Next Steps:** Set `VITE_API_URL` for your deployment environment
