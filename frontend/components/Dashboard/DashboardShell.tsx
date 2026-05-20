import React from 'react';
import { useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

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
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background selection:bg-sungold/30">
        <AppSidebar onLogout={onLogout} />

        <SidebarInset className="flex flex-col min-h-screen bg-background md:p-2 md:ml-0 transition-all duration-500 ease-premium">
          <div className="flex flex-col flex-1 bg-surface md:rounded-3xl border border-outline shadow-premium overflow-hidden transition-all duration-500 ease-premium">
            <SiteHeader title={title} description={description} />

            <main className="flex-1 overflow-y-auto no-scrollbar">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
