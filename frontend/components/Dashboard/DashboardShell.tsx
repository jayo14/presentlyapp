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

        <SidebarInset className="flex flex-col min-h-screen bg-background md:p-4 md:ml-0 transition-all duration-500 ease-premium">
          <div className="flex flex-col flex-1 bg-surface md:rounded-[2.5rem] border border-outline/60 shadow-premium overflow-hidden transition-all duration-500 ease-premium relative">
            <SiteHeader title={title} description={description} />

            <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
              <div className="max-w-7xl mx-auto p-4 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.2, 0.8, 0.2, 1] // ease-premium
                    }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* Subtle premium background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sungold/5 blur-[120px] pointer-events-none -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-teal/5 blur-[100px] pointer-events-none -ml-32 -mb-32" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
