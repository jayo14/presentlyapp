<div align="center">
  <h1>🎓 Presently</h1>
  <p><strong>Modern Attendance Management System for Educational Institutions</strong></p>
  <p>A comprehensive, role-based attendance tracking platform with real-time monitoring, QR code check-ins, GPS verification, automated reporting, and push notifications.</p>
  
  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![Version](https://img.shields.io/badge/version-2.0.0-blue)
  ![License](https://img.shields.io/badge/license-Proprietary-red)
</div>

---

## 📋 Overview

**Presently** is a full-stack attendance management system designed for universities, polytechnics, and colleges. It provides seamless attendance tracking for students, powerful management tools for lecturers, and comprehensive analytics for administrators.

### ✨ Key Features

- 🚀 **Fast Check-In**: QR code + GPS-based attendance verification
- 👥 **Role-Based Access Control**: Student, Lecturer, Admin, and Class Rep roles
- 📊 **Real-Time Analytics**: Live attendance tracking and insights with predictive analytics
- 📱 **Progressive Web App**: Install and use like a native mobile app
- 🔐 **Secure Authentication**: JWT-based authentication with email verification
- 📄 **Automated Reports**: Export attendance data to PDF, Excel, and CSV
- 🎯 **Exam Clearance**: Automated clearance based on attendance thresholds
- 🗺️ **Geo-Fencing**: Location-based attendance verification
- 🌐 **Multi-Institution**: Support for multiple institutions, colleges, and departments
- 🔔 **Push Notifications**: Firebase Cloud Messaging (FCM) for real-time alerts
- 📈 **Advanced Analytics**: At-risk student detection, dropout prediction, engagement metrics

---

## 🏗️ Repository Structure

This is a **monorepo** containing both frontend and backend applications:

```
presently-2/
├── frontend/                # React + TypeScript frontend application
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks for API integration
│   ├── services/            # API services and client configuration
│   ├── SETUP.md             # Detailed frontend setup guide
│   └── ...                  # Configuration files
├── backend/                 # Django REST API backend
│   ├── institutions/        # Core app (User, Institution, College, Department, Course)
│   ├── notifications/       # Push notifications & FCM
│   ├── analytics/           # Real-time analytics & insights
│   ├── reports/             # PDF/Excel/CSV report generation
│   ├── exam_clearance/      # Automated exam clearance
│   ├── presently/           # Django project settings
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Python dependencies
│   └── API_ROUTES.md        # Complete API documentation
├── .env.example             # Environment variables template
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.10 or higher
- **npm** or **yarn** package manager
- **Redis** (optional, for async tasks and caching)
- **Firebase account** (optional, for push notifications)

### 1. Clone the Repository

```bash
git clone https://github.com/CodeGallantX/presently-2.git
cd presently-2
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend API will be available at [http://localhost:8000](http://localhost:8000)

**API Documentation**: [http://localhost:8000/api/swagger/](http://localhost:8000/api/swagger/)

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env.local
# Edit .env.local with:
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**For detailed frontend setup instructions**, see [frontend/SETUP.md](frontend/SETUP.md)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (React Query) v5
- **HTTP Client**: Axios
- **Authentication**: JWT tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Map GL + MapLibre GL
- **AI**: Google Gemini API (optional)

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework 3.16
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-yasg (Swagger/OpenAPI)
- **CORS**: django-cors-headers
- **Rate Limiting**: django-ratelimit
- **Geolocation**: geopy, haversine
- **QR Codes**: qrcode, Pillow
- **Reports**: reportlab (PDF), openpyxl (Excel), pandas (CSV)
- **Push Notifications**: fcm-django, firebase-admin
- **Async Tasks**: Celery, Redis

---

## 📚 API Documentation

The backend provides a comprehensive REST API with 70+ endpoints organized into feature-specific modules:

### Core Endpoints
- **Authentication** (12 endpoints): Register, login, JWT refresh, email verification, password reset
- **Institutions** (6 endpoints): CRUD operations for institutions
- **Colleges** (6 endpoints): CRUD operations for colleges/faculties
- **Departments** (6 endpoints): CRUD operations for departments
- **Courses** (6 endpoints): CRUD operations for courses
- **Sessions** (7 endpoints): CRUD + QR code generation & GPS check-in
- **Attendances** (6 endpoints): CRUD operations for attendance records

### Feature Endpoints
- **Analytics** (27 endpoints): Dashboard analytics, attendance trends, session statistics, at-risk students, predictive analytics
- **Notifications** (14 endpoints): Push notifications, FCM device management, preferences, broadcast
- **Reports** (18 endpoints): Generate & download PDF/Excel/CSV reports, scheduled reports
- **Exam Clearance** (11 endpoints): Automated clearance calculation, approval workflow, certificates

**Full API Documentation**: See [backend/API_ROUTES.md](backend/API_ROUTES.md) or visit [http://localhost:8000/api/swagger/](http://localhost:8000/api/swagger/)

---

## 👥 User Roles & Permissions

### 🎓 Student
- Quick QR code and GPS-based check-in
- View attendance history and statistics
- Download exam clearance certificates (PDF)
- Receive absence alerts and notifications
- View course analytics and personal performance

### 👨‍🏫 Lecturer
- Create and manage unlimited courses and sessions
- Generate QR codes for attendance with GPS geofencing
- Monitor real-time attendance during sessions
- Export attendance reports (PDF/Excel/CSV)
- Send automated reminders to students
- Issue exam clearance for students
- View at-risk students and engagement metrics

### 🔧 Admin
- Full system access and control
- Manage users, institutions, colleges, and departments
- View system-wide analytics and reports
- Configure system settings
- Access predictive analytics (dropout risk, attendance prediction)
- Manage scheduled reports

### 📢 Class Representative
- Manage class-level attendance
- Coordinate with students
- Assist lecturers with attendance tracking
- View class analytics

---

## 📚 Documentation

- **[Frontend Setup Guide](frontend/SETUP.md)** - Detailed frontend installation and configuration
- **[Database Schema](frontend/DATABASE_SCHEMA_DIAGRAM.md)** - Complete database structure
- **[Institution/College/Department](frontend/INSTITUTION_COLLEGE_DEPARTMENT.md)** - Multi-institution setup
- **[Tables Summary](frontend/TABLES_SUMMARY.md)** - Quick reference for database tables
- **[Authentication Setup](frontend/AUTH_CALLBACK_SETUP.md)** - Supabase auth configuration
- **[RBAC Documentation](frontend/AUTH_CALLBACK_RBAC.md)** - Role-based access control
- **[Vercel Deployment](frontend/VERCEL_SETUP.md)** - Deploy to Vercel

---

## 🎯 Features by Role

| Feature | Student | Lecturer | Class Rep | Admin |
|---------|---------|----------|-----------|-------|
| QR Code Check-In | ✅ | - | - | - |
| View Own Attendance | ✅ | ✅ | ✅ | ✅ |
| Download Clearance | ✅ | - | - | - |
| Create Sessions | - | ✅ | - | ✅ |
| Mark Attendance | - | ✅ | ✅ | ✅ |
| Export Reports | - | ✅ | ✅ | ✅ |
| Manage Users | - | - | - | ✅ |
| System Analytics | - | - | - | ✅ |
| Manage Institutions | - | - | - | ✅ |

---

## 🔐 Authentication

Presently uses **JWT (JSON Web Token) Authentication** with the following features:

- ✅ Email/Password authentication
- ✅ Email verification with OTP
- ✅ Password reset with email link
- ✅ Session management (1-hour access tokens, 7-day refresh tokens)
- ✅ Token rotation and blacklisting
- ✅ Role-based access control (RBAC)

### Authentication Flow

1. **Register**: User creates account with email and password
2. **Email Verification**: 6-digit OTP sent to email (15-minute expiry)
3. **Login**: Returns JWT access and refresh tokens
4. **Access Protected Resources**: Include `Authorization: Bearer <token>` header
5. **Token Refresh**: Automatic refresh when access token expires
6. **Logout**: Blacklists refresh token for security

---

## 📦 Database Schema

The application uses a hierarchical structure:

```
INSTITUTION (University, Polytechnic, etc.)
    ↓
COLLEGE (Faculty, School)
    ↓
DEPARTMENT (Academic Department)
    ↓
COURSE (Course/Module)
    ↓
SESSION (Lecture/Class)
    ↓
ATTENDANCE (Student Check-ins)
```

**Additional Tables**:
- `notifications` - User notifications
- `fcm_devices` - FCM device tokens for push notifications
- `exam_clearances` - Exam clearance records
- `reports` - Generated reports
- `scheduled_reports` - Automated report schedules

For the complete schema, see [frontend/DATABASE_SCHEMA_DIAGRAM.md](frontend/DATABASE_SCHEMA_DIAGRAM.md)

---

## 🧪 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd backend
python manage.py runserver       # Start Django dev server
python manage.py makemigrations  # Create migrations
python manage.py migrate         # Apply migrations
python manage.py createsuperuser # Create admin user
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Page is blank:**
- Ensure all dependencies are installed: `npm install`
- Clear browser cache and reload
- Check browser console for errors

**Authentication not working:**
- Verify Supabase credentials in `.env.local`
- Check that database schema is applied
- Review Supabase logs in dashboard

**Development server issues:**
- Stop the server (Ctrl+C)
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart: `npm run dev`

For more troubleshooting tips, see [frontend/SETUP.md](frontend/SETUP.md)

---

## 📄 Environment Variables

### Backend (.env)

```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3  # or PostgreSQL URL for production

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@presently.app
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Firebase Cloud Messaging (FCM) - Optional
FCM_SERVER_KEY=your-fcm-server-key
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/firebase-credentials.json

# Redis - Optional (for Celery)
REDIS_URL=redis://localhost:6379/0

# Exam Clearance
EXAM_CLEARANCE_THRESHOLD=75  # Minimum attendance percentage
```

### Frontend (.env.local)

```env
# Django Backend API
VITE_API_URL=http://localhost:8000/api

# Google Gemini AI (Optional)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Firebase (Optional - for push notifications on frontend)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

**Proprietary Software - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited. See the [LICENSE](LICENSE) file for full details.

For licensing inquiries or permissions, please contact the project maintainers.

---

## 🔗 Links

- **GitHub Repository**: https://github.com/CodeGallantX/presently-2
- **Issue Tracker**: https://github.com/CodeGallantX/presently-2/issues
- **Supabase Project**: https://app.supabase.com/project/fvksxcavxjslqptjwsvo

---

## 💡 Support

For questions or issues:
1. Check the [documentation](frontend/SETUP.md)
2. Search [existing issues](https://github.com/CodeGallantX/presently-2/issues)
3. Create a [new issue](https://github.com/CodeGallantX/presently-2/issues/new) with detailed information

---

<div align="center">
  <p>Made with ❤️ for educational institutions</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
