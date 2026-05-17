import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconProps } from '@phosphor-icons/react';

export interface NavItem {
  label: string;
  icon: React.ElementType<IconProps>;
  path: string;
}

interface BottomNavProps {
  items: NavItem[];
  mainAction?: {
    icon: React.ElementType<IconProps>;
    onClick: () => void;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, mainAction }) => {
  const midPoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midPoint);
  const rightItems = items.slice(midPoint);

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none pb-safe">
      <div 
        className="pointer-events-auto flex items-center justify-between gap-1 px-3 py-2.5 rounded-full w-max min-w-[320px] max-w-[380px] md:max-w-[480px]"
        style={{
          background: 'var(--bottom-nav-bg, rgba(255,255,255,0.72))',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid var(--bottom-nav-border, rgba(255,255,255,0.3))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.10)',
        }}
      >
        {leftItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-0.5 w-12 h-12 min-w-[48px]"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-sungold/12 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
                  />
                )}
                <item.icon 
                  size={22} 
                  weight={isActive ? "duotone" : "regular"} 
                  className={`relative z-10 ${isActive ? 'text-sungold' : 'text-slate-400'}`}
                />
                <span className={`text-[9px] font-black uppercase tracking-[0.12em] relative z-10 ${isActive ? 'text-sungold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Central Raised Action Button */}
        {mainAction && (
          <div className="relative px-2">
            <button
              onClick={mainAction.onClick}
              className="w-14 h-14 bg-sungold text-presently-black rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(245,197,24,0.4)] -mt-8 relative z-50 active:scale-95 transition-transform border-4 border-white dark:border-charcoal"
            >
              <mainAction.icon size={26} weight="bold" />
            </button>
          </div>
        )}

        {rightItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-0.5 w-12 h-12 min-w-[48px]"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-sungold/12 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
                  />
                )}
                <item.icon 
                  size={22} 
                  weight={isActive ? "duotone" : "regular"} 
                  className={`relative z-10 ${isActive ? 'text-sungold' : 'text-slate-400'}`}
                />
                <span className={`text-[9px] font-black uppercase tracking-[0.12em] relative z-10 ${isActive ? 'text-sungold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
