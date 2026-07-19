import React from 'react';
import {
  MagnifyingGlass,
  Bell,
  UserCircle,
  List,
  Plus
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SearchExpand } from '../Dashboard/SearchExpand';

interface SiteHeaderProps {
  title: string;
  onMenuClick: () => void;
  userAvatar?: string;
  userInitials?: string;
  onProfileClick: () => void;
  isAdmin?: boolean;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  title,
  onMenuClick,
  userAvatar,
  userInitials,
  onProfileClick,
  isAdmin
}) => {
  return (
    <header className="h-[80px] flex items-center justify-between px-6 md:px-8 border-b border-outline bg-surface/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-textMuted hover:bg-surface-highest/40 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <List size={20} weight="bold" />
        </button>
        <h2 className="text-lg font-bold text-text tracking-tight font-headline hidden md:block">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <SearchExpand />

        <button
          className="p-2 text-textMuted hover:bg-surface-highest/40 hover:text-text rounded-xl transition-all relative"
          aria-label="View notifications"
        >
          <Bell size={20} weight="bold" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sungold rounded-full border-2 border-surface" />
        </button>

        <div className="h-8 w-px bg-outline mx-1 hidden md:block" />

        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-surface-highest/40 transition-all border border-transparent hover:border-outline group"
          aria-label="User profile"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-low border border-outline flex items-center justify-center font-bold text-xs text-textMuted group-hover:scale-95 transition-transform">
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userInitials || <UserCircle size={20} />
            )}
          </div>
          <span className="text-sm font-bold text-text hidden sm:block">
            {userInitials}
          </span>
        </button>
      </div>
    </header>
  );
};
