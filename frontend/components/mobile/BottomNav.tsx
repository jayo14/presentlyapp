import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconProps } from '@phosphor-icons/react';
import { cn } from '../../src/components/ui/utils';

export interface NavItem {
  label: string;
  icon: React.ElementType<IconProps>;
  path: string;
}

interface BottomNavProps {
  items: NavItem[];
  mainAction?: {
    icon: React.ElementType<IconProps>;
    label?: string;
    onClick: () => void;
  } | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, mainAction }) => {
  const midPoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midPoint);
  const rightItems = items.slice(midPoint);

  return (
    <div className="fixed bottom-0 left-0 w-full px-6 pb-8 pt-4 z-50 pointer-events-none">
      <div className="max-w-md mx-auto h-[88px] bg-surface/80 backdrop-blur-xl border border-outline/30 rounded-[2.5rem] shadow-premium flex items-center justify-around px-4 pointer-events-auto">
        {leftItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1.5 px-3 py-2 transition-all active:scale-90"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={24}
                  weight={isActive ? "bold" : "regular"}
                  className={cn("transition-colors", isActive ? 'text-sungold' : 'text-on-surface-variant/60')}
                />
                <span className={cn("text-[9px] font-bold uppercase tracking-widest", isActive ? 'text-on-surface' : 'text-on-surface-variant/40')}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Central Raised Action Button */}
        {mainAction && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={mainAction.onClick}
            className="relative -top-8 w-16 h-16 bg-sungold text-presently-black rounded-[35%] flex items-center justify-center shadow-gold border-4 border-surface group"
          >
            <mainAction.icon size={28} weight="bold" />
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}

        {rightItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1.5 px-3 py-2 transition-all active:scale-90"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={24}
                  weight={isActive ? "bold" : "regular"}
                  className={cn("transition-colors", isActive ? 'text-sungold' : 'text-on-surface-variant/60')}
                />
                <span className={cn("text-[9px] font-bold uppercase tracking-widest", isActive ? 'text-on-surface' : 'text-on-surface-variant/40')}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
