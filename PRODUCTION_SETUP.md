# Production Google OAuth Setup

## 1. Vercel Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

```
VITE_API_URL=https://your-render-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_NOVU_APPLICATION_IDENTIFIER=WfTI64nMZMhS
VITE_NOVU_SECRET_KEY=4238deb1abb03644f880bf8b721a79c0
```

**Important:** 
- `VITE_API_URL` should be your Render backend URL **without** `/api` suffix (e.g., `https://presentlyapp.onrender.com`)
- The normalization in the frontend will automatically append `/api` if needed
- Redeploy after changing environment variables for changes to take effect

## 2. Render Environment Variables

Set these in your Render service environment (Environment tab):

```
FRONTEND_URL=https://presentlyapp.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DEBUG=False
SECRET_KEY=your_secure_secret_key
```

**Important:**
- `FRONTEND_URL` must match your Vercel domain exactly
- The `GOOGLE_AUTH_CALLBACK_URL` will be automatically constructed as `{FRONTEND_URL}/auth/callback`
- Redeploy after changing environment variables

## 3. Google Cloud Console Setup

Your authorized redirect URIs in Google Cloud Console should include:

```
https://presentlyapp.vercel.app/auth/callback
https://presentlyapp.onrender.com/auth/callback  (optional, for backend-direct testing)
http://localhost:3000/auth/callback  (for local development)
```

## 4. Frontend Deploy Instructions (Vercel)

1. After updating `.env.local` with production values, run:
   ```bash
   npm run build
   git add .
   git commit -m "Update production config"
   git push
   ```

2. Vercel will automatically rebuild and deploy

3. Verify by checking the Network tab in browser DevTools:
   - Callback should hit `https://your-render-backend.onrender.com/api/auth/google-callback/` (NOT `/api/api/...`)

## 5. Backend Deploy Instructions (Render)

1. Push changes to git (includes `.env` updates)
2. Render auto-deploys on push OR manually trigger deploy from Render dashboard
3. Verify by checking Application logs in Render dashboard for any Google auth errors

## 6. Testing the Flow

1. Go to `https://presentlyapp.vercel.app/login`
2. Click "Sign in with Google"
3. Authorize your Google account
4. You should be redirected and authenticated

If it fails:
- Check browser Network tab for the API request to see exact error
- Check Render logs for backend errors (Dashboard > Logs)
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly on Render
