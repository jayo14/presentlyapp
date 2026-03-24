# Quick Fix for Google OAuth Production Callback Error

**Current Issue:** `https://presentlyapp.onrender.com/api/api/auth/google-callback/` (duplicate `/api`)

## Immediate Action Items

### 1. Verify & Update Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Ensure these are set:
```
VITE_API_URL = https://presentlyapp.onrender.com
VITE_GOOGLE_CLIENT_ID = [your actual Google Client ID]
```

**Do NOT include `/api` in the URL** — the frontend will add it automatically.

### 2. Verify & Update Render Environment Variables

Go to: https://dashboard.render.com → Your Backend Service → Environment

Ensure these are set:
```
FRONTEND_URL = https://getpresently.com.ng
GOOGLE_CLIENT_ID = [your actual Google Client ID]
GOOGLE_CLIENT_SECRET = [your actual Google Client Secret]
```

### 3. Redeploy Both Services

**Vercel:**
- Settings → Deployments → Trigger Deploy (or push a commit)

**Render:**
- Dashboard → Manual Deploy (or the service will auto-deploy on GitHub push)

### 4. Clear Client Browser Cache

After redeployment:
- Hard refresh Vercel app: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cookies/cache for the domain

### 5. Test the Flow Again

1. Visit `https://getpresently.com.ng/login`
2. Click "Sign in with Google"
3. You should be redirected to callback with correct path: `/api/auth/google-callback/` (no duplicate)

## If Still Failing

Check **Render Logs** for error details:
- Dashboard → Your Service → Logs
- Look for `google-callback` errors or missing credential messages

Common errors:
- `GOOGLE_CLIENT_ID not set` → Backend env vars not loaded, restart service
- `Invalid client_id` → Wrong Google credentials in Render
- `Invalid authorization code` → Code has expired, start flow again

## Verify Correctness

Your `VITE_API_URL` environment variable should be:
```
✅ CORRECT:   https://presentlyapp.onrender.com
❌ WRONG:     https://presentlyapp.onrender.com/api
❌ WRONG:     https://presentlyapp.onrender.com/api/api
```

The frontend URL normalizer will convert it to `https://presentlyapp.onrender.com/api` internally.
