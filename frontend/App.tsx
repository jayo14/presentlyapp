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

// Eager load critical components for initial page
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Layout } from './components/Layout';
import { ServiceWorkerUpdateNotifier } from './components/ServiceWorkerUpdateNotifier';
import { UniversitiesPage } from './components/universities/UniversitiesPage';
import { UniversityLandingPage } from './components/universities/UniversityLandingPage';
import { BlogListPage } from './components/blog/BlogListPage';
import { BlogPostPage } from './components/blog/BlogPostPage';

// Lazy load less critical components
import { LoadingScreen } from './components/LoadingScreen';

// Wrapper to handle dynamic import failures (e.g. ERR_NETWORK_CHANGED or chunk missing after deploy)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload() as unknown as any;
      }
      throw error;
    }
  });

const LandingPage = lazyWithRetry(() => import('./components/EnhancedLandingPage').then(m => ({ default: m.default || m })));
const DocumentationPage = lazyWithRetry(() => import('./components/DocumentationPage').then(m => ({ default: m.DocumentationPage })));
const VolunteersPage = lazyWithRetry(() => import('./components/VolunteersPage').then(m => ({ default: m.VolunteersPage })));
const FeaturesPage = lazyWithRetry(() => import('./components/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const HowItWorksPage = lazyWithRetry(() => import('./components/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const Onboarding = lazyWithRetry(() => import('./components/Auth/Onboarding').then(module => ({ default: module.Onboarding })));
const EmailVerificationSent = lazyWithRetry(() => import('./components/Auth/EmailVerificationSent').then(module => ({ default: module.EmailVerificationSent })));
const VerifyEmail = lazyWithRetry(() => import('./components/Auth/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const OTPVerification = lazyWithRetry(() => import('./components/Auth/OTPVerification').then(module => ({ default: module.OTPVerification })));
const AuthCallback = lazyWithRetry(() => import('./components/Auth/Callback').then(module => ({ default: module.AuthCallback })));
const ForgotPassword = lazyWithRetry(() => import('./components/Auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazyWithRetry(() => import('./components/Auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const StudentDashboard = lazyWithRetry(() => import('./components/Dashboard/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const StudentCoursesPage = lazyWithRetry(() => import('./components/Student/StudentCoursesPage').then(module => ({ default: module.default })));
const LecturerDashboard = lazyWithRetry(() => import('./components/Dashboard/LecturerDashboard').then(module => ({ default: module.LecturerDashboard })));
const CreateSessionPage = lazyWithRetry(() => import('./components/Attendance/CreateSessionPage').then(module => ({ default: module.CreateSessionPage })));
const AdminDashboard = lazyWithRetry(() => import('./components/Dashboard/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ClassRepDashboard = lazyWithRetry(() => import('./components/Dashboard/ClassRepDashboard').then(module => ({ default: module.ClassRepDashboard })));
const ProfilePage = lazyWithRetry(() => import('./components/Profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SessionsPage = lazyWithRetry(() => import('./components/Dashboard/SessionsPage').then(module => ({ default: module.SessionsPage })));
const PublicCheckInPage = lazyWithRetry(() => import('./components/Attendance/PublicCheckInPage').then(module => ({ default: module.PublicCheckInPage })));
const NotificationsPage = lazyWithRetry(() => import('./components/Notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const SettingsPage = lazyWithRetry(() => import('./components/Settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotFound = lazyWithRetry(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));
const UnauthorizedPage = lazyWithRetry(() => import('./components/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const ProtectedRoute = lazyWithRetry(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));

// Admin Components
const InstitutionManagement = lazyWithRetry(() => import('./components/Admin/InstitutionManagement').then(module => ({ default: module.InstitutionManagement })));
const InstitutionFormPage = lazyWithRetry(() => import('./components/Admin/InstitutionFormPage').then(module => ({ default: module.InstitutionFormPage })));
const CollegeFormPage = lazyWithRetry(() => import('./components/Admin/CollegeFormPage').then(module => ({ default: module.CollegeFormPage })));
const DepartmentFormPage = lazyWithRetry(() => import('./components/Admin/DepartmentFormPage').then(module => ({ default: module.DepartmentFormPage })));
const UserManagement = lazyWithRetry(() => import('./components/Admin/UserManagement').then(module => ({ default: module.UserManagement })));
const CourseManagement = lazyWithRetry(() => import('./components/Admin/CourseManagement').then(module => ({ default: module.CourseManagement })));
const VenueManagement = lazyWithRetry(() => import('./components/Admin/VenueManagement'));
const DepartmentManagement = lazyWithRetry(() => import('./components/Admin/DepartmentManagement').then(module => ({ default: module.DepartmentManagement })));
const BlogManagement = lazyWithRetry(() => import('./components/Admin/BlogManagement').then(module => ({ default: module.BlogManagement })));
const StaffManagement = lazyWithRetry(() => import('./components/Admin/StaffManagement').then(module => ({ default: module.StaffManagement })));
const AcceptInvitePage = lazyWithRetry(() => import('./components/Auth/AcceptInvitePage').then(module => ({ default: module.AcceptInvitePage })));

// Loading fallback component
const LoadingFallback: React.FC = () => <LoadingScreen message="Loading..." />;

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

    if (isLoading) return <LoadingFallback />;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <Layout
            userRole={user.role}
            userName={user.full_name}
            onLogout={handleLogout}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
        >
            <Outlet context={{ onLogout: handleLogout }} />
        </Layout>
    );
};

const DashboardHome: React.FC = () => {
    const { data: user } = useCurrentUser();
    
    if (!user) return null;

    switch (user.role) {
        case UserRole.STUDENT:
            return <StudentDashboard userName={user.full_name} view="dashboard" />;
        case UserRole.LECTURER:
            return <LecturerDashboard userName={user.full_name} userProfile={user} view="dashboard" />;
        case UserRole.ADMIN:
            return <AdminDashboard userName={user.full_name} view="dashboard" />;
        case UserRole.CLASS_REP:
            return <ClassRepDashboard userName={user.full_name} view="dashboard" />;
        default:
            return <Navigate to="/unauthorized" replace />;
    }
};

// Admin Route Guard
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

  if (isLoading && !loadTimeout) {
    return <LoadingFallback />;
  }

  if (isError && !user) {
    console.error('[AppContent] Auth error detected');
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/email-verification" element={<EmailVerificationSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/check-in/:sessionCode" element={<Suspense fallback={<LoadingFallback />}><PublicCheckInPage /></Suspense>} />
          <Route path="/accept-invite" element={<Suspense fallback={<LoadingFallback />}><AcceptInvitePage /></Suspense>} />
          
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
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Common Routes with RBAC */}
              <Route path="analytics" element={
                  user?.role === UserRole.LECTURER ? (
                      <LecturerRoute><LecturerDashboard userName={user.full_name} userProfile={user} view="analytics" /></LecturerRoute>
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
                      <AdminRoute><CourseManagement /></AdminRoute>
                  ) : user?.role === UserRole.LECTURER ? (
                      <LecturerRoute><LecturerDashboard userName={user.full_name} userProfile={user} view="courses" /></LecturerRoute>
                  ) : user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP ? (
                      <ProtectedRoute><StudentCoursesPage userName={user?.full_name || ''} /></ProtectedRoute>
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

              <Route path="sessions/new" element={
                  <LecturerRoute><CreateSessionPage /></LecturerRoute>
              } />

              <Route path="timetable" element={
                  user?.role === UserRole.LECTURER ? (
                      <LecturerRoute><LecturerDashboard userName={user.full_name} userProfile={user} view="timetable" /></LecturerRoute>
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
              <Route path="institutions" element={<AdminRoute requiredPermission="system.settings.manage"><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/new" element={<AdminRoute requiredPermission="system.settings.manage"><InstitutionFormPage /></AdminRoute>} />
              <Route path="institutions/:id" element={<AdminRoute requiredPermission="system.settings.manage"><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/:id/edit" element={<AdminRoute requiredPermission="system.settings.manage"><InstitutionFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/new" element={<AdminRoute requiredPermission="system.settings.manage"><CollegeFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId" element={<AdminRoute requiredPermission="system.settings.manage"><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/edit" element={<AdminRoute requiredPermission="system.settings.manage"><CollegeFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/new" element={<AdminRoute requiredPermission="system.settings.manage"><DepartmentFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/:deptId/edit" element={<AdminRoute requiredPermission="system.settings.manage"><DepartmentFormPage /></AdminRoute>} />
              <Route path="users" element={<AdminRoute requiredPermission="system.users.manage"><UserManagement /></AdminRoute>} />
              <Route path="staff" element={<AdminRoute requiredPermission="system.staff.manage"><StaffManagement /></AdminRoute>} />
              <Route path="venues" element={<AdminRoute requiredPermission="venues.view"><VenueManagement /></AdminRoute>} />
              <Route path="departments" element={<AdminRoute requiredPermission="system.settings.manage"><DepartmentManagement /></AdminRoute>} />
              <Route path="blog" element={<AdminRoute requiredPermission="blog.view"><BlogManagement /></AdminRoute>} />
              <Route path="logs" element={<AdminRoute requiredPermission="system.analytics.view"><AdminDashboard userName={user?.full_name || ''} view="logs" /></AdminRoute>} />

              {/* Lecturer Specific Routes */}
              <Route path="reports" element={<LecturerRoute><LecturerDashboard userName={user?.full_name || ''} userProfile={user} view="reports" /></LecturerRoute>} />

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
      const minimumSplashMs = 2200;
      const requestTimeoutMs = 5000;
      const startedAt = Date.now();
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        await fetch(getHealthEndpoint(), {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
      } catch (err) {
        console.log('Waking server...');
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

  if (isBootstrapping) {
    return <LoadingScreen message="Preparing your dashboard..." />;
  }

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineIndicator />
          <Toaster position="top-right" richColors closeButton />
          <ServiceWorkerUpdateNotifier />
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;