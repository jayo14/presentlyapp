<div align="center">
  <h1>🎓 Presently</h1>
  <p><strong>Modern Attendance Management System for Educational Institutions</strong></p>
  <p>A comprehensive, role-based attendance tracking platform with real-time monitoring, QR code check-ins, GPS verification, and automated reporting.</p>
</div>

---

## 📋 Overview

**Presently** is a full-stack attendance management system designed for universities, polytechnics, and colleges. It provides seamless attendance tracking for students, powerful management tools for lecturers, and comprehensive analytics for administrators.

### ✨ Key Features

- 🚀 **Fast Check-In**: QR code + GPS-based attendance verification
- 👥 **Role-Based Access Control**: Student, Lecturer, Admin, and Class Rep roles
- 📊 **Real-Time Analytics**: Live attendance tracking and insights
- 📱 **Progressive Web App**: Install and use like a native mobile app
- 🔐 **Secure Authentication**: Powered by Supabase with email and OAuth support
- 📄 **Automated Reports**: Export attendance data to PDF and Excel
- 🎯 **Exam Clearance**: Automated clearance based on attendance thresholds
- 🗺️ **Geo-Fencing**: Location-based attendance verification
- 🌐 **Multi-Institution**: Support for multiple institutions, colleges, and departments

---

## 🏗️ Repository Structure

This is a **monorepo** containing both frontend and backend applications:

```
presently-2/
├── frontend/              # React + TypeScript frontend application
│   ├── components/        # React components
│   ├── services/          # API services and Supabase integration
│   ├── supabase/          # Database schema and migrations
│   ├── SETUP.md           # Detailed frontend setup guide
│   └── ...                # Configuration files
├── backend/               # Django REST API backend
│   ├── institutions/      # Institutions app
│   ├── presently/         # Django project settings
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Python dependencies
├── .env.example           # Environment variables template
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.10 or higher (for backend)
- **npm** or **yarn** package manager
- **Supabase account** (for authentication and database)

### 1. Clone the Repository

```bash
git clone https://github.com/CodeGallantX/presently-2.git
cd presently-2
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Gemini API (Optional - for AI features)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> **Note**: The Supabase URL is currently hardcoded in the application. See [frontend/SETUP.md](frontend/SETUP.md) for details.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**For detailed frontend setup instructions**, see [frontend/SETUP.md](frontend/SETUP.md)

### 4. Backend Setup (Optional)

The Django backend is currently in development. To set it up:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at [http://localhost:8000](http://localhost:8000)

---

## 👥 User Roles

### 🎓 Student
- Quick QR code and GPS-based check-in
- View attendance history and statistics
- Download exam clearance certificates (PDF)
- Receive absence alerts and notifications

### 👨‍🏫 Lecturer
- Create and manage unlimited courses and sessions
- Generate QR codes for attendance
- Monitor real-time attendance during sessions
- Export attendance reports (PDF/Excel)
- Send automated reminders to students
- Issue exam clearance for students

### 🔧 Admin
- Full system access and control
- Manage users, institutions, colleges, and departments
- View system-wide analytics and reports
- Configure system settings

### 📢 Class Representative
- Manage class-level attendance
- Coordinate with students
- Assist lecturers with attendance tracking

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v7
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Map GL + MapLibre GL
- **AI**: Google Gemini API (optional)

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **CORS**: django-cors-headers
- **Rate Limiting**: django-ratelimit
- **Geolocation**: geopy, haversine

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

Presently uses **Supabase Authentication** with support for:

- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Email verification
- ✅ Password reset
- ✅ Session management
- ✅ Role-based access control (RBAC)

### Demo Mode

If Supabase is not configured, the app runs in **demo mode** with simulated authentication:

- `admin@example.com` → Admin role
- `prof@example.com` or `lecturer@example.com` → Lecturer role
- `rep@example.com` → Class Rep role
- Any other email → Student role

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

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (for auth) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | No (for AI features) |

> **Note**: The Supabase URL (`https://fvksxcavxjslqptjwsvo.supabase.co`) is currently hardcoded. Get your anon key from the [Supabase dashboard](https://app.supabase.com/project/fvksxcavxjslqptjwsvo/settings/api).

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
