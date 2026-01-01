# Configuration Guide

## Frontend URLs

The frontend application is configured to work on multiple URLs:

### Development
- **Local**: `http://localhost:3000`
- **Alternative**: `http://127.0.0.1:3000`

### Production
- **Live Site**: `https://presentlyapp.vercel.app`

## Backend CORS Configuration

The Django backend is configured to allow requests from:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',      # Development frontend (Vite default)
    'http://localhost:5173',      # Development frontend (Vite alternative)
    'http://127.0.0.1:3000',      # Development frontend (localhost alias)
    'http://127.0.0.1:5173',      # Development frontend (localhost alias)
    'https://presentlyapp.vercel.app',  # Production frontend
]
```

## Running the Application

### Frontend Development Server

The frontend runs on **port 3000** by default (configured in `vite.config.ts`):

```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:3000`

### Backend Development Server

The backend typically runs on **port 8000**:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Access at: `http://localhost:8000`
Admin: `http://localhost:8000/admin`

## Environment Variables

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:8000
```

### Backend (.env)

The backend uses environment variables from `.env` in the `backend` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

For production:
```env
SECRET_KEY=your-secure-production-secret-key
DEBUG=False
FRONTEND_URL=https://presentlyapp.vercel.app
```

## Deployment

### Frontend (Vercel)

The frontend is deployed on Vercel at `https://presentlyapp.vercel.app`

Environment variables to set in Vercel:
- `GEMINI_API_KEY`
- `VITE_API_URL` (your production backend URL)

### Backend

When deploying the backend, ensure:
1. Set `FRONTEND_URL=https://presentlyapp.vercel.app`
2. Update `ALLOWED_HOSTS` in `settings.py`
3. Set `DEBUG=False`
4. Configure production database
5. Set secure `SECRET_KEY`
6. Enable HTTPS settings (SECURE_SSL_REDIRECT, etc.)

## Port Configuration

### Frontend
- **Development**: Port 3000 (configured in `vite.config.ts`)
- **Production**: Vercel automatically handles this

### Backend
- **Development**: Port 8000 (Django default)
- **Production**: Depends on your hosting provider

## Cross-Origin Requests

The application uses CORS to allow the frontend to communicate with the backend. The `CORS_ALLOWED_ORIGINS` setting in `backend/presently/settings.py` must include:

1. Your development frontend URL (`http://localhost:3000`)
2. Your production frontend URL (`https://presentlyapp.vercel.app`)

## Testing the Configuration

### Local Development

1. Start backend:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Access `http://localhost:3000` in your browser

### Production

1. Frontend is automatically deployed to `https://presentlyapp.vercel.app` via Vercel
2. Backend should be deployed to your production server
3. Update environment variables accordingly

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
1. Check that the frontend URL is in `CORS_ALLOWED_ORIGINS`
2. Ensure `CORS_ALLOW_CREDENTIALS = True` is set
3. Verify the backend is running and accessible

### Port Already in Use

If port 3000 or 8000 is already in use:

**Frontend**:
```bash
npm run dev -- --port 3001
```

**Backend**:
```bash
python manage.py runserver 8001
```

Don't forget to update CORS settings if you change ports!

## URLs Summary

| Environment | Frontend URL | Backend URL |
|-------------|-------------|-------------|
| Development | http://localhost:3000 | http://localhost:8000 |
| Production | https://presentlyapp.vercel.app | (Your backend URL) |

---

**Author**: John A. Samuel (CodeGallantX)  
**GitHub**: https://github.com/codegallantx
