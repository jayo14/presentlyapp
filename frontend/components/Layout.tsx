import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LogOut, Home, User, Bell, Settings, BookOpen, FileText,
  Calendar, Users, Map, ShieldAlert, Sun, Moon, BarChart3,
  Download, GraduationCap, Building2, Timer, Menu, X,
  ChevronLeft, Search, PanelLeftClose, PanelLeft, Command
} from 'lucide-react';
import { UserRole } from '../types';
import { useCurrentUser } from '../hooks/useAuth';
import { Dock, DockItem } from '@/components/magicui/dock';
import NotificationInbox from './NotificationInbox';

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
    className={`
      group relative w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} 
      px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
      ${isActive
        ? 'bg-inputccent text-foreground'
        : 'text-muted-foreground hover:text-zinc-900 dark:hover:text-white hover:bg-inputccent hover:text-muted-foregroundccent-foreground/50'
      }
    `}
    title={collapsed ? label : undefined}
  >
    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && badge && (
      <span className="ml-auto text-[10px] font-semibold bg-inputccent text-muted-foreground px-1.5 py-0.5 rounded-md">
        {badge}
      </span>
    )}
    {/* Tooltip for collapsed state */}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-card text-primary-foreground text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
        {label}
      </div>
    )}
  </button>
);

// Section label for sidebar groups
const NavSection: React.FC<{ label: string; collapsed: boolean }> = ({ label, collapsed }) => (
  collapsed ? (
    <div className="h-px bg-zinc-200 mx-2 my-2" />
  ) : (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
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
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [installPrompt, setInstallPrompt] = useState<any>(deferredPromptEvent);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

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
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getNavGroups = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return [
          {
            label: 'General',
            items: [
              { id: 'dashboard', icon: Home, label: 'Overview' },
            ],
          },
          {
            label: 'Management',
            items: [
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'institutions', icon: Building2, label: 'Institutions' },
              { id: 'courses', icon: BookOpen, label: 'Courses' },
              { id: 'venues', icon: Map, label: 'Venues & Maps' },
            ],
          },
          {
            label: 'System',
            items: [
              { id: 'logs', icon: ShieldAlert, label: 'Audit Logs' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
            ],
          },
        ];
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

  const navGroups = getNavGroups();
  const allNavItems = navGroups.flatMap(g => g.items);

  // Common items (settings, profile) for all roles
  const commonItems = [
    { id: 'profile', icon: User, label: 'Profile' },
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
    <div className="min-h-screen bg-muted text-foreground flex transition-colors duration-200">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} border-r border-border flex-col bg-card text-foreground h-screen sticky top-0 transition-all duration-200 relative z-30`}>
        {/* Sidebar Header - Logo */}
        <div className={`h-14 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} border-b border-border flex-shrink-0`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary-fixedlack font-bold text-sm">
              P
            </div>
          ) : (
            <Logo className="text-foreground" />
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
          <div className="h-px bg-zinc-200 mx-2 my-3" />
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
        <div className="border-t border-border p-2 space-y-1 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-inputccent hover:text-muted-foregroundccent-foreground/50 transition-all group relative`}
            title={sidebarCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            {isDark ? <Moon size={16} className="flex-shrink-0" /> : <Sun size={16} className="flex-shrink-0" />}
            {!sidebarCollapsed && <span className="truncate">{isDark ? 'Dark mode' : 'Light mode'}</span>}
            {!sidebarCollapsed && (
              <div className={`ml-auto w-7 h-4 rounded-full p-0.5 flex flex-shrink-0 transition-colors ${isDark ? 'bg-primary justify-end' : 'bg-zinc-300 dark:bg-zinc-600 justify-start'}`}>
                <div className="w-3 h-3 rounded-full bg-card shadow-sm" />
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-card text-primary-foreground text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
                {isDark ? 'Dark mode' : 'Light mode'}
              </div>
            )}
          </button>

          {/* Install App */}
          {installPrompt && (
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
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-inputccent hover:text-muted-foregroundccent-foreground/50 transition-colors cursor-default">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-inputccent border border-border flex-shrink-0">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                    {displayInitials}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-medium text-foreground truncate leading-tight">{userName}</p>
                <p className="text-[11px] text-muted-foreground truncate capitalize leading-tight">{userRole?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 group relative">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-inputccent border border-border flex-shrink-0">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                    {displayInitials}
                  </div>
                )}
              </div>
              <div className="absolute left-full ml-2 px-2 py-1 bg-card text-primary-foreground text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
                {userName}
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
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-card text-primary-foreground text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
                Sign out
              </div>
            )}
          </button>
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-[72px] z-40 w-6 h-6 rounded-full bg-card text-foreground border border-border shadow-sm text-muted-foreground hover:text-muted-foreground hover:border-border transition-all flex items-center justify-center"
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
          className="fixed inset-0 bg-cardackgroundlack/40 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-card text-foreground z-50 transform transition-transform duration-250 ease-out md:hidden flex flex-col border-r border-border shadow-xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile Sidebar Header */}
        <div className="h-14 flex justify-between items-center px-4 border-b border-border flex-shrink-0">
          <Logo className="text-foreground" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-muted-foreground rounded-lg hover:bg-inputccent hover:text-muted-foregroundccent-foreground transition-colors"
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
          <div className="h-px bg-zinc-200 mx-2 my-3" />
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
        <div className="border-t border-border p-3 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-inputccent border border-border flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {displayInitials}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{userRole?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Navigation Bar — consistent across all pages */}
        <header className="h-14 bg-card text-foreground border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 flex-shrink-0">
          {/* Left: Mobile hamburger + Page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-zinc-700 rounded-lg hover:bg-inputccent hover:text-muted-foregroundccent-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[15px] font-semibold text-foreground truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>

          {/* Right: Actions  */}
          <div className="flex items-center gap-2">
            <NotificationInbox />
            <div className="w-8 h-8 rounded-full overflow-hidden bg-inputccent border border-border flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('profile')}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                  {displayInitials}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted scroll-smooth">
          <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV (Dock)  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-none">
        <Dock
          items={[
            {
              id: 'dashboard',
              label: 'Home',
              active: currentPage === 'dashboard',
              onClick: () => handleNavClick('dashboard'),
              icon: <Home size={22} />,
            },
            ...(userRole === UserRole.ADMIN
              ? [{
                  id: 'users',
                  label: 'Users',
                  active: currentPage === 'users',
                  onClick: () => handleNavClick('users'),
                  icon: <Users size={22} />,
                } as DockItem]
              : [{
                  id: 'courses',
                  label: 'Courses',
                  active: currentPage === 'courses',
                  onClick: () => handleNavClick('courses'),
                  icon: <GraduationCap size={22} />,
                } as DockItem]
            ),
            {
              id: 'analytics',
              label: userRole === UserRole.ADMIN ? 'Logs' : 'Records',
              active: currentPage === 'analytics' || currentPage === 'logs',
              onClick: () => handleNavClick(userRole === UserRole.ADMIN ? 'logs' : 'analytics'),
              icon: <BarChart3 size={22} />,
            },
            userRole === UserRole.STUDENT
              ? ({
                  id: 'notifications',
                  label: 'Alerts',
                  active: currentPage === 'notifications',
                  onClick: () => handleNavClick('notifications'),
                  icon: <Bell size={22} />,
                } as DockItem)
              : ({
                  id: 'profile',
                  label: 'Profile',
                  active: currentPage === 'profile',
                  onClick: () => handleNavClick('profile'),
                  icon: <User size={22} />,
                } as DockItem),
          ]}
        />
      </div>
    </div>
  );
};