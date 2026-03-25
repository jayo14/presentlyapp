import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
  requireEmailVerified?: boolean;
  requireOnboardingComplete?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireEmailVerified = false,
  requireOnboardingComplete = false,
}) => {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-input border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          message: 'You do not have the required role to view this page.',
          requiredRole: allowedRoles,
          attemptedPath: location.pathname,
        }}
        replace
      />
    );
  }

  if (requireEmailVerified && !user.email_verified) {
    return (
      <Navigate
        to={`/otp-verification?email=${encodeURIComponent(user.email)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireOnboardingComplete && !user.onboarding_complete) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};
