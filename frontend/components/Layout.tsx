import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import {
  Home, User, Bell, Settings, Calendar, TrendingUp, QrCode, Plus, LogOut, ClipboardList, Menu, X
} from 'lucide-react';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { Dock } from '@/components/magicui/dock';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationInbox from './NotificationInbox';
import { EnhancedAttendanceScanner } from './Attendance/EnhancedAttendanceScanner';
import { cn } from '../src/components/ui/utils';

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
  onLogout,
  currentPage,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setIsSidebarOpen(false);
    if (id === 'dashboard') navigate('/dashboard');
    else if (id === 'profile') navigate('/dashboard/profile');
    else if (id === 'courses') navigate('/dashboard/courses');
    else if (id === 'sessions') navigate('/dashboard/sessions');
    else if (id === 'analytics') navigate('/dashboard/analytics');
    else if (id === 'timetable') navigate('/dashboard/timetable');
    else navigate(`/dashboard/${id}`);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, roles: [UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN, UserRole.CLASS_REP] },
    { id: 'courses', label: 'Attendance', icon: ClipboardList, roles: [UserRole.STUDENT, UserRole.CLASS_REP] },
    { id: 'sessions', label: 'Attendance', icon: ClipboardList, roles: [UserRole.LECTURER] },
    { id: 'timetable', label: 'Schedule', icon: Calendar, roles: [UserRole.STUDENT, UserRole.LECTURER, UserRole.CLASS_REP] },
    { id: 'analytics', label: 'Stats', icon: TrendingUp, roles: [UserRole.STUDENT, UserRole.LECTURER, UserRole.CLASS_REP] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(userRole as UserRole));

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-sans selection:bg-sungold/30 selection:text-presently-black">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-24 lg:w-72 flex-col border-r border-outline bg-surface sticky top-0 h-screen z-30 transition-all duration-300">
        <div className="p-8">
          <Logo showText={false} className="lg:hidden mx-auto" />
          <Logo className="hidden lg:flex" />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname.endsWith(item.id) || (item.id === 'dashboard' && location.pathname === '/dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-sungold text-presently-black shadow-md font-bold"
                    : "text-on-surface-variant hover:bg-black/5 hover:text-on-surface"
                )}
              >
                <item.icon size={22} className={cn(isActive ? "text-presently-black" : "text-on-surface-variant group-hover:text-on-surface")} />
                <span className="hidden lg:block truncate text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-outline space-y-4">
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-[22%] bg-sungold/10 border border-sungold/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-sungold" />
              )}
            </div>
            <div className="hidden lg:block text-left overflow-hidden">
              <p className="text-sm font-bold truncate">{userName}</p>
              <p className="text-xs text-on-surface-variant truncate capitalize">{userRole?.toLowerCase()}</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-soft-coral hover:bg-soft-coral/10 transition-all group font-bold text-sm"
          >
            <LogOut size={20} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* MOBILE HEADER */}
        <header className="md:hidden h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-outline sticky top-0 z-40">
          <Logo showText={false} />
          <div className="flex items-center gap-4">
            <NotificationInbox />
            <button
              onClick={() => handleNavClick('profile')}
              className="w-10 h-10 rounded-[22%] bg-sungold/10 border border-outline overflow-hidden shadow-sm"
            >
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-sungold">
                  {userName.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 relative pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* MOBILE DOCK */}
        <div className="md:hidden">
          <Dock
            items={(() => {
              const base = [
                { id: 'dashboard', label: 'Home', active: location.pathname === '/dashboard', onClick: () => handleNavClick('dashboard'), icon: <Home size={22} /> },
                { id: 'attendance', label: 'History', active: location.pathname.includes('courses') || location.pathname.includes('sessions'), onClick: () => handleNavClick(userRole === UserRole.LECTURER ? 'sessions' : 'courses'), icon: <ClipboardList size={22} /> },
              ];

              const action = userRole === UserRole.LECTURER
                ? { id: 'create', label: 'New', isAccent: true, onClick: () => navigate('/dashboard/sessions/new'), icon: <Plus size={28} /> }
                : { id: 'scan', label: 'Scan', isAccent: true, onClick: () => setIsScannerOpen(true), icon: <QrCode size={28} /> };

              const end = [
                { id: 'timetable', label: 'Schedule', active: location.pathname.includes('timetable'), onClick: () => handleNavClick('timetable'), icon: <Calendar size={22} /> },
                { id: 'profile', label: 'Profile', active: location.pathname.includes('profile'), onClick: () => handleNavClick('profile'), icon: <User size={22} /> },
              ];

              return [...base, action, ...end];
            })()}
          />
        </div>
      </div>

      <EnhancedAttendanceScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerify={() => {}}
      />
    </div>
  );
};
