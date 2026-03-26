import React from "react";
import { motion } from "framer-motion";

type DockItemConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  isAccent?: boolean;
};

interface DockProps {
  items: DockItemConfig[];
}

export const Dock: React.FC<DockProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="pointer-events-auto mx-auto flex h-20 items-center justify-around gap-1 rounded-[2.5rem] border border-outline/10 bg-surface/95 dark:bg-surface/95 px-4 shadow-[0_32px_64px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-500 max-w-sm">
      {items.map((item) => {
        const isActive = !!item.active;
        const isAccent = !!item.isAccent;

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`group relative flex flex-col items-center justify-center min-w-[64px] transition-all duration-300 ${isAccent ? '-top-4 scale-110' : ''}`}
          >
            <div
              className={`
                flex items-center justify-center rounded-2xl transition-all duration-500 ease-out
                ${isAccent 
                  ? "h-16 w-16 bg-primary text-background shadow-[0_12px_24px_rgba(0,0,0,0.2)] group-hover:scale-105" 
                  : `h-10 w-10 ${isActive ? 'bg-primary/10 text-primary' : 'bg-transparent text-textMuted group-hover:bg-surfaceHigh/50 group-hover:text-text'}`
                }
              `}
            >
              <div className={isAccent ? "scale-125" : "scale-100"}>
                {item.icon}
              </div>
            </div>
            
            {!isAccent && (
              <span
                className={`
                  text-[9px] font-black uppercase tracking-[0.15em] mt-1.5 transition-all duration-300
                  ${isActive ? "text-primary opacity-100" : "text-textMuted opacity-40 group-hover:opacity-100 group-hover:text-text"}
                `}
              >
                {item.label}
              </span>
            )}
            
            {isActive && !isAccent && (
              <motion.div 
                layoutId="dock-dot"
                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_4px_rgba(var(--primary-rgb),0.8)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export type { DockItemConfig as DockItem };
