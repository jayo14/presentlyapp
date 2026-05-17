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
    <div className="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5 px-2 pb-10 pt-4 z-50">
      <nav className="flex justify-around items-center">
        {leftItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-2 p-2 w-20 group outline-none"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={28} 
                  weight={isActive ? "fill" : "regular"} 
                  className={`group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                />
                <span className={`text-[11px] font-bold ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Central Raised Action Button */}
        {mainAction && (
          <div className="relative -top-10 group">
            <button
              onClick={mainAction.onClick}
              className="w-[76px] h-[76px] bg-primary rounded-[2rem] shadow-[0_8px_30px_rgba(249,196,6,0.35)] flex items-center justify-center text-[#231f10] transform transition-all active:scale-95 group-hover:-translate-y-1.5 border-[6px] border-background-light dark:border-background-dark"
            >
              <mainAction.icon size={36} weight="fill" />
            </button>
            {/* Label for the FAB visually */}
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-bold w-max text-slate-500 dark:text-slate-400">
              Mark Attendance
            </span>
          </div>
        )}

        {rightItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-2 p-2 w-20 group outline-none"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={28} 
                  weight={isActive ? "fill" : "regular"} 
                  className={`group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                />
                <span className={`text-[11px] font-bold ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
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
