import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { UserRole } from '../../types';
import { cn } from '../../src/components/ui/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { Logo } from '../Logo';
import { getNavItemsForRole } from '../../utils/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  onLogout: () => void;
  title: string;
  description?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  userRole,
  userName,
  onLogout,
  title,
  description
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const roleName = userRole?.toLowerCase() || 'user';
  const navItems = getNavItemsForRole(roleName);

  return (
    <div className="app-shell min-h-screen selection:bg-sungold/30">
      <div className="dashboard-window h-full">
        {/* DESKTOP SIDEBAR */}
        <DashboardSidebar userRole={userRole} onLogout={onLogout} />

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-surface z-50 md:hidden flex flex-col"
              >
                <div className="p-6 flex items-center justify-between border-b border-outline/50">
                  <Logo />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-surface-highest rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => {
                    const active = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.href && navigate(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold",
                          active ? "bg-sungold text-presently-black shadow-gold" : "text-on-surface-variant hover:bg-surface-highest"
                        )}
                      >
                        <Icon size={22} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="p-6 border-t border-outline/50">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-error font-bold hover:bg-error/10 transition-colors"
                  >
                    <LogOut size={22} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background md:bg-surface">
          <DashboardHeader
            title={title}
            description={description}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto no-scrollbar bg-surface md:bg-transparent">
            <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
