import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { LogOut, Home, User, Bell, Settings, BookOpen, FileText, Calendar, Users, Map, ShieldAlert, Sun, Moon, BarChart3, Download, GraduationCap, Building2, Building, Timer, Menu, X } from 'lucide-react';
import { UserRole } from '../types';

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
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, isActive, onClick, collapsed = false }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
    title={collapsed ? label : undefined}
  >
    <Icon size={18} className="flex-shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
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
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or default to false
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [installPrompt, setInstallPrompt] = useState<any>(deferredPromptEvent);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when page changes
  const handleNavClick = (id: string) => {
      if (id === 'dashboard') {
          navigate('/dashboard');
      } else {
          navigate(`/dashboard/${id}`);
      }
      
      if (setCurrentPage) {
          setCurrentPage(id);
      }
      setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    // Apply theme on mount based on stored preference
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (app is installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone || 
                          document.referrer.includes('android-app://');
      setIsAppInstalled(isStandalone);
      
      // If app is installed, don't show install prompt
      if (isStandalone) {
        setInstallPrompt(null);
        deferredPromptEvent = null;
      }
    };
    
    checkIfInstalled();
    
    // Sync local state with global variable on mount
    if (deferredPromptEvent && !isAppInstalled) {
      setInstallPrompt(deferredPromptEvent);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // Only set the prompt if app is not already installed
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
    
    // The prompt can only be used once. Clear it regardless of outcome.
    deferredPromptEvent = null;
    setInstallPrompt(null);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Persist to localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
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
          { id: 'institutions', icon: Building2, label: 'Institutions' },
          { id: 'courses', icon: BookOpen, label: 'Courses' },
          { id: 'venues', icon: Map, label: 'Venues & Maps' },
          { id: 'logs', icon: ShieldAlert, label: 'Audit Logs' },
          ...common
        ];
      case UserRole.LECTURER:
        return [
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'sessions', icon: Timer, label: 'Sessions' },
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
              onClick={handleNavClick}
              collapsed={sidebarCollapsed}
            />
          ))}
          {userRole !== UserRole.STUDENT && (
            <button 
              onClick={() => handleNavClick('notifications')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 'notifications' ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
              title={sidebarCollapsed ? 'Notifications' : undefined}
            >
              <Bell size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Notifications</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
           {installPrompt && (
             <button 
               onClick={handleInstallClick}
               className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200 mb-2`}
               title={sidebarCollapsed ? 'Install App' : undefined}
             >
               <Download size={18} className="flex-shrink-0" />
               {!sidebarCollapsed && <span className="truncate">Install App</span>}
             </button>
           )}

           {userRole !== UserRole.STUDENT ? (
             <button 
               onClick={toggleTheme}
               className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200`}
               title={sidebarCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
             >
               {!sidebarCollapsed && (
                 <div className="flex items-center gap-3 overflow-hidden">
                    {isDark ? <Moon size={18} className="flex-shrink-0" /> : <Sun size={18} className="flex-shrink-0" />}
                    <span className="truncate">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                 </div>
               )}
               {sidebarCollapsed && (isDark ? <Moon size={18} className="flex-shrink-0" /> : <Sun size={18} className="flex-shrink-0" />)}
               {!sidebarCollapsed && (
                 <div className={`w-8 h-4 rounded-full p-0.5 flex flex-shrink-0 transition-colors ${isDark ? 'bg-primary justify-end' : 'bg-zinc-300 dark:bg-zinc-600 justify-start'}`}>
                    <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                 </div>
               )}
             </button>
           ) : (
             <button 
               onClick={() => handleNavClick('notifications')}
               className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 'notifications' ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
               title={sidebarCollapsed ? 'Notifications' : undefined}
             >
               <Bell size={18} className="flex-shrink-0" />
               {!sidebarCollapsed && <span className="truncate">Notifications</span>}
             </button>
           )}

          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
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
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                 {userRole === UserRole.STUDENT ? 'S' : (userRole === UserRole.LECTURER ? 'L' : (userRole === UserRole.ADMIN ? 'A' : 'CR'))}
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all duration-200`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Desktop Header - REMOVED for cleaner desktop experience */}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-r border-zinc-200 dark:border-zinc-800 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <Logo className="text-zinc-900 dark:text-white" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map(item => (
                <NavItem 
                  key={item.id} 
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentPage === item.id}
                  onClick={handleNavClick}
                />
              ))}
              {userRole !== UserRole.STUDENT && (
                <>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4 mx-2"></div>
                  <button 
                    onClick={() => handleNavClick('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPage === 'notifications' ? 'bg-primary/10 text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                  >
                    <Bell size={18} />
                    Notifications
                  </button>
                </>
              )}
          </nav>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                     {userName.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-zinc-500 truncate capitalize">{userRole?.toLowerCase().replace('_', ' ')}</p>
                  </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
              >
                <LogOut size={18} />
                Sign Out
              </button>
          </div>
      </div>

      {/* Mobile Bottom Navigation - Redesigned to match UI */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl border border-light-border dark:border-dark-border px-3 py-2 flex items-center justify-around max-w-full">
          {/* Home */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          >
            <Home 
              size={24} 
              className={currentPage === 'dashboard' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
              strokeWidth={currentPage === 'dashboard' ? 2.5 : 2}
            />
            <span className={`text-[10px] font-medium ${currentPage === 'dashboard' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
              Home
            </span>
          </button>

          {/* Sessions */}
          <button
            onClick={() => handleNavClick('sessions')}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          >
            <Calendar 
              size={24} 
              className={currentPage === 'sessions' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
              strokeWidth={currentPage === 'sessions' ? 2.5 : 2}
            />
            <span className={`text-[10px] font-medium ${currentPage === 'sessions' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
              Sessions
            </span>
          </button>

          {/* Courses */}
          <button
            onClick={() => handleNavClick('courses')}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          >
            <GraduationCap 
              size={24} 
              className={currentPage === 'courses' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
              strokeWidth={currentPage === 'courses' ? 2.5 : 2}
            />
            <span className={`text-[10px] font-medium ${currentPage === 'courses' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
              Courses
            </span>
          </button>

          {/* Records/Analytics */}
          <button
            onClick={() => handleNavClick('analytics')}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          >
            <BarChart3 
              size={24} 
              className={currentPage === 'analytics' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
              strokeWidth={currentPage === 'analytics' ? 2.5 : 2}
            />
            <span className={`text-[10px] font-medium ${currentPage === 'analytics' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
              Records
            </span>
          </button>

          {/* Profile/Alerts - Shows Profile for lecturers, Alerts/Notifications for students */}
          <button
            onClick={() => handleNavClick(userRole === UserRole.STUDENT ? 'notifications' : 'profile')}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          >
            {userRole === UserRole.STUDENT ? (
              <>
                <Bell 
                  size={24} 
                  className={(currentPage === 'notifications' || currentPage === 'alerts') ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
                  strokeWidth={(currentPage === 'notifications' || currentPage === 'alerts') ? 2.5 : 2}
                />
                <span className={`text-[10px] font-medium ${(currentPage === 'notifications' || currentPage === 'alerts') ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
                  Alerts
                </span>
              </>
            ) : (
              <>
                <User 
                  size={24} 
                  className={currentPage === 'profile' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}
                  strokeWidth={currentPage === 'profile' ? 2.5 : 2}
                />
                <span className={`text-[10px] font-medium ${currentPage === 'profile' ? 'text-primary dark:text-dark-primary' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
                  Profile
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-zinc-50 dark:bg-black scroll-smooth transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full flex flex-col">
            {children}
        </div>
      </main>
    </div>
  );
};