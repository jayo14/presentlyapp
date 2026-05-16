import React, { useState, useEffect } from 'react';
import { List, X, Bell, UserCircle } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCurrentUser } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSidebar, isSidebarOpen }) => {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Assuming unread notifications exist for demo purposes
  const hasUnread = true; 

  return (
    <header 
      className={`sticky top-0 z-[60] w-full pt-safe transition-all duration-300 ${
        scrolled 
          ? 'bg-off-white/80 dark:bg-charcoal/80 backdrop-blur-xl shadow-md' 
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu Toggle */}
        <button 
          onClick={onOpenSidebar}
          className="w-11 h-11 flex items-center justify-center rounded-xl active:scale-92 transition-transform"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isSidebarOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              {isSidebarOpen ? (
                <X size={24} weight="regular" className="text-presently-black dark:text-white" />
              ) : (
                <List size={24} weight="regular" className="text-presently-black dark:text-white" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Center: App Brand/Logo */}
        <div className="flex items-center gap-2">
           <span className="font-display text-xl font-bold tracking-tight text-presently-black dark:text-white">
             Presently
           </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="relative w-11 h-11 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell size={24} weight={hasUnread ? "duotone" : "regular"} className="text-presently-black dark:text-white" />
            <AnimatePresence>
              {hasUnread && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2.5 right-2.5 w-2 h-2 bg-soft-coral rounded-full" 
                />
              )}
            </AnimatePresence>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="w-9 h-9 rounded-full border-2 border-sungold/40 overflow-hidden active:scale-[0.94] transition-transform flex items-center justify-center bg-pale-honey text-presently-black"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold">
                {user?.full_name?.charAt(0) || 'P'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
