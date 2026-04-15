import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LogOut, Home, User, Bell, Settings, BookOpen, FileText,
  Calendar, Users, Map, ShieldAlert, Sun, Moon, BarChart3,
  Download, GraduationCap, Building2, Timer, Menu, X,
  ChevronLeft, Search, PanelLeftClose, PanelLeft, Command, Plus
} from 'lucide-react';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { hasPermissionCode } from '../services/rbac';
import { Dock } from '@/components/magicui/dock';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import NotificationInbox from './NotificationInbox';
import { EnhancedAttendanceScanner } from './Attendance/EnhancedAttendanceScanner';
import { sessionApi } from '../services/api/attendance';
import { QrCode, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage?: (page: string) => void;
}

interface NavItemProps {
  id: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  collapsed?: boolean;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, isActive, onClick, collapsed = false, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
      collapsed ? 'justify-center' : 'gap-3'
    } ${
      isActive
        ? 'bg-surface text-text font-semibold'
        : 'text-textMuted hover:text-text hover:bg-surfaceLow'
    }`}
    title={collapsed ? label : undefined}
  >
    <Icon
      size={16}
      className={`flex-shrink-0 ${
        isActive ? 'text-primary' : 'text-textMuted group-hover:text-text'
      }`}
    />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && badge && (
      <span className="ml-auto text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
        {badge}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-outline text-text text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
        {label}
      </div>
    )}
  </button>
);

// Section label for sidebar groups
const NavSection: React.FC<{ label: string; collapsed: boolean }> = ({ label, collapsed }) => (
  collapsed ? (
    <div className="h-px bg-surfaceLow mx-2 my-2" />
  ) : (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[11px] font-semibold text-textMuted uppercase tracking-wider">{label}</span>
    </div>
  )
);

// Global variable to persist install prompt event across component unmounts/remounts
let deferredPromptEvent: any = null;

// Capture event immediately when module loads to ensure we don't miss early firings
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptEvent = e;
  });
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, userName = "User", onLogout, currentPage, setCurrentPage }) => {
  const { data: currentUser } = useCurrentUser();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const isDark = resolvedTheme === 'dark';
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

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const getNavGroups = () => {
    const effectivePermissions = currentUser?.permissions;
    const canAccess = (permission: string | null) => {
      if (!permission) {
        return true;
      }
      if (!userRole) {
        return false;
      }
      return hasPermissionCode(userRole, effectivePermissions, permission);
    };

    switch (userRole) {
      case UserRole.ADMIN:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: Home, label: 'Overview' },
              { id: 'security', icon: ShieldAlert, label: 'Security & Devices' },
            ],
          },
          {
            label: 'Management',
            items: [
              { id: 'users', icon: Users, label: 'Users', permission: 'system.users.manage' },
              { id: 'staff', icon: ShieldAlert, label: 'Staff', permission: 'system.staff.manage' },
              { id: 'institutions', icon: Building2, label: 'Institutions', permission: 'system.settings.manage' },
              { id: 'courses', icon: BookOpen, label: 'Courses', permission: 'courses.view' },
              { id: 'venues', icon: Map, label: 'Venues & Maps', permission: 'venues.view' },
              { id: 'blog', icon: FileText, label: 'Blog management', permission: 'blog.view' },
            ].filter((item) => canAccess(item.permission)),
          },
          {
            label: 'System',
            items: [
              { id: 'logs', icon: ShieldAlert, label: 'Audit Logs', permission: 'system.analytics.view' },
              { id: 'notifications', icon: Bell, label: 'Notifications', permission: null },
            ].filter((item) => canAccess(item.permission)),
          },
        ].filter((group) => group.items.length > 0);
      case UserRole.LECTURER:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: Home, label: 'Home' },
              { id: 'sessions', icon: Timer, label: 'Sessions' },
            ],
          },
          {
            label: 'Teaching',
            items: [
              { id: 'courses', icon: BookOpen, label: 'My Courses' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
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
              { id: 'dashboard', icon: Home, label: 'My Attendance' },
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
              { id: 'dashboard', icon: Home, label: 'Home' },
              { id: 'courses', icon: BookOpen, label: 'Courses' },
              { id: 'timetable', icon: Calendar, label: 'Timetable' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
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

  // Common items (settings, profile, security) for all roles
  const commonItems = [
    { id: 'security', icon: ShieldAlert, label: 'Security' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const displayAvatar = currentUser?.avatar_url;
  const displayInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  // Get current page title for the topnav breadcrumb
  const getCurrentPageTitle = () => {
    const allItems = [...allNavItems, ...commonItems];
    const found = allItems.find(i => i.id === currentPage);
    return found?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-surfaceLow text-text flex transition-colors duration-200">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} border-r border-outline/20 flex-col bg-surface/70 backdrop-blur-[60px] text-foreground h-screen sticky top-0 transition-all duration-200 relative z-30`}>
        {/* Sidebar Header - Logo */}
        <div className={`h-14 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} border-b border-border flex-shrink-0`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <picture>
                <source srcSet="/logo.avif" type="image/avif" />
                <source srcSet="/logo.webp" type="image/webp" />
                <img src="/logo.png" alt="Presently" width={32} height={32} className="w-full h-full object-contain" />
              </picture>
            </div>
          ) : (
            <Logo className="text-text" />
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <NavSection label={group.label} collapsed={sidebarCollapsed} />
              {group.items.map(item => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentPage === item.id}
                  onClick={handleNavClick}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          ))}

          {/* Divider before common items */}
          <div className="h-px bg-surfaceLow mx-2 my-3" />
          {commonItems.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={handleNavClick}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-outline p-2 space-y-1 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-[13px] font-medium text-textMuted hover:bg-surfaceLow hover:text-text transition-all group relative`}
            title={sidebarCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            {isDark ? <Moon size={16} className="flex-shrink-0" /> : <Sun size={16} className="flex-shrink-0" />}
            {!sidebarCollapsed && <span className="truncate">{isDark ? 'Dark mode' : 'Light mode'}</span>}
            {!sidebarCollapsed && (
              <div className={`ml-auto w-7 h-4 rounded-full p-0.5 flex flex-shrink-0 transition-colors ${isDark ? 'bg-primary justify-end' : 'bg-surfaceHigh justify-start'}`}>
                <div className="w-3 h-3 rounded-full bg-surface shadow-sm" />
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-surface text-text text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
                {isDark ? 'Dark mode' : 'Light mode'}
              </div>
            )}
          </button>

          {/* Install App */}
          {installPrompt && !isAppInstalled && (
            <button
              onClick={handleInstallClick}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/5 transition-all`}
              title={sidebarCollapsed ? 'Install App' : undefined}
            >
              <Download size={16} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Install App</span>}
            </button>
          )}

          {/* User Info */}
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surfaceLow hover:text-textMuted/50 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surfaceLow border border-outline flex-shrink-0">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-textMuted">
                    {displayInitials}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-medium text-text truncate leading-tight">{userName}</p>
                <p className="text-[11px] text-textMuted truncate capitalize leading-tight">{userRole?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 group relative" title={userName}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surfaceLow border border-outline flex-shrink-0">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-textMuted">
                    {displayInitials}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all group relative`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Sign out</span>}
          </button>
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-[72px] z-40 w-6 h-6 rounded-full bg-surface text-text border border-outline shadow-sm text-textMuted hover:text-textMuted hover:border-outline transition-all flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-surface/70 backdrop-blur-[60px] text-foreground z-50 transform transition-transform duration-250 ease-out md:hidden flex flex-col border-r border-outline/20 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-outline/40 rounded-full mx-auto mt-2 mb-4" />
        
        {/* Mobile Sidebar Header */}
        <div className="h-14 flex justify-between items-center px-4 border-b border-outline flex-shrink-0">
          <Logo className="text-text" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-textMuted hover:text-textMuted rounded-lg hover:bg-surfaceLow hover:text-textMuted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              <NavSection label={group.label} collapsed={false} />
              {group.items.map(item => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentPage === item.id}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          ))}
          <div className="h-px bg-surfaceLow mx-2 my-3" />
          {commonItems.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="border-t border-outline/10 p-4 space-y-4 flex-shrink-0 bg-surfaceLow/30">
          <div className="flex items-center gap-3 px-3 py-3 bg-surface rounded-2xl border border-outline/5 shadow-sm">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surfaceLow border border-outline flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-textMuted">
                  {displayInitials}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-text truncate leading-tight">{userName}</p>
              <p className="text-[11px] text-textMuted truncate capitalize leading-tight font-medium">{userRole?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors border border-red-500/10"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-14 bg-surface text-text border-b border-outline flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-textMuted hover:text-textMuted rounded-lg hover:bg-surfaceLow transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-headline text-[15px] font-semibold text-text truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationInbox />
            <div 
              className="w-8 h-8 rounded-full overflow-hidden bg-surfaceLow border border-outline flex-shrink-0 cursor-pointer" 
              onClick={() => handleNavClick('profile')}
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-textMuted">
                  {displayInitials}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-surfaceLow scroll-smooth pb-24 md:pb-8 flex flex-col">
          <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV (Dock)  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {/* Floating Dock Navigation for mobile users */}
      {!isMobileMenuOpen && (
        <div className="md:hidden">
          <Dock
            items={(() => {
              const baseItems = [
                { id: 'dashboard', label: 'Home', active: currentPage === 'dashboard', onClick: () => handleNavClick('dashboard'), icon: <Home size={20} strokeWidth={2} /> },
                { id: 'courses', label: 'Courses', active: currentPage === 'courses', onClick: () => handleNavClick('courses'), icon: <GraduationCap size={20} strokeWidth={2} /> },
              ];
              
              const analyticsItem = userRole !== UserRole.ADMIN ? [
                { id: 'analytics', label: 'Stats', active: (currentPage === 'analytics' || currentPage === 'reports'), onClick: () => handleNavClick('analytics'), icon: <TrendingUp size={20} strokeWidth={2} /> }
              ] : [];

              const endItems = [
                ...analyticsItem,
                { id: 'profile', label: 'Me', active: currentPage === 'profile', onClick: () => handleNavClick('profile'), icon: <User size={20} strokeWidth={2} /> },
              ];

              if (userRole === UserRole.ADMIN) {
                return [
                  ...baseItems,
                  { id: 'users', label: 'Users', active: (currentPage === 'users' || currentPage === 'staff'), onClick: () => handleNavClick('users'), icon: <Users size={20} strokeWidth={2} /> },
                  ...endItems
                ];
              }

              if (userRole === UserRole.LECTURER) {
                return [
                  ...baseItems,
                  { id: 'create-session', label: 'New', isAccent: true, onClick: () => navigate('/dashboard/sessions/new'), icon: <Plus size={24} strokeWidth={2.5} /> },
                  ...endItems
                ];
              }

              // Default for Students and Class Reps
              return [
                ...baseItems,
                { id: 'scanner', label: 'Scan', isAccent: true, onClick: () => setIsScannerOpen(true), icon: <QrCode size={24} strokeWidth={2.5} /> },
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