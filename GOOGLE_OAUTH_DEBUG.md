# Google OAuth Callback Debugging Guide

## Debug Steps

### 1. Check Render Backend Logs
Go to: https://dashboard.render.com → Your Backend Service → Logs

Look for any errors when the callback is triggered. Search for:
- `google-callback`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `Invalid client`
- `Token exchange failed`

### 2. Verify Backend Environment Variables Are Set

The backend needs these env vars on Render (Settings > Environment):

```
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
FRONTEND_URL=https://presentlyapp.vercel.app
```

**If these are NOT set:** The backend will silently fail because:
```python
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
```
Empty strings will cause token exchange to fail.

### 3. Check Google Cloud Console Registration

Verify your app is correctly registered:

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to **Credentials** > **OAuth 2.0 Client IDs**
4. Click your Web Application credential
5. Verify **Authorized redirect URIs** includes:
   ```
   https://presentlyapp.vercel.app/auth/callback
   ```

### 4. Test the Backend Endpoint Directly

Once you've verified env vars, restart the Render service (Manual Deploy), then test:

```bash
curl -X POST https://presentlyapp.onrender.com/api/auth/google-callback/ \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AfrIepCF9Z3XnmrOsdbBOv09cCYM5oUiro0H39BEs2KqxG6b2Vj56958qdE8XRqsR1_SeA",
    "redirect_uri": "https://presentlyapp.vercel.app/auth/callback"
  }'
```

Replace the `code` with a fresh one from the callback URL (they expire after a few minutes).

Expected response (if working):
```json
{
  "success": true,
  "message": "Google authentication successful",
  "tokens": {
    "access": "...",
    "refresh": "..."
  },
  "user": {...}
}
```

Error response (if credentials missing):
```json
{
  "error": "GOOGLE_CLIENT_ID not configured"
}
```

### 5. Check Frontend Error Handling

If the backend is returning an error, the frontend callback handler should show it. Check:
- Browser DevTools > Network tab > `/auth/google-callback/` request
- Response status and body

The callback component is at: `/frontend/components/Auth/Callback.tsx`

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `"Invalid client_id"` | Google Client ID in env is wrong or mismatched |
| `"Invalid authorization code"` | Code has expired (use fresh code from URL) or wrong redirect_uri |
| Empty error message | Backend env vars not set, restart Render service |
| Page loops forever | Backend unreachable or returning 5xx error |

## Quick Checklist

- [ ] Render backend has `GOOGLE_CLIENT_ID` env var set
- [ ] Render backend has `GOOGLE_CLIENT_SECRET`env var set
- [ ] Render service restarted after setting env vars
- [ ] Google Cloud Console has `https://presentlyapp.vercel.app/auth/callback` registered
- [ ] Vercel frontend is rebuilt and deployed
- [ ] Browser cache cleared (hard refresh)
