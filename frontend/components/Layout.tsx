import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { DashboardShell } from './Dashboard/DashboardShell';
import { EnhancedAttendanceScanner } from './Attendance/EnhancedAttendanceScanner';
import { MobileLayout } from './mobile/MobileLayout';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface LayoutProps {
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage?: (page: string) => void;
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  userRole,
  userName = "User",
  currentPage,
  onLogout,
  children
}) => {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isMobile = useBreakpoint('md');

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      profile: 'Profile',
      courses: 'Attendance',
      sessions: 'Sessions',
      analytics: 'Analytics',
      timetable: 'Timetable',
      settings: 'Settings',
      notifications: 'Notifications',
      reports: 'Reports',
      institutions: 'Institutions',
      users: 'User Management',
      venues: 'Venue Management',
      departments: 'Departments',
      staff: 'Staff Management',
      blog: 'Blog Management',
    };

    return labels[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  const getPageDescription = (page: string) => {
    const descriptions: Record<string, string> = {
      dashboard: 'Overview of your recent activity and stats.',
      profile: 'Manage your personal information and preferences.',
      courses: 'View and manage your enrolled courses.',
      sessions: 'Track and manage your attendance sessions.',
      analytics: 'Deep dive into your performance data.',
      institutions: 'System-wide institution management.',
    };
    return descriptions[page] || 'Manage your Presently experience.';
  };

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <>
      <DashboardShell
        userRole={userRole}
        userName={currentUser?.full_name || userName}
        onLogout={onLogout}
        title={getPageLabel(currentPage)}
        description={getPageDescription(currentPage)}
      >
        {children}
      </DashboardShell>

      <EnhancedAttendanceScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerify={async () => ({})}
      />
    </>
  );
};
