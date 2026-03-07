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

// Eager load critical components for initial page
import LandingPage from './components/EnhancedLandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Layout } from './components/Layout';
import { ServiceWorkerUpdateNotifier } from './components/ServiceWorkerUpdateNotifier';
import { DocumentationPage } from './components/DocumentationPage';
import { VolunteersPage } from './components/VolunteersPage';

// Lazy load less critical components
import { LoadingScreen } from './components/LoadingScreen';
const Onboarding = lazy(() => import('./components/Auth/Onboarding').then(module => ({ default: module.Onboarding })));
const EmailVerificationSent = lazy(() => import('./components/Auth/EmailVerificationSent').then(module => ({ default: module.EmailVerificationSent })));
const VerifyEmail = lazy(() => import('./components/Auth/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const OTPVerification = lazy(() => import('./components/Auth/OTPVerification').then(module => ({ default: module.OTPVerification })));
const AuthCallback = lazy(() => import('./components/Auth/Callback').then(module => ({ default: module.AuthCallback })));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const StudentDashboard = lazy(() => import('./components/Dashboard/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const StudentCoursesPage = lazy(() => import('./components/Student/StudentCoursesPage').then(module => ({ default: module.default })));
const LecturerDashboard = lazy(() => import('./components/Dashboard/LecturerDashboard').then(module => ({ default: module.LecturerDashboard })));
const CreateSessionPage = lazy(() => import('./components/Attendance/CreateSessionPage').then(module => ({ default: module.CreateSessionPage })));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ClassRepDashboard = lazy(() => import('./components/Dashboard/ClassRepDashboard').then(module => ({ default: module.ClassRepDashboard })));
const ProfilePage = lazy(() => import('./components/Profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SessionsPage = lazy(() => import('./components/Dashboard/SessionsPage').then(module => ({ default: module.SessionsPage })));
const PublicCheckInPage = lazy(() => import('./components/Attendance/PublicCheckInPage').then(module => ({ default: module.PublicCheckInPage })));
const NotificationsPage = lazy(() => import('./components/Notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const SettingsPage = lazy(() => import('./components/Settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotFound = lazy(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));
const UnauthorizedPage = lazy(() => import('./components/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));

// Admin Components
const InstitutionManagement = lazy(() => import('./components/Admin/InstitutionManagement').then(module => ({ default: module.InstitutionManagement })));
const InstitutionFormPage = lazy(() => import('./components/Admin/InstitutionFormPage').then(module => ({ default: module.InstitutionFormPage })));
const CollegeFormPage = lazy(() => import('./components/Admin/CollegeFormPage').then(module => ({ default: module.CollegeFormPage })));
const DepartmentFormPage = lazy(() => import('./components/Admin/DepartmentFormPage').then(module => ({ default: module.DepartmentFormPage })));
const UserManagement = lazy(() => import('./components/Admin/UserManagement').then(module => ({ default: module.UserManagement })));
const CourseManagement = lazy(() => import('./components/Admin/CourseManagement').then(module => ({ default: module.CourseManagement })));
const VenueManagement = lazy(() => import('./components/Admin/VenueManagement'));
const DepartmentManagement = lazy(() => import('./components/Admin/DepartmentManagement').then(module => ({ default: module.DepartmentManagement })));

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
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || user.role !== UserRole.ADMIN) return <Navigate to="/unauthorized" replace />;

    return <>{children}</>;
};

// Lecturer Route Guard
const LecturerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || user.role !== UserRole.LECTURER) return <Navigate to="/unauthorized" replace />;

    return <>{children}</>;
};

// Class Rep Route Guard
const ClassRepRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: user, isLoading } = useCurrentUser();
    
    if (isLoading) return <LoadingFallback />;
    if (!user || (user.role !== UserRole.CLASS_REP && user.role !== UserRole.ADMIN)) return <Navigate to="/unauthorized" replace />;

    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
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
    if (!isLoading && user && !user.onboarding_complete) {
      console.log('[AppContent] Redirecting to onboarding');
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, navigate]);

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
          <Route path="/" element={<LandingPage onGetStarted={() => navigate('/register')} onLogin={() => navigate('/login')} />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
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
          
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
                  ) : <Navigate to="/unauthorized" replace />
              } />

              <Route path="courses" element={
                  user?.role === UserRole.ADMIN ? (
                      <AdminRoute><CourseManagement /></AdminRoute>
                  ) : user?.role === UserRole.LECTURER ? (
                      <LecturerRoute><LecturerDashboard userName={user.full_name} userProfile={user} view="courses" /></LecturerRoute>
                  ) : user?.role === UserRole.STUDENT || user?.role === UserRole.CLASS_REP ? (
                      <ProtectedRoute><StudentCoursesPage userName={user?.full_name || ''} /></ProtectedRoute>
                  ) : <Navigate to="/unauthorized" replace />
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
                  ) : <Navigate to="/unauthorized" replace />
              } />

              {/* Admin Specific Routes */}
              <Route path="institutions" element={<AdminRoute><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/new" element={<AdminRoute><InstitutionFormPage /></AdminRoute>} />
              <Route path="institutions/:id" element={<AdminRoute><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/:id/edit" element={<AdminRoute><InstitutionFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/new" element={<AdminRoute><CollegeFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId" element={<AdminRoute><InstitutionManagement /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/edit" element={<AdminRoute><CollegeFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/new" element={<AdminRoute><DepartmentFormPage /></AdminRoute>} />
              <Route path="institutions/:id/colleges/:collegeId/departments/:deptId/edit" element={<AdminRoute><DepartmentFormPage /></AdminRoute>} />
              <Route path="users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="venues" element={<AdminRoute><VenueManagement /></AdminRoute>} />
              <Route path="departments" element={<AdminRoute><DepartmentManagement /></AdminRoute>} />
              <Route path="logs" element={<AdminRoute><AdminDashboard userName={user?.full_name || ''} view="logs" /></AdminRoute>} />

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
  // Initialize offline sync manager
  useEffect(() => {
    offlineSyncManager.init();
    return () => offlineSyncManager.cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineIndicator />
        <Toaster position="top-right" richColors closeButton />
        <ServiceWorkerUpdateNotifier />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;