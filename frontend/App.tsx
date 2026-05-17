import TermsOfService from './components/Legal/TermsOfService';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/queryClient';
import { UserRole } from './types';
import { useCurrentUser, useLogout } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { offlineSyncManager } from './src/utils/offlineSync';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './components/ThemeProvider';
import { AnalyticsTracker } from './components/Analytics/AnalyticsTracker';
import { useBreakpoint } from './hooks/useBreakpoint';

// Eager load critical components for initial page
import { LoginMobile } from './components/mobile/auth/LoginMobile';
import { RegisterMobile } from './components/mobile/auth/RegisterMobile';
import { Login as LoginDesktop } from './components/Auth/Login';
import { Register as RegisterDesktop } from './components/Auth/Register';
import { Layout } from './components/Layout';
import { MobileLayout } from './components/mobile/MobileLayout';
import { ServiceWorkerUpdateNotifier } from './components/ServiceWorkerUpdateNotifier';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

import { UniversitiesPage } from './components/universities/UniversitiesPage';
import { UniversityLandingPage } from './components/universities/UniversityLandingPage';
import { BlogListPage } from './components/blog/BlogListPage';
import { BlogPostPage } from './components/blog/BlogPostPage';

// Lazy load less critical components
import { LoadingScreen } from './components/LoadingScreen';

// Eager load critical dashboard components (no lazy loading to avoid infinite reload loops)
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { LecturerDashboard } from './components/Dashboard/LecturerDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { ClassRepDashboard } from './components/Dashboard/ClassRepDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProfileMobile as ProfilePage } from './components/mobile/ProfileMobile';
import { AttendanceReport as ReportsPage } from './components/Dashboard/AttendanceReport';
import { SessionsPage } from './components/Dashboard/SessionsPage';



// Mobile Components
import { MobileDashboardHome } from './components/mobile/MobileDashboardHome';
import { StudentCoursesMobile } from './components/mobile/student/StudentCoursesMobile';
import { AttendanceScannerMobile } from './components/mobile/student/AttendanceScannerMobile';
import { LecturerReportsMobile } from './components/mobile/lecturer/LecturerReportsMobile';
import { InstitutionManagementMobile } from './components/mobile/admin/InstitutionManagementMobile';
import { UserManagementMobile } from './components/mobile/admin/UserManagementMobile';
import { VenueManagementMobile } from './components/mobile/admin/VenueManagementMobile';
import { DepartmentManagementMobile } from './components/mobile/admin/DepartmentManagementMobile';
import { CourseManagementMobile } from './components/mobile/admin/CourseManagementMobile';
import { CourseRegistrationMobile } from './components/mobile/student/CourseRegistrationMobile';




// Simple lazy loader with no reload on error (show error boundary instead)
const simpleLazy = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      const component = await componentImport();
      return component;
    } catch (error) {
      console.error('Failed to load component:', error);
      // Don't reload - let error boundary handle it
      throw error;
    }
  });

const LandingPage = simpleLazy(() => import('./components/EnhancedLandingPage').then(m => ({ default: m.default || m })));
const DocumentationPage = simpleLazy(() => import('./components/DocumentationPage').then(m => ({ default: m.DocumentationPage })));
const VolunteersPage = simpleLazy(() => import('./components/VolunteersPage').then(m => ({ default: m.VolunteersPage })));
const FeaturesPage = simpleLazy(() => import('./components/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const HowItWorksPage = simpleLazy(() => import('./components/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const Onboarding = simpleLazy(() => import('./components/Auth/Onboarding').then(module => ({ default: module.Onboarding })));
const EmailVerificationSent = simpleLazy(() => import('./components/Auth/EmailVerificationSent').then(module => ({ default: module.EmailVerificationSent })));
const VerifyEmail = simpleLazy(() => import('./components/Auth/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const OTPVerification = simpleLazy(() => import('./components/mobile/auth/OTPVerificationMobile').then(module => ({ default: module.OTPVerificationMobile })));
const AuthCallback = simpleLazy(() => import('./components/Auth/Callback').then(module => ({ default: module.AuthCallback })));
const ForgotPassword = simpleLazy(() => import('./components/Auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = simpleLazy(() => import('./components/mobile/auth/ResetPasswordMobile').then(module => ({ default: module.ResetPasswordMobile })));

const StudentCoursesPage = simpleLazy(() => import('./components/Student/StudentCoursesPage').then(module => ({ default: module.default })));
const CreateSessionPage = simpleLazy(() => import('./components/Attendance/CreateSessionPage').then(module => ({ default: module.CreateSessionPage })));
const PublicCheckInPage = simpleLazy(() => import('./components/Attendance/PublicCheckInPage').then(module => ({ default: module.PublicCheckInPage })));

const NotificationsPage = simpleLazy(() => import('./components/Notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const SettingsPage = simpleLazy(() => import('./components/Settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotFound = simpleLazy(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));
const UnauthorizedPage = simpleLazy(() => import('./components/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const DevicesPage = simpleLazy(() => import('./components/Security/DevicesPage').then(module => ({ default: module.DevicesPage })));

// Admin Components
const InstitutionManagement = simpleLazy(() => import('./components/Admin/InstitutionManagement').then(module => ({ default: module.InstitutionManagement })));
const InstitutionFormPage = simpleLazy(() => import('./components/Admin/InstitutionFormPage').then(module => ({ default: module.InstitutionFormPage })));
const CollegeFormPage = simpleLazy(() => import('./components/Admin/CollegeFormPage').then(module => ({ default: module.CollegeFormPage })));
const DepartmentFormPage = simpleLazy(() => import('./components/Admin/DepartmentFormPage').then(module => ({ default: module.DepartmentFormPage })));
const UserManagement = simpleLazy(() => import('./components/Admin/UserManagement').then(module => ({ default: module.UserManagement })));
const CourseManagement = simpleLazy(() => import('./components/Admin/CourseManagement').then(module => ({ default: module.CourseManagement })));
const VenueManagement = simpleLazy(() => import('./components/Admin/VenueManagement'));
const DepartmentManagement = simpleLazy(() => import('./components/Admin/DepartmentManagement').then(module => ({ default: module.DepartmentManagement })));
const BlogManagement = simpleLazy(() => import('./components/Admin/BlogManagement').then(module => ({ default: module.BlogManagement })));
const StaffManagement = simpleLazy(() => import('./components/Admin/StaffManagement').then(module => ({ default: module.StaffManagement })));
const EmailMonitor = simpleLazy(() => import('./components/Admin/EmailMonitor').then(module => ({ default: module.EmailMonitor })));
const SystemConfiguration = simpleLazy(() => import("./components/Admin/SystemConfiguration").then(m => ({ default: m.default })));
const AcceptInvitePage = simpleLazy(() => import('./components/Auth/AcceptInvitePage').then(module => ({ default: module.AcceptInvitePage })));

const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/documentation',
  '/volunteers',
  '/features',
  '/how-it-works',
  '/universities',
  '/blog',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/auth/callback',
  '/email-verification',
  '/verify-email',
  '/otp-verification',
  '/check-in',
  '/accept-invite',
];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_ROUTE_PREFIXES.some((page) =>
    page === '/' ? pathname === '/' : pathname.startsWith(page),
  );

// Loading fallback component - for authenticated/protected routes only
const LoadingFallback: React.FC = () => <LoadingScreen message="Loading..." showOnPublicPages={false} />;

// Public routes should not display the preloader.
const PublicLoadingFallback: React.FC = () => null;

// Responsive Auth Wrapper
const ResponsiveAuth: React.FC<{ Mobile: React.FC; Desktop: React.FC }> = ({ Mobile, Desktop }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <Mobile /> : <Desktop />;
};

const warmUpBackend = () => {

  const rawApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!rawApi) return;

  const backendBase = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;
  fetch(`${backendBase}/warmup/`, {
    method: 'GET',
    signal: AbortSignal.timeout(40000),
  }).catch(() => {});
};

warmUpBackend();

// Wrapper for Layout to handle props from context/hooks
const DashboardLayout: React.FC = () => {
    const { data: user, isLoading } = useCurrentUser();
    const logoutMutation = useLogout();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine current page directly from URL to avoid state sync loops
    const pathParts = location.pathname.split('/');
    const currentPage = pathParts.length > 2 && pathParts[1] === 'dashboard' ? pathParts[2] : 'dashboard';

    const handleLogout = useCallback(() => {
        logoutMutation.mutate();
    }, [logoutMutation]);

    const handlePageChange = useCallback((page: string) => {
         const targetPath = page === 'dashboard' ? '/dashboard' : `/dashboard/${page}`;
         if (location.pathname !== targetPath) {
            navigate(targetPath);
         }
    }, [navigate, location.pathname]);

    // Only show loading on first load when no cached user is available.
    if (isLoading && !user) return <LoadingFallback />;
    if (!isLoading && !user) return <Navigate to="/login" replace />;
    const activeUser = user as NonNullable<typeof user>;

    return (
        <Layout
            userRole={activeUser.role as UserRole}
            userName={activeUser.full_name}
            onLogout={handleLogout}
            currentPage={currentPage}
        >
            <Outlet context={{ onLogout: handleLogout }} />
        </Layout>
    );
};


const DashboardHome: React.FC = () => {
    const { data: user } = useCurrentUser();
    const isMobile = useBreakpoint('md');

    if (isMobile) return <MobileDashboardHome />;

    if (user?.role === UserRole.ADMIN) return <AdminDashboard userName={user.full_name} />;
    if (user?.role === UserRole.LECTURER) return <LecturerDashboard userName={user.full_name} />;
    if (user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP) return <StudentDashboard userName={user.full_name} />;
    return null;
};

const AdminRoute: React.FC<{ children: React.ReactNode; requiredPermission?: string }> = ({ children, requiredPermission }) => {
    const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || user.role !== UserRole.ADMIN) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            message: 'This admin page is restricted to administrator accounts.',
            requiredRole: [UserRole.ADMIN],
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }

    if (requiredPermission) {
      const perms = user.permissions;
      const hasRequired = Array.isArray(perms) ? perms.includes(requiredPermission) : true;
      if (!hasRequired) {
        return (
          <Navigate
            to="/unauthorized"
            state={{
              message: 'Your account does not have permission to access this admin page.',
              requiredPermission,
              attemptedPath: location.pathname,
            }}
            replace
          />
        );
      }
    }

    return <>{children}</>;
};

// Lecturer Route Guard
const LecturerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || user.role !== UserRole.LECTURER) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            message: 'This page is available only to lecturers.',
            requiredRole: [UserRole.LECTURER],
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }

    return <>{children}</>;
};

// Class Rep Route Guard
const ClassRepRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || (user.role !== UserRole.CLASS_REP && user.role !== UserRole.ADMIN)) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            message: 'This page is available only to class representatives.',
            requiredRole: [UserRole.CLASS_REP, UserRole.ADMIN],
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }

    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, isError } = useCurrentUser();
  const [loadTimeout, setLoadTimeout] = useState(false);

  const isPublicRoute = isPublicPath(location.pathname);

  // Safeguard: If loading takes too long (e.g., 10 seconds), show content anyway or an error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('[AppContent] Loading is taking too long, triggering safeguard.');
        setLoadTimeout(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !user) return;

    const authFlowRoutes = ['/otp-verification', '/email-verification', '/verify-email'];
    const onAuthFlowRoute = authFlowRoutes.some((route) => location.pathname.startsWith(route));

    if (!user.email_verified && !onAuthFlowRoute) {
      navigate(`/otp-verification?email=${encodeURIComponent(user.email)}`, { replace: true });
      return;
    }

    if (user.email_verified && !user.onboarding_complete && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
      return;
    }

    if (user.email_verified && user.onboarding_complete && location.pathname === '/onboarding') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  // For public routes, don't show loading screen on initial load
  if (isLoading && !loadTimeout && !isPublicRoute) {
    return <LoadingFallback />;
  }

  if (isError && !user) {
    console.error('[AppContent] Auth error detected');
  }

  return (
    <Suspense fallback={<PublicLoadingFallback />}>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/universities" element={<UniversitiesPage />} />
          <Route path="/universities/:slug" element={<UniversityLandingPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/page/:page" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<ResponsiveAuth Mobile={LoginMobile} Desktop={LoginDesktop} />} />
          <Route path="/register" element={<ResponsiveAuth Mobile={RegisterMobile} Desktop={RegisterDesktop} />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/email-verification" element={<EmailVerificationSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/check-in/:sessionCode" element={<Suspense fallback={<PublicLoadingFallback />}><PublicCheckInPage /></Suspense>} />
          <Route path="/accept-invite" element={<Suspense fallback={<PublicLoadingFallback />}><AcceptInvitePage /></Suspense>} />
          
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireEmailVerified>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireEmailVerified requireOnboardingComplete>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="institutions" element={<div><InstitutionManagementMobile /></div>} />
              <Route path="users" element={<div><UserManagementMobile /></div>} />
              <Route path="venues" element={<div><VenueManagementMobile /></div>} />
              <Route path="departments" element={<div><DepartmentManagementMobile /></div>} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="security" element={<DevicesPage />} />
              
              {/* Common Routes with RBAC */}
              <Route path="analytics" element={
                  user?.role === UserRole.LECTURER ? (
                      <div><LecturerDashboard userName={user.full_name} userProfile={user} view="analytics" /></div>
                  ) : user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP ? (
                      <ProtectedRoute><StudentDashboard userName={user?.full_name || ''} view="analytics" /></ProtectedRoute>
                  ) : (
                    <Navigate
                      to="/unauthorized"
                      state={{
                        message: 'You cannot view analytics for this role.',
                        requiredRole: [UserRole.STUDENT, UserRole.CLASS_REP, UserRole.LECTURER],
                        attemptedPath: '/dashboard/analytics',
                      }}
                      replace
                    />
                  )
              } />

              <Route path="courses" element={
                  user?.role === UserRole.ADMIN ? (
                      <div><CourseManagementMobile /></div>
                  ) : user?.role === UserRole.LECTURER ? (
                      <div><LecturerCoursesMobile /></div>
                  ) : user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP ? (
                      <ProtectedRoute><StudentCoursesMobile /></ProtectedRoute>
                  ) : (

                    <Navigate
                      to="/unauthorized"
                      state={{
                        message: 'You cannot view courses for this role.',
                        requiredRole: [UserRole.STUDENT, UserRole.CLASS_REP, UserRole.LECTURER, UserRole.ADMIN],
                        attemptedPath: '/dashboard/courses',
                      }}
                      replace
                    />
                  )
              } />

              <Route path="courses/register" element={
                  user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP ? (
                      <ProtectedRoute><CourseRegistrationMobile /></ProtectedRoute>
                  ) : (
                    <Navigate to="/unauthorized" replace />
                  )
              } />


              <Route path="scanner" element={<ProtectedRoute><AttendanceScannerMobile /></ProtectedRoute>} />


              <Route path="sessions" element={
                  user?.role === UserRole.LECTURER ? (
                      <div><LecturerSessionsMobile /></div>
                  ) : (
                      <ProtectedRoute><SessionsPage /></ProtectedRoute>
                  )
              } />

              <Route path="reports" element={
                  user?.role === UserRole.LECTURER ? (
                      <div><LecturerReportsMobile /></div>
                  ) : (
                      <ProtectedRoute><ReportsPage /></ProtectedRoute>
                  )
              } />

              <Route path="timetable" element={
                  user?.role === UserRole.LECTURER ? (
                      <div><LecturerDashboard userName={user.full_name} userProfile={user} view="timetable" /></div>
                  ) : user?.role === UserRole.CLASS_REP ? (
                      <ClassRepRoute><ClassRepDashboard userName={user.full_name} view="timetable" /></ClassRepRoute>
                  ) : user?.role === UserRole.STUDENT ? (
                      <ProtectedRoute><StudentDashboard userName={user?.full_name || ''} view="timetable" /></ProtectedRoute>
                  ) : (
                    <Navigate
                      to="/unauthorized"
                      state={{
                        message: 'You cannot view timetable for this role.',
                        requiredRole: [UserRole.STUDENT, UserRole.CLASS_REP, UserRole.LECTURER],
                        attemptedPath: '/dashboard/timetable',
                      }}
                      replace
                    />
                  )
              } />

              {/* Admin Specific Routes */}
              <Route path="institutions" element={<div requiredPermission="system.settings.manage"><InstitutionManagement /></div>} />
              <Route path="institutions/new" element={<div requiredPermission="system.settings.manage"><InstitutionFormPage /></div>} />
              <Route path="institutions/:id" element={<div requiredPermission="system.settings.manage"><InstitutionManagement /></div>} />
              <Route path="institutions/:id/edit" element={<div requiredPermission="system.settings.manage"><InstitutionFormPage /></div>} />
              <Route path="institutions/:id/colleges/new" element={<div requiredPermission="system.settings.manage"><CollegeFormPage /></div>} />
              <Route path="institutions/:id/colleges/:collegeId" element={<div requiredPermission="system.settings.manage"><InstitutionManagement /></div>} />
              <Route path="institutions/:id/colleges/:collegeId/edit" element={<div requiredPermission="system.settings.manage"><CollegeFormPage /></div>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/new" element={<div requiredPermission="system.settings.manage"><DepartmentFormPage /></div>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/:deptId/edit" element={<div requiredPermission="system.settings.manage"><DepartmentFormPage /></div>} />
              <Route path="users" element={<div requiredPermission="system.users.manage"><UserManagement /></div>} />
              <Route path="staff" element={<div requiredPermission="system.staff.manage"><StaffManagement /></div>} />
              <Route path="venues" element={<div requiredPermission="venues.view"><Suspense fallback={<LoadingFallback />}><VenueManagement /></Suspense></div>} />
              <Route path="departments" element={<div requiredPermission="system.settings.manage"><DepartmentManagement /></div>} />
              <Route path="blog" element={<div requiredPermission="blog.view"><BlogManagement /></div>} />
              <Route path="logs" element={<div requiredPermission="system.analytics.view"><AdminDashboard userName={user?.full_name || ''} view="logs" /></div>} />
              <Route path="email-monitor" element={<div requiredPermission="system.analytics.view"><EmailMonitor /></div>} />
              <Route path="config" element={<div requiredPermission="system.settings.manage"><SystemConfiguration /></div>} />

              {/* Lecturer Specific Routes */}
              <Route path="reports" element={<div><LecturerDashboard userName={user?.full_name || ''} userProfile={user} view="reports" /></div>} />

              {/* Class Rep Specific Routes */}
              <Route path="class-mgmt" element={<ClassRepRoute><ClassRepDashboard userName={user?.full_name || ''} view="class-mgmt" /></ClassRepRoute>} />
          </Route>
          
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFound onBack={() => navigate('/')} />} />
        </Routes>
      </main>
    </Suspense>
  );
};

const App: React.FC = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const initialPathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const getHealthEndpoint = () => {
    const rawApi = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
    const apiBase = /\/api$/i.test(rawApi) ? rawApi : `${rawApi}/api`;
    return `${apiBase}/health/`;
  };

  // Initialize offline sync manager
  useEffect(() => {
    offlineSyncManager.init();
    return () => offlineSyncManager.cleanup();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const wakeServer = async () => {
      const minimumSplashMs = 400; // Further reduced for near-instant feel
      const requestTimeoutMs = 3000;
      const startedAt = Date.now();

      // Perform health check in background without blocking the splash screen completion
      // if it takes too long.
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        fetch(getHealthEndpoint(), {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => {}); // Fire and forget
      } finally {
        window.clearTimeout(timeoutId);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, minimumSplashMs - elapsed);
        window.setTimeout(() => {
          if (isMounted) {
            setIsBootstrapping(false);
          }
        }, remaining);
      }
    };

    wakeServer();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isBootstrapping && !isPublicPath(initialPathname)) {
    return <LoadingScreen message="Preparing your dashboard..." />;
  }

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AnalyticsTracker />
          <OfflineIndicator />
          <Toaster position="top-right" richColors closeButton />
          <PWAInstallPrompt />
          <ServiceWorkerUpdateNotifier />
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
