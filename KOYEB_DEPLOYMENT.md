# Koyeb Deployment Guide

> **⚠️ Note:** This guide is outdated. The Procfile has been removed from this repository as the project now prioritizes Render.com deployment (see `render.yaml`). For Koyeb deployment, you will need to manually configure the run command and build process in the Koyeb dashboard.

This guide explains how to deploy the Presently Django application to Koyeb.

## Prerequisites

- A Koyeb account (https://www.koyeb.com/)
- Git repository connected to Koyeb
- PostgreSQL database (can be provisioned on Koyeb)
- Redis instance (optional, for caching and Celery)
- **APT Buildpack**: Required for GIS libraries (GDAL, GEOS). Ensure the `Aptfile` in the root is used.

## Project Structure

```
presently-2/
├── backend/           # Django application
│   ├── presently/     # Django project settings
│   ├── manage.py
│   └── requirements.txt
├── Procfile          # Process configuration for Koyeb
├── requirements.txt  # Root requirements (references backend/requirements.txt)
├── runtime.txt       # Python version specification
└── bin/
    └── post_compile  # Build hook for collectstatic
```

## Configuration Files

### 1. Procfile
The `Procfile` tells Koyeb how to run your application:
```
web: cd backend && gunicorn presently.wsgi:application --bind 0.0.0.0:$PORT --workers 4
```

### 2. requirements.txt (Root)
The root `requirements.txt` references the backend requirements:
```
-r backend/requirements.txt
```

### 3. runtime.txt
Specifies the Python version:
```
python-3.12.3
```

### 4. bin/post_compile
Build hook that runs after dependencies are installed:
```bash
#!/usr/bin/env bash
set -e
echo "-----> Post-compile: Collecting static files"
cd backend
python manage.py collectstatic --noinput
echo "-----> Post-compile: Complete"
```

## Deployment Steps

### Using Koyeb Control Panel

1. **Create a new Web Service**
   - Go to the Koyeb control panel
   - Click "Create Web Service"

2. **Connect your Git repository**
   - Select GitHub as the deployment option
   - Choose your repository and branch containing this application

3. **Configure the service**
   - Builder: Keep "Buildpack" selected
   - **Buildpacks**: Add `https://github.com/heroku/heroku-buildpack-apt` before the Python buildpack if your platform supports it.
   - The buildpack will automatically detect Python and use the Procfile
   - Run command: (Auto-detected from Procfile, or manually set if needed)
     ```
     cd backend && gunicorn presently.wsgi:application --bind 0.0.0.0:$PORT --workers 4
     ```

4. **Set Environment Variables**
   Required environment variables:
   
   | Variable | Value | Description |
   |----------|-------|-------------|
   | `DJANGO_ALLOWED_HOSTS` | `{{ KOYEB_PUBLIC_DOMAIN }}` | Allowed hosts for Django |
   | `SECRET_KEY` | (generate secure key) | Django secret key |
   | `DEBUG` | `False` | Debug mode (should be False in production) |
   | `DATABASE_URL` | (database connection string) | PostgreSQL database URL |
   | `REDIS_URL` | (redis connection string) | Redis URL for caching (optional) |
   | `ALLOWED_HOSTS` | `*` | Or specify your domains |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Frontend URLs |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Main frontend URL |

5. **Deploy**
   - Click "Deploy" button
   - Wait for the build and deployment to complete
   - Access your application at the generated `.koyeb.app` URL

## Database Setup

### PostgreSQL on Koyeb

If you don't have a database yet:
1. Create a PostgreSQL database on Koyeb or use an external provider
2. Get the connection string
3. Set it as the `DATABASE_URL` environment variable

### Running Migrations

Migrations need to be run manually the first time:
1. Use Koyeb's console feature or SSH into your instance
2. Run: `cd backend && python manage.py migrate`

For subsequent deployments, you can add migrations to the Procfile:
```
release: cd backend && python manage.py migrate --noinput
web: cd backend && gunicorn presently.wsgi:application --bind 0.0.0.0:$PORT --workers 4
```

## Troubleshooting

### Error: "no command to run your application"
- Ensure `Procfile` exists at the repository root
- Ensure `requirements.txt` exists at the repository root
- Check that the Procfile format is correct

### Static Files Not Loading
- Ensure `bin/post_compile` is executable: `chmod +x bin/post_compile`
- Check that `STATIC_ROOT` is set in Django settings
- Verify WhiteNoise is configured correctly in `MIDDLEWARE`

### Database Connection Issues
- Verify `DATABASE_URL` environment variable is set correctly
- Ensure PostgreSQL is accessible from Koyeb
- Check that `dj-database-url` is in requirements.txt

### Application Crashes on Startup
- Check Koyeb logs for detailed error messages
- Verify all required environment variables are set
- Ensure Python version in `runtime.txt` is supported by Koyeb

## Additional Resources

- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)

## Health Checks

The application should respond to health checks at `/api/health/` (if implemented). Configure this in Koyeb service settings for better monitoring.

## Scaling

To scale your application:
1. Go to your service settings in Koyeb
2. Adjust the number of instances
3. Consider adjusting the number of Gunicorn workers based on your instance resources

Recommended worker formula: `(2 x CPU cores) + 1`

## Continuous Deployment

Once configured, Koyeb will automatically deploy new versions when you push to your connected Git branch.
