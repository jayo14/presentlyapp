import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  House,
  Users,
  Buildings,
  BookOpen,
  MapPin,
  FileText,
  ShieldCheck,
  Bell,
  Monitor,
  Timer,
  Calendar,
  ChartBar,
  ChartLineUp,
  Envelope,
  Plus,
  QrCode,
  User,
  GraduationCap,
  X
} from '@phosphor-icons/react';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { hasPermissionCode } from '../services/rbac';
import { Dock } from '@/components/magicui/dock';
import { useTheme } from './ThemeProvider';
import { EnhancedAttendanceScanner } from './Attendance/EnhancedAttendanceScanner';
import { sessionApi } from '../services/api/attendance';
import { AppSidebar } from './layout/AppSidebar';
import { SiteHeader } from './layout/SiteHeader';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children?: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage?: (page: string) => void;
}

// Global variable to persist install prompt event across component unmounts/remounts
let deferredPromptEvent: any = null;

// Capture event immediately when module loads to ensure we don't miss early firings
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptEvent = e;
  });
}

// Mobile-specific NavItem (kept for mobile sidebar and dock)
const MobileNavItem: React.FC<{
  id: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
}> = ({ id, icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-textMuted hover:bg-surface-highest/40 hover:text-text"
    )}
  >
    <Icon size={20} weight={isActive ? "bold" : "regular"} />
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, userRole, userName = "User", onLogout, currentPage, setCurrentPage }) => {
  const { data: currentUser } = useCurrentUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [installPrompt, setInstallPrompt] = useState<any>(deferredPromptEvent);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = useCallback((id: string) => {
    if (id === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${id}`);
    }
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    setIsMobileMenuOpen(false);
  }, [navigate, setCurrentPage]);

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsAppInstalled(isStandalone);
      if (isStandalone) {
        setInstallPrompt(null);
        deferredPromptEvent = null;
      }
    };
    checkIfInstalled();

    if (deferredPromptEvent && !isAppInstalled) {
      setInstallPrompt(deferredPromptEvent);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      if (!isAppInstalled) {
        deferredPromptEvent = e;
        setInstallPrompt(e);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isAppInstalled]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    deferredPromptEvent = null;
    setInstallPrompt(null);
  };

  const getNavGroups = () => {
    const effectivePermissions = currentUser?.permissions;
    const canAccess = (permission: string | null) => {
      if (!permission) return true;
      if (!userRole) return false;
      return hasPermissionCode(userRole, effectivePermissions, permission);
    };

    switch (userRole) {
      case UserRole.ADMIN:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: House, label: 'Overview' },
              { id: 'security', icon: ShieldCheck, label: 'Security & Devices' },
            ],
          },
          {
            label: 'Management',
            items: [
              { id: 'users', icon: Users, label: 'Users', permission: 'system.users.manage' },
              { id: 'staff', icon: ShieldCheck, label: 'Staff', permission: 'system.staff.manage' },
              { id: 'institutions', icon: Buildings, label: 'Institutions', permission: 'system.settings.manage' },
              { id: 'courses', icon: BookOpen, label: 'Courses', permission: 'courses.view' },
              { id: 'venues', icon: MapPin, label: 'Venues & Maps', permission: 'venues.view' },
              { id: 'blog', icon: FileText, label: 'Blog management', permission: 'blog.view' },
            ].filter((item) => canAccess(item.permission)),
          },
          {
            label: 'System',
            items: [
              { id: 'logs', icon: Monitor, label: 'Audit Logs', permission: 'system.analytics.view' },
              { id: 'email-monitor', icon: Envelope, label: 'Email Monitor', permission: 'system.analytics.view' },
              { id: 'notifications', icon: Bell, label: 'Notifications', permission: null },
            ].filter((item) => canAccess(item.permission)),
          },
        ].filter((group) => group.items.length > 0);
      case UserRole.LECTURER:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: House, label: 'Home' },
              { id: 'sessions', icon: Timer, label: 'Sessions' },
            ],
          },
          {
            label: 'Teaching',
            items: [
              { id: 'courses', icon: BookOpen, label: 'My Courses' },
              { id: 'analytics', icon: ChartBar, label: 'Analytics' },
              { id: 'reports', icon: FileText, label: 'Reports' },
              { id: 'timetable', icon: Calendar, label: 'Timetable' },
            ],
          },
          {
            label: 'Other',
            items: [
              { id: 'notifications', icon: Bell, label: 'Notifications' },
            ],
          },
        ];
      case UserRole.CLASS_REP:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: House, label: 'My Attendance' },
            ],
          },
          {
            label: 'Class',
            items: [
              { id: 'class-mgmt', icon: Users, label: 'Class Management' },
              { id: 'timetable', icon: Calendar, label: 'Timetable' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
            ],
          },
        ];
      case UserRole.STUDENT:
      default:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: House, label: 'Home' },
              { id: 'courses', icon: GraduationCap, label: 'Courses' },
              { id: 'timetable', icon: Calendar, label: 'Timetable' },
              { id: 'analytics', icon: ChartLineUp, label: 'Analytics' },
            ],
          },
          {
            label: 'Other',
            items: [
              { id: 'notifications', icon: Bell, label: 'Notifications' },
            ],
          },
        ];
    }
  };

  const handleGlobalCheckIn = async (code: string, location: any): Promise<any> => {
    try {
      const attendanceData = await sessionApi.checkInByCode(code, location);
      return attendanceData;
    } catch (err: any) {
      console.error("Global check-in failed:", err);
      throw new Error(err.response?.data?.error || err.message || "Attendance Failed");
    }
  };

  const navGroups = getNavGroups();
  const allNavItems = navGroups.flatMap(g => g.items);

  const displayAvatar = currentUser?.avatar_url;
  const displayInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const getCurrentPageTitle = () => {
    const allItems = [...allNavItems, { id: 'security', label: 'Security' }, { id: 'settings', label: 'Settings' }, { id: 'profile', label: 'Profile' }];
    const found = allItems.find(i => i.id === currentPage);
    return found?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background text-text flex selection:bg-primary/30 selection:text-primary-foreground">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AppSidebar
        userRole={userRole}
        userName={userName}
        currentPage={currentPage}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onNavClick={handleNavClick}
        userAvatar={displayAvatar}
        userInitials={displayInitials}
        navGroups={navGroups}
        installPrompt={installPrompt}
        isAppInstalled={isAppInstalled}
        onInstallClick={handleInstallClick}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-[300px] bg-surface text-foreground z-50 transform transition-transform duration-300 ease-premium md:hidden flex flex-col shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex justify-between items-center px-6 border-b border-outline/5">
          <Logo className="text-text" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-textMuted hover:bg-surface-highest/40 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mb-3">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <MobileNavItem
                    key={item.id}
                    id={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPage === item.id}
                    onClick={handleNavClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-outline/5 bg-surface-low">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/10"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 md:p-6 lg:p-8">
        <div className="flex-1 flex flex-col bg-surface md:rounded-[2.5rem] shadow-premium overflow-hidden border border-outline/5 relative">
          <SiteHeader
            title={getCurrentPageTitle()}
            onMenuClick={() => setIsMobileMenuOpen(true)}
            userAvatar={displayAvatar}
            userInitials={displayInitials}
            onProfileClick={() => handleNavClick('profile')}
            isAdmin={userRole === UserRole.ADMIN}
          />

          <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pb-32 md:pb-8">
            <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8 lg:p-12">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV (Dock)  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!isMobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pt-2 px-4 pb-[env(safe-area-inset-bottom)]">
          <Dock
            items={(() => {
              const baseItems = [
                { id: 'dashboard', label: 'Home', active: currentPage === 'dashboard', onClick: () => handleNavClick('dashboard'), icon: <House size={20} weight={currentPage === 'dashboard' ? 'bold' : 'regular'} /> },
                { id: 'courses', label: 'Courses', active: currentPage === 'courses', onClick: () => handleNavClick('courses'), icon: <GraduationCap size={20} weight={currentPage === 'courses' ? 'bold' : 'regular'} /> },
              ];
              
              const analyticsItem = userRole !== UserRole.ADMIN ? [
                { id: 'analytics', label: 'Stats', active: (currentPage === 'analytics' || currentPage === 'reports'), onClick: () => handleNavClick('analytics'), icon: <ChartLineUp size={20} weight={(currentPage === 'analytics' || currentPage === 'reports') ? 'bold' : 'regular'} /> }
              ] : [];

              const endItems = [
                ...analyticsItem,
                { id: 'profile', label: 'Me', active: currentPage === 'profile', onClick: () => handleNavClick('profile'), icon: <User size={20} weight={currentPage === 'profile' ? 'bold' : 'regular'} /> },
              ];

              if (userRole === UserRole.ADMIN) {
                return [
                  ...baseItems,
                  { id: 'users', label: 'Users', active: (currentPage === 'users' || currentPage === 'staff'), onClick: () => handleNavClick('users'), icon: <Users size={20} weight={(currentPage === 'users' || currentPage === 'staff') ? 'bold' : 'regular'} /> },
                  ...endItems
                ];
              }

              if (userRole === UserRole.LECTURER) {
                return [
                  ...baseItems,
                  { id: 'create-session', label: 'New', isAccent: true, onClick: () => navigate('/dashboard/sessions/new'), icon: <Plus size={24} weight="bold" /> },
                  ...endItems
                ];
              }

              return [
                ...baseItems,
                { id: 'scanner', label: 'Scan', isAccent: true, onClick: () => setIsScannerOpen(true), icon: <QrCode size={24} weight="bold" /> },
                ...endItems
              ];
            })()}
          />
        </div>
      )}

      <EnhancedAttendanceScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerify={handleGlobalCheckIn}
      />
    </div>
  );
};
