import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { StudentHomeMobile } from './student/StudentHomeMobile';
import { LecturerHomeMobile } from './lecturer/LecturerHomeMobile';
import { AdminHomeMobile } from './admin/AdminHomeMobile';

export const MobileDashboardHome: React.FC = () => {
  const { data: user } = useCurrentUser();

  if (!user) return null;

  switch (user.role) {
    case UserRole.STUDENT:
    case UserRole.CLASS_REP:
      return <StudentHomeMobile />;
    case UserRole.LECTURER:
      return <LecturerHomeMobile />;
    case UserRole.ADMIN:
      return <AdminHomeMobile />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};
