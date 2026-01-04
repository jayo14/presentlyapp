import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/queryClient';
import { UserRole } from './types';
import { useCurrentUser, useLogout } from './hooks/useAuth';
import { Toaster } from 'sonner';

// Eager load critical components for initial page
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Layout } from './components/Layout';
import { ServiceWorkerUpdateNotifier } from './components/ServiceWorkerUpdateNotifier';

// Lazy load less critical components
const Onboarding = lazy(() => import('./components/Auth/Onboarding').then(module => ({ default: module.Onboarding })));
const EmailVerificationSent = lazy(() => import('./components/Auth/EmailVerificationSent').then(module => ({ default: module.EmailVerificationSent })));
const VerifyEmail = lazy(() => import('./components/Auth/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const AuthCallback = lazy(() => import('./components/Auth/Callback').then(module => ({ default: module.AuthCallback })));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const StudentDashboard = lazy(() => import('./components/Dashboard/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const LecturerDashboard = lazy(() => import('./components/Dashboard/LecturerDashboard').then(module => ({ default: module.LecturerDashboard })));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ClassRepDashboard = lazy(() => import('./components/Dashboard/ClassRepDashboard').then(module => ({ default: module.ClassRepDashboard })));
const ProfilePage = lazy(() => import('./components/Profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
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
const VenueManagement = lazy(() => import('./components/Admin/VenueManagement').then(module => ({ default: module.VenueManagement })));
const DepartmentManagement = lazy(() => import('./components/Admin/DepartmentManagement').then(module => ({ default: module.DepartmentManagement })));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading content">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
      <p className="text-zinc-400">Loading...</p>
    </div>
  </div>
);

// Wrapper for Layout to handle props from context/hooks
const DashboardLayout: React.FC = () => {
    const { data: user, isLoading } = useCurrentUser();
    const logoutMutation = useLogout();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine current page from URL
    const pathParts = location.pathname.split('/');
    const currentPage = pathParts.length > 2 ? pathParts[2] : 'dashboard';

    const handleLogout = async () => {
        logoutMutation.mutate();
    };

    const handlePageChange = (page: string) => {
         if (page === 'dashboard') navigate('/dashboard');
         else navigate(`/dashboard/${page}`);
    };

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
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user && !user.onboarding_complete) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={() => navigate('/register')} onLogin={() => navigate('/login')} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/email-verification" element={<EmailVerificationSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
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
                  ) : <Navigate to="/unauthorized" replace />
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <ServiceWorkerUpdateNotifier />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;