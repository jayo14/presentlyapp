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
}

export const BottomNav: React.FC<BottomNavProps> = ({ items }) => {
  return (
    <nav className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-6 pb-safe">
      <div className="glass-dock liquid-glass pointer-events-auto flex items-center justify-between gap-1 px-4 py-2.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-sm w-full">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-300
              ${isActive ? 'text-sungold' : 'text-on-surface-variant hover:text-on-surface'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-sungold/10 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <item.icon 
                  size={24} 
                  weight={isActive ? "duotone" : "regular"} 
                  className="relative z-10"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-sungold rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
