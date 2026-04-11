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
 * AAA-Grade Mobile Dock Navigation
 * Optimized for Presently App with smooth physics and glassmorphism.
 * Adaptive to Light and Dark themes.
 */
export const Dock: React.FC<DockProps> = ({ items }) => {
  if (!items.length) return null;

  // Find active index to position the "Glow" background
  const activeIndex = items.findIndex(item => item.active && !item.isAccent);

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <nav
        className={cn(
          'relative flex h-16 items-center justify-around gap-1 pointer-events-auto',
          'rounded-[2.25rem] border border-outline/10 bg-surface/80 dark:bg-zinc-950/70 backdrop-blur-2xl saturate-150',
          'px-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500',
          'max-w-[400px] w-full'
        )}
      >
        {/* Dynamic Background Glow - Slides behind standard items */}
        <div className="absolute inset-0 px-2 pointer-events-none overflow-hidden rounded-[2.25rem]">
          <AnimatePresence>
            {activeIndex !== -1 && (
              <motion.div
                layoutId="dock-glow"
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute top-1 bottom-1 bg-primary/10 blur-xl rounded-full"
                style={{ 
                   left: `${(activeIndex / items.length) * 100}%`,
                   width: `${100 / items.length}%`
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {items.map((item) => {
          const isActive = !!item.active;
          const isAccent = !!item.isAccent;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                'group relative flex flex-col items-center justify-center outline-none transition-all',
                isAccent ? 'w-20' : 'flex-1 h-full'
              )}
            >
              {isAccent ? (
                <div className="relative -top-7">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-[1.5rem]",
                      "bg-gradient-to-br from-primary to-primary/80 text-background",
                      "shadow-[0_8px_30px_rgba(var(--primary-rgb, 99, 102, 241), 0.4)]",
                      "border-[3px] border-surface dark:border-zinc-950 relative z-10"
                    )}
                  >
                    <div className="scale-110">
                      {item.icon}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center z-10 px-2">
                  <motion.div
                    animate={{
                      y: isActive ? -2 : 0,
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={cn(
                      'flex items-center justify-center rounded-xl p-1',
                      isActive 
                        ? 'text-primary' 
                        : 'text-textMuted group-hover:text-text group-active:text-text'
                    )}
                  >
                    {item.icon}
                  </motion.div>
                  
                  <footer className="mt-0.5 flex items-center justify-center">
                    <span
                      className={cn(
                        'text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors duration-200',
                        isActive ? 'text-text' : 'text-textMuted'
                      )}
                    >
                      {item.label}
                    </span>
                  </footer>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
