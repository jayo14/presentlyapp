import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { SearchExpand } from './SearchExpand';
import { ThemeToggle } from '../ThemeToggle';
import { useCurrentUser } from '../../hooks/useAuth';
import { cn } from '../../src/components/ui/utils';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  onMenuClick
}) => {
  const { data: currentUser } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-surface/40 backdrop-blur-md border-b border-outline/50">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-surface-highest rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-on-surface truncate tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-on-surface-variant font-medium truncate">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <SearchExpand />

        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2.5 hover:bg-surface-highest rounded-full transition-colors relative">
            <Bell size={18} className="text-on-surface-variant" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sungold rounded-full border-2 border-surface" />
          </button>
        </div>

        <button className="flex items-center gap-3 p-1 pr-3 hover:bg-surface-highest rounded-full transition-colors border border-outline">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline bg-primary/10 flex-shrink-0">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <span className="hidden lg:block text-xs font-bold text-on-surface max-w-[100px] truncate">
            {currentUser?.full_name?.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
