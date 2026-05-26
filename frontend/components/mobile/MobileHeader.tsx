import React, { useState, useEffect } from 'react';
import { List, Bell } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCurrentUser } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-[60] w-full pt-safe transition-all duration-500 ease-premium ${
        scrolled 
          ? 'bg-surface/80 backdrop-blur-xl shadow-lg border-b border-outline/10'
          : 'bg-background'
      }`}
    >
      <div className="flex items-center justify-between h-[72px] px-6">
        <button 
          onClick={onMenuClick}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-outline/40 shadow-sm active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <List size={24} weight="bold" className="text-on-surface" />
        </button>

        <div className="flex-1 flex justify-center">
           <Logo showText={false} className="scale-90" />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-outline/40 shadow-sm active:scale-95 transition-all relative"
            aria-label="Notifications"
          >
            <Bell size={24} weight="bold" className="text-on-surface" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-sungold rounded-full border-2 border-surface shadow-gold" />
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="w-10 h-10 rounded-2xl border-2 border-sungold/40 overflow-hidden active:scale-95 transition-all flex items-center justify-center bg-surface shadow-sm"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-presently-black">
                {user?.full_name?.charAt(0) || 'P'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
