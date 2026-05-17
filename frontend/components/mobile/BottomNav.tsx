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
    <div className="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 px-2 pb-8 pt-3 z-50">
      <nav className="flex justify-around items-center">
        {leftItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1.5 p-2 w-16 group outline-none"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={24} 
                  weight={isActive ? "fill" : "regular"} 
                  className={`group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Central Raised Action Button */}
        {mainAction && (
          <div className="relative -top-8 group">
            <button
              onClick={mainAction.onClick}
              className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-[#231f10] transform transition-all active:scale-95 group-hover:-translate-y-1 border-4 border-background-light dark:border-background-dark"
            >
              <mainAction.icon size={32} weight="fill" />
            </button>
            {/* Label for the FAB visually */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold w-max text-slate-500 dark:text-slate-400">
              Mark Attendance
            </span>
          </div>
        )}

        {rightItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1.5 p-2 w-16 group outline-none"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={24} 
                  weight={isActive ? "fill" : "regular"} 
                  className={`group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
