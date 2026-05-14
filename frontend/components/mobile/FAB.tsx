import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Scan, Keyboard, IconProps } from '@phosphor-icons/react';

interface FABAction {
  icon: React.ElementType<IconProps>;
  label: string;
  onClick: () => void;
}

interface FABProps {
  mainIcon?: React.ElementType<IconProps>;
  actions?: FABAction[];
  onMainClick?: () => void;
}

export const FAB: React.FC<FABProps> = ({ 
  mainIcon: MainIcon = Plus, 
  actions = [], 
  onMainClick 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (onMainClick) {
      onMainClick();
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="relative">
        {/* Sub-actions */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: -(64 * (index + 1)),
                x: index % 2 === 0 ? -48 : 48 
              }}
              exit={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="absolute left-1/2 -translate-x-1/2 p-4 bg-surface border border-outline rounded-2xl shadow-xl flex items-center justify-center group"
            >
              <action.icon size={24} weight="duotone" className="text-primary" />
              <span className="absolute right-full mr-4 bg-presently-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {action.label}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={handleMainClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="w-16 h-16 bg-sungold text-presently-black rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(245,197,24,0.4)] border-4 border-white dark:border-[#0D0D0D] relative z-10"
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <MainIcon size={32} weight="bold" />
          </motion.div>
          
          {/* Pulsing ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-sungold animate-ping opacity-20" />
          )}
        </motion.button>
      </div>
    </div>
  );
};
