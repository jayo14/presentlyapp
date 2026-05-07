import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../ui/utils';

export type DockItemConfig = {
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

/**
 * Redesigned Premium Mobile Dock Navigation
 * Optimized for Presently with glassmorphism and thumb-friendly ergonomics.
 */
export const Dock: React.FC<DockProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom,24px)] pt-10 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent">
      <nav
        className={cn(
          'relative flex h-[72px] items-center justify-around gap-1 pointer-events-auto',
          'rounded-full border border-outline/20 bg-surface/80 dark:bg-zinc-950/70 backdrop-blur-2xl',
          'px-2 shadow-dock transition-all duration-500',
          'max-w-[440px] w-full'
        )}
      >
        {items.map((item) => {
          const isActive = !!item.active;
          const isAccent = !!item.isAccent;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              className={cn(
                'group relative flex flex-col items-center justify-center outline-none transition-all',
                isAccent ? 'w-16' : 'flex-1 h-full'
              )}
            >
              {isAccent ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full",
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                    "relative z-10"
                  )}
                >
                  {item.icon}
                </motion.div>
              ) : (
                <div className="relative flex flex-col items-center justify-center z-10">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={cn(
                      'flex items-center justify-center rounded-xl p-1 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-textMuted group-hover:text-text'
                    )}
                  >
                    {item.icon}
                  </motion.div>

                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors mt-0.5',
                      isActive ? 'text-text' : 'text-textMuted'
                    )}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
