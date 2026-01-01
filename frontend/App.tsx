import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/queryClient';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Onboarding } from './components/Auth/Onboarding';
import { EmailVerificationSent } from './components/Auth/EmailVerificationSent';
import { VerifyEmail } from './components/Auth/VerifyEmail';
import { AuthCallback } from './components/Auth/Callback';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { ResetPassword } from './components/Auth/ResetPassword';
import { Layout } from './components/Layout';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { LecturerDashboard } from './components/Dashboard/LecturerDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { ClassRepDashboard } from './components/Dashboard/ClassRepDashboard';
import { ProfilePage } from './components/Profile/ProfilePage';
import { NotificationsPage } from './components/Notifications/NotificationsPage';
import { AiAssistant } from './components/Dashboard/AiAssistant';
import { SettingsPage } from './components/Settings/SettingsPage';
import { NotFound } from './components/NotFound';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';
import { useCurrentUser, useLogout } from './hooks/useAuth';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [dashboardPage, setDashboardPage] = useState('dashboard');

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
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