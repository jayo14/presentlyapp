import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  House, BookOpen, ChartLineUp, User, 
  ListChecks, FileText, Buildings, Users,
  Scan, Keyboard, Plus
} from '@phosphor-icons/react';
import { MobileHeader } from './MobileHeader';
import { BottomNav, NavItem } from './BottomNav';
import { FAB } from './FAB';
import { SidebarDrawer } from './SidebarDrawer';
import { useCurrentUser } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export const MobileLayout: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Home', icon: House, path: '/dashboard' },
          { label: 'Courses', icon: BookOpen, path: '/dashboard/courses' },
          { label: 'Stats', icon: ChartLineUp, path: '/dashboard/analytics' },
          { label: 'Profile', icon: User, path: '/dashboard/profile' },
        ];
      case UserRole.LECTURER:
        return [
          { label: 'Home', icon: House, path: '/dashboard' },
          { label: 'Courses', icon: BookOpen, path: '/dashboard/courses' },
          { label: 'Sessions', icon: ListChecks, path: '/dashboard/sessions' },
          { label: 'Reports', icon: FileText, path: '/dashboard/reports' },
        ];
      case UserRole.ADMIN:
        return [
          { label: 'Home', icon: House, path: '/dashboard' },
          { label: 'Schools', icon: Buildings, path: '/dashboard/institutions' },
          { label: 'Users', icon: Users, path: '/dashboard/users' },
          { label: 'Profile', icon: User, path: '/dashboard/profile' },
        ];
      default:
        return [];
    }
  };

  const getFABActions = () => {
    if (user?.role === UserRole.STUDENT) {
      return [
        { icon: Scan, label: 'Scan QR', onClick: () => navigate('/dashboard/scanner') },
        { icon: Keyboard, label: 'Enter Code', onClick: () => console.log('Open manual entry') },
      ];
    }
    if (user?.role === UserRole.LECTURER) {
       return [
         { icon: Plus, label: 'New Session', onClick: () => navigate('/dashboard/sessions/new') },
       ];
    }
    return [];
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <MobileHeader 
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenNotifications={() => navigate('/dashboard/notifications')}
      />

      <main className="flex-1 px-4 py-6 mb-32 overflow-y-auto no-scrollbar pt-safe">
        <Outlet />
      </main>

      <FAB 
        mainIcon={user?.role === UserRole.STUDENT ? Scan : Plus}
        actions={getFABActions()}
      />

      <BottomNav items={getNavItems()} />

      <SidebarDrawer 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};
