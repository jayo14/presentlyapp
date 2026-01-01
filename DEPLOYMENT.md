# Production Deployment Guide

## Pre-Deployment Checklist

### Backend Configuration

1. **Environment Variables**
   ```env
   # Generate a strong secret key
   SECRET_KEY=<use-python-manage.py-generate_secret_key>
   
   # Disable debug mode
   DEBUG=False
   
   # Set allowed hosts
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   
   # Use PostgreSQL
   DATABASE_URL=postgresql://user:password@localhost/presently_db
   
   # Enable HTTPS
   SECURE_SSL_REDIRECT=True
   SECURE_HSTS_SECONDS=31536000
   SECURE_HSTS_INCLUDE_SUBDOMAINS=True
   SECURE_HSTS_PRELOAD=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   
   # Email configuration (Gmail example)
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-specific-password
   
   # Frontend URL
   FRONTEND_URL=https://yourdomain.com
   
   # CORS
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   
   # FCM (if using push notifications)
   FCM_SERVER_KEY=your-fcm-server-key
   FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/firebase-credentials.json
   
   # Redis (for Celery)
   REDIS_URL=redis://localhost:6379/0
   ```

2. **Generate Secret Key**
   ```bash
   python backend/generate_secret_key.py
   ```

3. **Database Migration**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Static Files**
   ```bash
   python manage.py collectstatic --no-input
   ```

5. **Install Gunicorn**
   ```bash
   pip install gunicorn
   ```

6. **Start Backend**
   ```bash
   gunicorn presently.wsgi:application --bind 0.0.0.0:8000 --workers 4
   ```

### Frontend Configuration

1. **Environment Variables**
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_GEMINI_API_KEY=your-gemini-key
   
   # Firebase (for push notifications)
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Serve with Nginx or Deploy to Vercel**

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: presently_db
      POSTGRES_USER: presently_user
      POSTGRES_PASSWORD: secure_password
    
  redis:
    image: redis:7-alpine
    
  backend:
    build: ./backend
    command: gunicorn presently.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
      - redis
      
  celery:
    build: ./backend
    command: celery -A presently worker -l info
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    depends_on:
      - db
      - redis
      
  celery-beat:
    build: ./backend
    command: celery -A presently beat -l info
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    depends_on:
      - db
      - redis
      
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --no-input

CMD ["gunicorn", "presently.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Monitoring & Logging

### Set up Sentry for Error Tracking

```bash
pip install sentry-sdk
```

Add to `settings.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

### Configure Logging

Add to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/presently/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Performance Optimization

1. **Enable Django Caching**
   ```python
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
       }
   }
   ```

2. **Database Optimization**
   - Add database indexes
   - Use connection pooling
   - Enable query optimization

3. **CDN for Static Files**
   - Use AWS S3 or Cloudflare for static assets
   - Configure `django-storages`

## Security Checklist

- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Strong SECRET_KEY generated
- [ ] DEBUG=False in production
- [ ] Database passwords secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Secure cookies (SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE)
- [ ] HSTS headers configured
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

## Backup Strategy

```bash
# Database backup
pg_dump presently_db > backup_$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * pg_dump presently_db > /backups/presently_$(date +\%Y\%m\%d).sql
```

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer (Nginx, HAProxy)
   - Multiple application servers
   - Read replicas for database

2. **Vertical Scaling**
   - Increase server resources
   - Optimize queries
   - Use caching extensively

3. **CDN**
   - Serve static files from CDN
   - Cache API responses when appropriate

## Maintenance

1. **Regular Updates**
   ```bash
   pip list --outdated
   pip install -U package_name
   ```

2. **Database Maintenance**
   ```bash
   python manage.py clearsessions  # Clear expired sessions
   python manage.py clear_old_reports  # Clean old reports (custom command)
   ```

3. **Monitor Performance**
   - Use Django Debug Toolbar (dev only)
   - Monitor slow queries
   - Check error rates in Sentry

## Support

For production issues:
1. Check logs: `/var/log/presently/`
2. Monitor Sentry for errors
3. Review server metrics (CPU, Memory, Disk)
4. Check database performance
