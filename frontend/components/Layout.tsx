import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { LogOut, Home, User, Bell, Settings, BookOpen, FileText, Calendar, Users, Map, ShieldAlert, Sun, Moon, BarChart3, Download, GraduationCap } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

interface NavItemProps {
  id: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, isActive, onClick, collapsed = false }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
    title={collapsed ? label : undefined}
  >
    <Icon size={18} />
    {!collapsed && label}
  </button>
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
  const [isDark, setIsDark] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(deferredPromptEvent);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when page changes
  useEffect(() => {
    if (currentPage && currentPage !== 'dashboard') {
      const newPath = `/dashboard/${currentPage}`;
      if (location.pathname !== newPath && location.pathname !== '/dashboard') {
        navigate(newPath, { replace: true });
      }
    } else if (currentPage === 'dashboard' && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentPage, navigate, location.pathname]);

  // Parse URL on mount to set correct page
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'dashboard') {
      const page = pathParts[2];
      if (page && page !== currentPage) {
        setCurrentPage(page);
      }
    }
  }, [location.pathname, currentPage, setCurrentPage]);

  useEffect(() => {
    // Initialize theme state based on document class
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Sync local state with global variable on mount
    if (deferredPromptEvent) {
      setInstallPrompt(deferredPromptEvent);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptEvent = e;
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    // The prompt can only be used once. Clear it regardless of outcome.
    deferredPromptEvent = null;
    setInstallPrompt(null);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getNavItems = () => {
    const common = [
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    switch (userRole) {
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', icon: Home, label: 'Overview' },
          { id: 'users', icon: Users, label: 'User Mgmt' },
          { id: 'venues', icon: Map, label: 'Venues & Maps' },
          { id: 'logs', icon: ShieldAlert, label: 'Audit Logs' },
          ...common
        ];
      case UserRole.LECTURER:
        return [
          { id: 'dashboard', icon: Home, label: 'Sessions' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'courses', icon: BookOpen, label: 'Courses' },
          { id: 'reports', icon: FileText, label: 'Reports' },
          { id: 'timetable', icon: Calendar, label: 'Timetable' },
          ...common
        ];
      case UserRole.CLASS_REP:
        return [
          { id: 'dashboard', icon: Home, label: 'My Attendance' },
          { id: 'class-mgmt', icon: Users, label: 'Class Mgmt' },
          { id: 'timetable', icon: Calendar, label: 'Timetable' },
          ...common
        ];
      case UserRole.STUDENT:
      default:
        return [
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'timetable', icon: Calendar, label: 'Timetable' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          ...common
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} border-r border-zinc-200 dark:border-zinc-800 flex-col bg-white dark:bg-zinc-950 h-screen sticky top-0 transition-all duration-300 relative`}>
        <div className={`p-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {sidebarCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
          ) : (
            <Logo className="text-zinc-900 dark:text-white" />
          )}
        </div>
        
        {/* Collapse Toggle Button - Positioned on the right edge */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-3 h-3 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavItem 
              key={item.id} 
              id={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={setCurrentPage}
              collapsed={sidebarCollapsed}
            />
          ))}
          <button 
            onClick={() => setCurrentPage('notifications')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'notifications' ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
            title={sidebarCollapsed ? 'Notifications' : undefined}
          >
            <Bell size={18} />
            {!sidebarCollapsed && 'Notifications'}
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
           {installPrompt && (
             <button 
               onClick={handleInstallClick}
               className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors mb-2`}
               title={sidebarCollapsed ? 'Install App' : undefined}
             >
               <Download size={18} />
               {!sidebarCollapsed && 'Install App'}
             </button>
           )}

           <button 
              onClick={toggleTheme}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors`}
              title={sidebarCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
           >
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                   {isDark ? <Moon size={18} /> : <Sun size={18} />}
                   <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
              )}
              {sidebarCollapsed && (isDark ? <Moon size={18} /> : <Sun size={18} />)}
              {!sidebarCollapsed && (
                <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${isDark ? 'bg-primary justify-end' : 'bg-zinc-300 dark:bg-zinc-600 justify-start'}`}>
                   <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                </div>
              )}
           </button>

          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                 {userRole === UserRole.STUDENT ? 'S' : (userRole === UserRole.LECTURER ? 'L' : (userRole === UserRole.ADMIN ? 'A' : 'CR'))}
              </div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-zinc-500 truncate capitalize">{userRole?.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                 {userRole === UserRole.STUDENT ? 'S' : (userRole === UserRole.LECTURER ? 'L' : (userRole === UserRole.ADMIN ? 'A' : 'CR'))}
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Mobile Header (Top) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20 transition-colors duration-300">
        <Logo className="text-zinc-900 dark:text-white" />
        <div className="flex items-center gap-4">
             {installPrompt && (
               <button onClick={handleInstallClick} className="text-primary hover:text-primary-hover transition-colors">
                 <Download size={20} />
               </button>
             )}
             <button onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
            <button onClick={onLogout} className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-white">
                <LogOut size={20} />
            </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Dock Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-4 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl px-6 py-3 flex items-center gap-6">
          {navItems.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                currentPage === item.id 
                  ? 'text-primary scale-110' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:scale-105'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-primary/10 shadow-lg' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}>
                <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium mt-1 transition-all duration-200 ${
                currentPage === item.id ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-zinc-50 dark:bg-black scroll-smooth transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 mb-20 md:mb-0">
            {children}
        </div>
      </main>
    </div>
  );
};