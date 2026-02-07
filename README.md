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
- 🔐 **Secure Authentication**: JWT-based authentication with email verification (OTP)
- 📄 **Automated Reports**: Export attendance data to PDF, Excel, and CSV
- 🎯 **Exam Clearance**: Automated clearance based on attendance thresholds
- 🗺️ **Geo-Fencing**: Location-based attendance verification with elevation support
- 🌐 **Multi-Institution**: Support for multiple institutions, colleges, and departments
- 🔔 **Push Notifications**: Real-time alerts for attendance and system events
- 📈 **Advanced Analytics**: At-risk student detection, engagement metrics, and weekly overviews

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
│   ├── accounts/            # Security & Device tracking
│   ├── institutions/        # Core app (User, Institution, College, Department, Course, Sessions)
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

# Create superuser (admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend API will be available at [http://localhost:8000](http://localhost:8000)

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (React Query) v5
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: Mapbox GL / MapLibre GL

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework 3.16
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Geolocation**: Haversine formula for distance verification
- **Reports**: Pandas, ReportLab, Openpyxl

---

## 🚀 Deployment

### Render Deployment (Recommended)

This application is configured for easy deployment to Render with git-driven deployment.

**Quick Start:**
1. Create a Render account at [render.com](https://render.com/)
2. Connect your GitHub repository
3. Render will automatically detect and use the `render.yaml` configuration
4. Configure any additional environment variables as needed
5. Deploy!

**Configuration File:**
- `render.yaml` - Complete service configuration including PostgreSQL, Redis, web service, and Celery worker

**Required Environment Variables:**
- Most environment variables are auto-configured in `render.yaml`
- `SECRET_KEY` - Generated automatically
- `DATABASE_URL` - Auto-configured from PostgreSQL service
- `REDIS_URL` - Auto-configured from Redis service
- Additional environment variables can be configured in `render.yaml`

### Other Platforms

The application also supports deployment to:
- **Koyeb**: See [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md) for configuration (Note: Requires manual setup without Procfile)
- **Vercel**: Frontend deployment configured in `vercel.json`
- **Docker**: See `backend/Dockerfile` for containerization

---

## 👥 User Roles

- **Admin**: Full system management, institutions, users, and audit logs.
- **Lecturer**: Session creation, QR code generation, real-time tracking, and reporting.
- **Student**: QR check-in, attendance history, and performance tracking.
<!---- **Class Rep**: Class-level coordination and attendance assistance. --->

---

## 📝 License

**Proprietary Software - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited. See the [LICENSE](LICENSE) file for full details.

<div align="center">
  <p>Made with ❤️ for modern education</p>
</div>
