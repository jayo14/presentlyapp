import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, SignOut, Gear, Shield, Question,
  House, BookOpen, ChartLineUp, Users,
  MapPin, Buildings, Article, ListChecks
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
    const common = [
      { label: 'Profile', path: '/dashboard/profile', icon: Gear },
      { label: 'Security', path: '/dashboard/security', icon: Shield },
      { label: 'Help & Support', path: '/documentation', icon: Question },
    ];

    switch (user?.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Home', path: '/dashboard', icon: House },
          { label: 'My Courses', path: '/dashboard/courses', icon: BookOpen },
          { label: 'Analytics', path: '/dashboard/analytics', icon: ChartLineUp },
          ...common
        ];
      case UserRole.LECTURER:
        return [
          { label: 'Home', path: '/dashboard', icon: House },
          { label: 'Manage Courses', path: '/dashboard/courses', icon: BookOpen },
          { label: 'Live Sessions', path: '/dashboard/sessions', icon: ListChecks },
          { label: 'Attendance Reports', path: '/dashboard/reports', icon: ChartLineUp },
          ...common
        ];
      case UserRole.ADMIN:
        return [
          { label: 'System Overview', path: '/dashboard', icon: House },
          { label: 'Institutions', path: '/dashboard/institutions', icon: Buildings },
          { label: 'User Management', path: '/dashboard/users', icon: Users },
          { label: 'Venue Management', path: '/dashboard/venues', icon: MapPin },
          { label: 'Blog CMS', path: '/dashboard/blog', icon: Article },
          ...common
        ];
      default:
        return common;
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-surface dark:bg-[#0D0D0D] z-[101] shadow-2xl flex flex-col pt-safe pb-safe"
          >
            {/* Header / Profile Section */}
            <div className="p-8 pb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="p-2 rounded-xl bg-surface-container active:scale-90 transition-transform">
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-sungold/10 border border-sungold/20 flex items-center justify-center mb-6">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    <span className="text-3xl font-bold text-sungold">
                      {user?.full_name?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-1">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-sm text-on-surface-variant font-medium">
                  {user?.role?.toLowerCase().replace('_', ' ')} • {user?.email}
                </p>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sungold/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 overflow-y-auto no-scrollbar py-4">
              <div className="space-y-1">
                {getNavItems().map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200
                      ${isActive
                        ? 'bg-sungold text-presently-black font-bold shadow-gold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
                    `}
                  >
                    <item.icon size={24} weight="duotone" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-outline/50">
              <button
                onClick={() => {
                  logout.mutate();
                  onClose();
                }}
                className="flex items-center gap-4 w-full px-6 py-5 rounded-2xl text-error font-bold hover:bg-error/5 active:scale-[0.98] transition-all"
              >
                <SignOut size={24} weight="duotone" />
                <span>Sign Out</span>
              </button>

              <div className="mt-4 text-center">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">
                  Presently
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
