import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LogOut, Home, User, Bell, Settings, BookOpen,
  Calendar, Users, Map, ShieldAlert, Sun, Moon,
  GraduationCap, Plus, QrCode, TrendingUp, Menu, X, ChevronRight,
  ClipboardList
} from 'lucide-react';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { Dock } from '@/components/magicui/dock';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import NotificationInbox from './NotificationInbox';
import { EnhancedAttendanceScanner } from './Attendance/EnhancedAttendanceScanner';
import { cn } from '../src/components/ui/utils';

interface LayoutProps {
  children?: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  userRole,
  userName = "User",
  onLogout,
  currentPage
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleNavClick = (id: string) => {
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
    <div className="flex min-h-screen bg-background text-text font-sans selection:bg-primary/30 selection:text-primary-foreground">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-col border-r border-outline bg-surface sticky top-0 h-screen z-30 transition-all duration-300">
        <div className="p-6">
          <Logo showText={false} className="lg:hidden" />
          <Logo className="hidden lg:flex" />
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {filteredNav.map((item) => {
            const isActive = location.pathname.endsWith(item.id) || (item.id === 'dashboard' && location.pathname === '/dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-textMuted hover:bg-surfaceContainer hover:text-text"
                )}
              >
                <item.icon size={22} className={cn(isActive ? "text-primary" : "text-textMuted group-hover:text-text")} />
                <span className="hidden lg:block truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-outline space-y-2">
          <button
            onClick={() => handleNavClick('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-surfaceContainer transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-surfaceContainer border border-outline flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-textMuted" />
              )}
            </div>
            <div className="hidden lg:block text-left overflow-hidden">
              <p className="text-sm font-bold truncate">{userName}</p>
              <p className="text-xs text-textMuted truncate capitalize">{userRole?.toLowerCase()}</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-error hover:bg-error/10 transition-colors group"
          >
            <LogOut size={20} />
            <span className="hidden lg:block font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden h-16 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-xl border-b border-outline sticky top-0 z-40">
          <Logo showText={false} />
          <div className="flex items-center gap-4">
            <NotificationInbox />
            <button
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full bg-surfaceContainer border border-outline overflow-hidden"
            >
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-textMuted">
                  {userName.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 relative pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
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
                { id: 'attendance', label: 'Attendance', active: location.pathname.includes('courses') || location.pathname.includes('sessions'), onClick: () => handleNavClick(userRole === UserRole.LECTURER ? 'sessions' : 'courses'), icon: <ClipboardList size={22} /> },
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
