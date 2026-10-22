<div align="center">
  <h1>🎓 Presently</h1>
  <p><strong>Modern Attendance Management System for Educational Institutions</strong></p>
  <p>A comprehensive, role-based attendance tracking platform with real-time monitoring, QR code check-ins, GPS verification, automated reporting, and push notifications.</p>
  
  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![Version](https://img.shields.io/badge/version-2.0.0-blue)
  ![License](https://img.shields.io/badge/license-Proprietary-red)
</div>

----

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
git clone https://github.com/jayo14/presentlyapp.git
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

## 🧪 Testing

Presently has a multi-layer test suite covering the backend API (Django unit tests) and frontend (Vitest unit tests + Playwright E2E tests).

### Quick-start: run all tests

```bash
# Backend (from the repo root)
cd backend && python manage.py test

# Frontend unit tests (from the repo root)
cd frontend && npm test

# Frontend E2E tests (requires a running dev server)
cd frontend && npm run test:e2e
```

---

### Backend Tests (Django)

The backend tests live alongside each Django app and use the built-in `unittest` runner.

#### Prerequisites

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Running the tests

```bash
# Run the full backend test suite
python manage.py test

# Run tests for a specific app
python manage.py test institutions
python manage.py test analytics
python manage.py test notifications

# Run a single test module
python manage.py test institutions.test_comprehensive
python manage.py test institutions.test_onboarding
python manage.py test institutions.tests           # check-in, venue, geolocation tests
python manage.py test institutions.tests_onboarding # OnboardingSerializer tests

# Run with verbose output
python manage.py test --verbosity=2
```

#### What's covered

| Module | Tests | Description |
|---|---|---|
| `institutions/tests.py` | 15 | Check-in flow, venue display fields, geolocation utilities |
| `institutions/tests_onboarding.py` | 1 | OnboardingSerializer long avatar URL |
| `institutions/test_comprehensive.py` | 39 | Auth (register/login/logout/me), student dashboard & enrollment, lecturer session management, admin CRUD, full attendance flow, RBAC |
| `institutions/test_onboarding.py` | 20 | Student / Lecturer / Admin onboarding endpoint, preferences, course enrollment |
| `analytics/tests.py` | 2 | Student dashboard analytics view |
| `notifications/tests.py` | — | Notification service |
| `exam_clearance/tests.py` | — | Exam clearance logic |
| `reports/tests.py` | — | Report generation |
| `system/tests.py` | — | System stats |

---

### Frontend Unit Tests (Vitest + React Testing Library)

Unit tests live in `frontend/src/test/` and use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

#### Prerequisites

```bash
cd frontend
npm install
```

#### Running the tests

```bash
# Run all unit tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

#### What's covered

| File | Tests | Description |
|---|---|---|
| `src/test/services.tokenManager.test.ts` | 12 | `tokenManager` – localStorage / sessionStorage split, `rememberMe`, `clearTokens` |
| `src/test/services.authApi.test.ts` | 9 | `authApi` – login, register, logout, `getCurrentUser`, `isAuthenticated` |
| `src/test/services.attendanceApi.test.ts` | 10 | `sessionApi`, `attendanceApi`, `courseApi` – CRUD, check-in, check-in-by-code |
| `src/test/hooks.useAuth.test.tsx` | 8 | `useCurrentUser`, `useLogin`, `useLogout`, `useRegister` hooks |
| `src/test/hooks.useCompleteOnboarding.test.tsx` | 5 | `useCompleteOnboarding` hook – all roles, error state, cache update |
| `src/test/components.ProtectedRoute.test.tsx` | 5 | `ProtectedRoute` – loading spinner, unauthenticated redirect, role guard |

---

### Frontend E2E Tests (Playwright)

End-to-end tests live in `frontend/e2e/` and use [Playwright](https://playwright.dev/). All backend API calls are mocked via `page.route()` interception — **no live backend is required**.

#### Prerequisites

```bash
cd frontend
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

#### Running the E2E tests

```bash
# Run all E2E tests (auto-starts the Vite dev server)
npm run test:e2e

# Run with the interactive Playwright UI
npm run test:e2e:ui

# Run a single spec file
npx playwright test e2e/student.spec.ts
npx playwright test e2e/lecturer.spec.ts
npx playwright test e2e/admin.spec.ts
npx playwright test e2e/attendance.spec.ts
npx playwright test e2e/onboarding.spec.ts

# Run against an already-running dev server
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

#### What's covered

| Spec | Description |
|---|---|
| `e2e/student.spec.ts` | Student login → `/dashboard` redirect, stats render, course display, navigation |
| `e2e/lecturer.spec.ts` | Lecturer login, dashboard, sessions page, create-session access, student blocked from lecturer routes |
| `e2e/admin.spec.ts` | Admin login, management pages (users, institutions, venues), student/lecturer blocked from admin routes |
| `e2e/attendance.spec.ts` | **Full attendance flow**: lecturer creates session → student visits `/check-in/<code>` → marks attendance → PRESENT confirmation; unauthenticated user redirected to `/login`; full two-context browser scenario |
| `e2e/onboarding.spec.ts` | New user redirected to `/onboarding`; student/lecturer/admin role selection; onboarding API called on submit; navigation to `/dashboard` after completion |

#### Shared helpers (`e2e/helpers.ts`)

All E2E specs share:
- **Fixture data** – `STUDENT_USER`, `LECTURER_USER`, `ADMIN_USER`, `MOCK_COURSE`, `MOCK_SESSION`, `MOCK_ATTENDANCE`
- **`loginAs(page, user)`** – injects access token + mocks all API routes for the given user
- **`mockApiForUser(page, user)`** – sets up route interceptions for every API endpoint the app calls

---

### Continuous Integration

The test commands map to the following CI steps:

```yaml
# Backend
- run: cd backend && python manage.py test --verbosity=2

# Frontend unit tests
- run: cd frontend && npm ci && npm test

# E2E tests (with pre-built frontend)
- run: cd frontend && npm ci && npx playwright install --with-deps chromium
- run: cd frontend && npm run build && npm run test:e2e
```

---

**Proprietary Software - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited. See the [LICENSE](LICENSE) file for full details.

<div align="center">
  <p>Made with ❤️ for modern education.</p>
</div>
