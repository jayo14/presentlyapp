import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import {
  House,
  Users,
  Buildings,
  BookOpen,
  MapPin,
  FileText,
  ShieldCheck,
  Clock,
  Bell,
  Gear,
  SignOut,
  CaretLeft,
  CaretRight,
  Sun,
  Moon,
  Download,
  ChartBar,
  ChartLineUp,
  Monitor
} from '@phosphor-icons/react';
import { UserRole } from '../../types';
import { useTheme } from '../ThemeProvider';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  userRole?: UserRole;
  userName?: string;
  currentPage: string;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onNavClick: (id: string) => void;
  userAvatar?: string;
  userInitials?: string;
  navGroups: any[];
  installPrompt?: any;
  isAppInstalled?: boolean;
  onInstallClick?: () => void;
}

const NavItem: React.FC<{
  id: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  collapsed: boolean;
  badge?: string;
}> = ({ id, icon: Icon, label, isActive, onClick, collapsed, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "group relative w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-premium",
      collapsed ? "justify-center" : "gap-3",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-textMuted hover:text-text hover:bg-surface-highest/40 hover:border-outline/10 border border-transparent hover:translate-x-1"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon
      size={20}
      weight={isActive ? "bold" : "regular"}
      className={cn(
        "flex-shrink-0 transition-colors duration-200",
        isActive ? "text-primary" : "text-textMuted group-hover:text-text"
      )}
    />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && badge && (
      <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
        {badge}
      </span>
    )}
  </button>
);

const NavSection: React.FC<{ label: string; collapsed: boolean }> = ({ label, collapsed }) => (
  collapsed ? (
    <div className="h-px bg-outline/10 mx-4 my-4" />
  ) : (
    <div className="px-4 pt-6 pb-2">
      <span className="text-[10px] font-bold text-textMuted uppercase tracking-[0.2em]">{label}</span>
    </div>
  )
);

export const AppSidebar: React.FC<AppSidebarProps> = ({
  userRole,
  userName,
  currentPage,
  onLogout,
  collapsed,
  setCollapsed,
  onNavClick,
  userAvatar,
  userInitials,
  navGroups,
  installPrompt,
  isAppInstalled,
  onInstallClick
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const commonItems = [
    { id: 'security', icon: ShieldCheck, label: 'Security' },
    { id: 'settings', icon: Gear, label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-surface border-r border-outline/10 h-screen sticky top-0 transition-all duration-300 ease-premium relative z-30",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        "h-[80px] flex items-center border-b border-outline/5 px-6 flex-shrink-0",
        collapsed && "justify-center px-0"
      )}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center p-1.5">
             <img src="/logo.png" alt="Presently" className="w-full h-full object-contain" />
          </div>
        ) : (
          <Logo className="text-text" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-2">
            <NavSection label={group.label} collapsed={collapsed} />
            <div className="space-y-1">
              {group.items.map((item: any) => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentPage === item.id}
                  onClick={onNavClick}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="h-px bg-outline/5 mx-2 my-6" />
        <div className="space-y-1">
          {commonItems.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={onNavClick}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 mt-auto border-t border-outline/5 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium text-textMuted hover:bg-surface-highest/40 hover:text-text transition-all duration-200",
            collapsed ? "justify-center" : "gap-3"
          )}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
          {!collapsed && <span className="flex-1 text-left">{isDark ? 'Dark mode' : 'Light mode'}</span>}
        </button>

        {/* Install App */}
        {installPrompt && !isAppInstalled && (
          <button
            onClick={onInstallClick}
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-bold text-primary hover:bg-primary/5 transition-all duration-200",
              collapsed ? "justify-center" : "gap-3"
            )}
            title={collapsed ? 'Install App' : undefined}
            aria-label="Install presently app"
          >
            <Download size={20} weight="bold" />
            {!collapsed && <span className="truncate">Install App</span>}
          </button>
        )}

        {/* User Card */}
        <div
          role="region"
          aria-label="User profile summary"
          className={cn(
            "flex items-center rounded-2xl bg-surface-low border border-outline/5 p-2 transition-all duration-300",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-highest border border-outline/10 flex-shrink-0 flex items-center justify-center font-bold text-xs text-textMuted">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-text truncate">{userName}</p>
              <p className="text-[11px] text-textMuted truncate capitalize">{userRole?.toLowerCase().replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-500/5 transition-all duration-200",
            collapsed ? "justify-center" : "gap-3"
          )}
          aria-label="Sign out of your account"
        >
          <SignOut size={20} weight="bold" />
          {!collapsed && <span className="flex-1 text-left uppercase tracking-widest text-[10px]">Sign out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 z-40 w-6 h-6 rounded-full bg-surface border border-outline/10 shadow-premium flex items-center justify-center text-textMuted hover:text-primary transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <CaretRight size={12} weight="bold" /> : <CaretLeft size={12} weight="bold" />}
      </button>
    </aside>
  );
};
