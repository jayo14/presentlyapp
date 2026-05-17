import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  House, BookOpen, ChartLineUp, User, 
  ListChecks, FileText, Buildings, Users,
  Scan, Keyboard, Plus
} from '@phosphor-icons/react';
import { MobileHeader } from './MobileHeader';
import { BottomNav, NavItem } from './BottomNav';
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
          { label: 'Analytics', icon: ChartLineUp, path: '/dashboard/analytics' },
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

  const getMainAction = () => {
    if (user?.role === UserRole.STUDENT) {
      return {
        icon: Scan,
        onClick: () => navigate('/dashboard/scanner')
      };
    }
    if (user?.role === UserRole.LECTURER) {
       return {
         icon: Plus,
         onClick: () => navigate('/dashboard/sessions/new')
       };
    }
    return undefined;
  };

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-off-white dark:bg-presently-black text-on-surface overflow-hidden"
      style={{
        scrollBehavior: 'smooth',
        overscrollBehavior: 'none',
      }}
    >
      {user?.role !== UserRole.STUDENT && user?.role !== UserRole.CLASS_REP && (
        <MobileHeader 
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      )}

      <main 
        className="flex-1 overflow-y-auto pb-[140px] pt-4 scrollbar-none" 
        style={{ 
          paddingBottom: 'calc(140px + env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        <Outlet />
      </main>

      <BottomNav 
        items={getNavItems()} 
        mainAction={getMainAction()}
      />

      <SidebarDrawer 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};
