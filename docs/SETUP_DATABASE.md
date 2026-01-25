# Database Setup Guide

## Issue: `OperationalError: no such table: venues`

This error occurs when Django migrations have not been applied to your database. The `venues` table was added in migration `0004_attendancesession_description_and_more.py` and must be created before the application can run properly.

## Solution: Run Django Migrations

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Apply All Migrations
```bash
python manage.py migrate
```

This will create all necessary database tables including:
- institutions
- colleges  
- departments
- users
- courses
- venues ⭐ (the missing table)
- attendance_sessions
- attendances
- email_verification_otps
- timetables

### Step 3: Verify Migrations
```bash
python manage.py showmigrations
```

You should see all migrations marked with `[X]`:
```
institutions
 [X] 0001_initial
 [X] 0002_user_email_verified_user_email_verified_at_and_more
 [X] 0003_create_groups
 [X] 0004_attendancesession_description_and_more
 [X] 0005_attendance_distance_from_venue_attendance_elevation_and_more
```

## Optional: Create a Superuser

To access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## Database Location

By default, the SQLite database is located at:
```
backend/db.sqlite3
```

## Troubleshooting

### If migrations fail:

1. **Check if database file is locked**:
   - Close any database browsers or Django shells
   - Stop the development server

2. **Check for migration conflicts**:
   ```bash
   python manage.py makemigrations --check
   ```

3. **Reset database (WARNING: This will delete all data)**:
   ```bash
   rm db.sqlite3
   python manage.py migrate
   ```

### If you see "no such table" for other tables:

Make sure all apps are listed in `INSTALLED_APPS` in `settings.py` and that their migrations have been applied.

## Related Files

- Venue model definition: `backend/institutions/models.py` (line 292-367)
- Venue migration: `backend/institutions/migrations/0004_attendancesession_description_and_more.py`
- Database settings: `backend/presently/settings.py`

## Next Steps

After running migrations:
1. Start the development server: `python manage.py runserver`
2. The venues table should now exist
3. You can create venues through the Django admin or API endpoints
