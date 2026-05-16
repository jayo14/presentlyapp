import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SignOut, Gear, Shield, Question,
  House, BookOpen, ChartLineUp, Users,
  MapPin, Buildings, Article, ListChecks, Bell
} from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const getNavItems = () => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Home', path: '/dashboard', icon: House },
          { label: 'Courses', path: '/dashboard/courses', icon: BookOpen },
          { label: 'Analytics', path: '/dashboard/analytics', icon: ChartLineUp },
          { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
          { label: 'Settings', path: '/dashboard/settings', icon: Gear },
        ];
      case UserRole.LECTURER:
        return [
          { label: 'Home', path: '/dashboard', icon: House },
          { label: 'Courses', path: '/dashboard/courses', icon: BookOpen },
          { label: 'Sessions', path: '/dashboard/sessions', icon: ListChecks },
          { label: 'Reports', path: '/dashboard/reports', icon: ChartLineUp },
          { label: 'Settings', path: '/dashboard/settings', icon: Gear },
        ];
      case UserRole.ADMIN:
        return [
          { label: 'System Overview', path: '/dashboard', icon: House },
          { label: 'Institutions', path: '/dashboard/institutions', icon: Buildings },
          { label: 'Users', path: '/dashboard/users', icon: Users },
          { label: 'Venues', path: '/dashboard/venues', icon: MapPin },
          { label: 'Blog CMS', path: '/dashboard/blog', icon: Article },
          { label: 'Settings', path: '/dashboard/settings', icon: Gear },
        ];
      default:
        return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-off-white dark:bg-charcoal z-[201] rounded-r-3xl flex flex-col overflow-hidden shadow-lg"
          >
            {/* Header / Profile Section */}
            <div className="pt-10 px-6 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-sungold overflow-hidden bg-pale-honey flex items-center justify-center text-presently-black shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">
                      {user?.full_name?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[20px] font-bold text-presently-black dark:text-white truncate">
                    {user?.full_name || 'User'}
                  </h2>
                  <div className="flex items-center mt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-sungold/15 text-sungold whitespace-nowrap">
                      {user?.role?.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  {/* University Name could go here if available */}
                  <p className="text-[13px] text-slate-400 mt-1 truncate">
                    My University
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              <div className="space-y-1">
                {getNavItems().map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors
                      ${isActive
                        ? 'bg-sungold/12 text-sungold'
                        : 'text-presently-black dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={20} weight={isActive ? "duotone" : "regular"} className={isActive ? "text-sungold" : "text-slate-400"} />
                        <span className="font-bold text-[15px]">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Footer / Account */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 sticky bottom-0 bg-off-white dark:bg-charcoal">
              <div className="space-y-1">
                <NavLink
                  to="/dashboard/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-presently-black dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <Gear size={20} weight="regular" className="text-slate-400" />
                  <span className="font-bold text-[15px]">Profile</span>
                </NavLink>

                <button
                  onClick={() => {
                    logout.mutate();
                    onClose();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-soft-coral hover:bg-soft-coral/10 transition-colors"
                >
                  <SignOut size={20} weight="regular" className="text-soft-coral" />
                  <span className="font-bold text-[15px]">Log Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
