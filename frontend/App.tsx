import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/queryClient';
import { UserRole } from './types';
import { useCurrentUser, useLogout } from './hooks/useAuth';

// Eager load critical components for initial page
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Layout } from './components/Layout';

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
const AiAssistant = lazy(() => import('./components/Dashboard/AiAssistant').then(module => ({ default: module.AiAssistant })));
const SettingsPage = lazy(() => import('./components/Settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotFound = lazy(() => import('./components/NotFound').then(module => ({ default: module.NotFound })));
const UnauthorizedPage = lazy(() => import('./components/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading content">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
      <p className="text-zinc-400">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const logoutMutation = useLogout();
  const [dashboardPage, setDashboardPage] = useState('dashboard');
  const [previousRole, setPreviousRole] = useState<UserRole | null>(null);

  // Poll for user role changes every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const pollInterval = setInterval(() => {
      refetch();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user, refetch]);

  // Detect role changes and reset dashboard page
  useEffect(() => {
    if (user && previousRole && user.role !== previousRole) {
      // Role has changed, reset to main dashboard view
      setDashboardPage('dashboard');
      // Force re-render by staying on dashboard route
      navigate('/dashboard', { replace: true });
    }
    if (user) {
      setPreviousRole(user.role);
    }
  }, [user, previousRole, navigate]);

  useEffect(() => {
    if (!isLoading && user && !user.onboarding_complete) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleDashboardNavChange = (page: string) => {
    setDashboardPage(page);
  };

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  const renderDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case UserRole.STUDENT:
        return <StudentDashboard userName={user.full_name} view={dashboardPage} />;
      case UserRole.LECTURER:
        return <LecturerDashboard userName={user.full_name} view={dashboardPage} />;
      case UserRole.ADMIN:
        return <AdminDashboard userName={user.full_name} view={dashboardPage} />;
      case UserRole.CLASS_REP:
        return <ClassRepDashboard userName={user.full_name} view={dashboardPage} />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
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
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user && (
                <Layout
                  userRole={user.role}
                  userName={user.full_name}
                  onLogout={handleLogout}
                  currentPage={dashboardPage}
                  setCurrentPage={handleDashboardNavChange}
                >
                  {dashboardPage === 'profile' && <ProfilePage userRole={user.role} userName={user.full_name} />}
                  {dashboardPage === 'notifications' && <NotificationsPage />}
                  {dashboardPage === 'settings' && <SettingsPage userRole={user.role} onLogout={handleLogout} />}
                  {dashboardPage !== 'profile' && dashboardPage !== 'notifications' && dashboardPage !== 'settings' && renderDashboard()}
                  <AiAssistant />
                </Layout>
              )}
            </ProtectedRoute>
          }
        />
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFound onBack={() => navigate('/')} />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;