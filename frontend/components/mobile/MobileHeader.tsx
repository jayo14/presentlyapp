import React from 'react';
import { List, Bell, UserCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../hooks/useAuth';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSidebar, onOpenNotifications }) => {
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-[60] w-full pt-safe">
      <div className="mx-4 mt-4 glass-morphism rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Left: Menu Toggle */}
        <button 
          onClick={onOpenSidebar}
          className="p-2 rounded-xl active:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <List size={24} weight="duotone" className="text-on-surface" />
        </button>

        {/* Center: App Brand/Logo */}
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
           <span className="font-display text-xl font-bold tracking-tight text-on-surface">
             Presently
           </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl active:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={24} weight="duotone" className="text-on-surface" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
          </button>
          
          <button className="p-1 rounded-full border border-outline/50 overflow-hidden active:scale-95 transition-transform">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-8 h-8 object-cover" />
            ) : (
              <UserCircle size={32} weight="duotone" className="text-on-surface-variant" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
