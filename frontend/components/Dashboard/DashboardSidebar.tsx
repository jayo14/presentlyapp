import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
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
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '../../src/components/ui/sidebar';
import { getNavItemsForRole, NavItem } from '../../utils/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { cn } from '../../src/components/ui/utils';

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
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const roleName = userRole?.toLowerCase().replace('_', ' ') || 'user';
  const navItems = getNavItemsForRole(roleName);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

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

  const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({
    item,
    level = 0,
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.id);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleExpand(item.id)}
              isActive={false}
              icon={<item.icon size={18} />}
              className={cn(
                'justify-between',
                expandedItems.includes(item.id) && 'bg-surface-container/50'
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  'transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isExpanded && (
            <SidebarMenuSub>
              {item.children.map(child => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    onClick={() => handleNavClick(child.href)}
                    isActive={isActive(child.href)}
                    icon={<child.icon size={14} />}
                  >
                    {child.label}
                    {child.badge && (
                      <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                        {child.badge}
                      </span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </div>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => handleNavClick(item.href)}
          isActive={isItemActive}
          icon={<item.icon size={18} />}
          className="justify-between"
        >
          <span>{item.label}</span>
          {item.badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {item.badge}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="hidden md:flex md:w-60 lg:w-72 fixed left-0 top-0 h-screen z-30 border-r border-outline bg-surface">
      {/* Header */}
      <SidebarHeader className="flex items-center justify-between border-b border-outline p-6">
        <Logo className="w-full" />
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-0">
        <SidebarMenu className="px-3">
          {navItems.map((item) => (
            <NavItemComponent key={item.id} item={item} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-outline">
        <div className="space-y-4">
          {/* Profile Section */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">
                {userName}
              </p>
              <p className="text-xs text-textMuted truncate capitalize">
                {roleName}
              </p>
            </div>
          </button>

          <SidebarSeparator />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
