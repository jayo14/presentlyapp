import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, User } from 'lucide-react';
import { Logo } from '../Logo';
import { UserRole } from '../../types';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../../src/components/ui/sidebar';
import { getNavItemsForRole } from '../../utils/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { cn } from '../../src/components/ui/utils';
import { Separator } from '../../src/components/ui/separator';

interface DashboardSidebarProps {
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  onNavigate?: (path: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  userRole,
  userName = 'User',
  onLogout,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const roleName = userRole?.toLowerCase() || 'user';
  const navItems = getNavItemsForRole(roleName);

  const isActive = (href?: string): boolean => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleNavClick = (href?: string) => {
    if (href) {
      navigate(href);
      onNavigate?.(href);
    }
  };

  const sectionedItems = navItems.reduce((acc, item) => {
    const key = item.section || 'core';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const sectionOrder = ['core', 'management', 'system'];

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        'hidden md:flex h-screen sticky top-0 z-30 border-r border-outline bg-surface transition-all duration-200',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className={cn('transition-opacity duration-200', isCollapsed && 'opacity-0 pointer-events-none w-0 overflow-hidden')}>
          <Logo />
        </div>
        <button
          onClick={() => setIsCollapsed((s) => !s)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline bg-surface-container/60 hover:bg-surface-container transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        {sectionOrder.map((sectionKey, sectionIndex) => {
          const items = sectionedItems[sectionKey] || [];
          if (!items.length) return null;

          return (
            <div key={sectionKey} className="mb-4">
              {sectionIndex > 0 && <Separator className="mb-3 bg-outline" />}
              {!isCollapsed && (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-textMuted">
                  {sectionKey}
                </p>
              )}
              <SidebarMenu>
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleNavClick(item.href)}
                        isActive={active}
                        icon={<item.icon size={18} />}
                        className={cn(
                          'h-10',
                          isCollapsed ? 'justify-center px-0' : 'justify-between'
                        )}
                        tooltip={item.label}
                      >
                        {!isCollapsed && <span>{item.label}</span>}
                        {!isCollapsed && item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-3 bg-outline" />
        <div className="space-y-2">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className={cn(
              'w-full flex items-center rounded-lg hover:bg-surface-container/50 transition-colors',
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-3'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={16} className="text-primary" />
              )}
            </div>
            {!isCollapsed && (
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{userName}</p>
                <p className="text-xs text-textMuted truncate capitalize">{roleName.replace('_', ' ')}</p>
              </div>
            )}
          </button>

          <button
            onClick={onLogout}
            className={cn(
              'w-full rounded-lg text-error hover:bg-error/10 transition-colors text-sm font-medium',
              isCollapsed ? 'p-2.5 flex items-center justify-center' : 'px-3 py-2.5 flex items-center gap-3'
            )}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
