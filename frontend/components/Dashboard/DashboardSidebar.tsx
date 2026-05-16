import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Logo } from '../Logo';
import { UserRole } from '../../types';
import { getNavItemsForRole } from '../../utils/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { cn } from '../../src/components/ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../src/components/ui/tooltip';

interface DashboardSidebarProps {
  userRole?: UserRole;
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  userRole,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleName = userRole?.toLowerCase() || 'user';
  const navItems = getNavItemsForRole(roleName);

  const isActive = (href?: string): boolean => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-full border-r border-outline/50 bg-surface-container/30 backdrop-blur-sm transition-all duration-500 ease-premium relative z-40",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("transition-all duration-500", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
            <Logo />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface-highest rounded-xl transition-colors text-on-surface-variant"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Tooltip key={item.id} disabled={!isCollapsed}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => item.href && navigate(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-premium group relative",
                      active
                        ? "bg-sungold text-presently-black shadow-gold"
                        : "text-on-surface-variant hover:bg-surface-highest hover:text-on-surface",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <Icon size={20} className={cn("shrink-0", active ? "text-presently-black" : "group-hover:scale-110 transition-transform")} />
                    {!isCollapsed && (
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    )}
                    {active && !isCollapsed && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-presently-black/20" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-surface-highest border-outline text-on-surface font-bold rounded-lg shadow-lg">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-outline/30 space-y-2">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-surface-highest transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex-shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {currentUser?.full_name || 'My Account'}
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest truncate">
                  {roleName.replace('_', ' ')}
                </p>
              </div>
            )}
          </button>

          <button
            onClick={onLogout}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl text-error hover:bg-error/10 transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
