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
    // Add haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (onMainClick) {
      onMainClick();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[92px] right-6 z-50">
        <div className="relative">
          {/* Sub-actions */}
          <AnimatePresence>
            {isOpen && actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: -((index + 1) * 64) 
                }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ 
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 300,
                  damping: 24
                }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="absolute right-1 w-12 h-12 bg-charcoal text-white rounded-full shadow-lg flex items-center justify-center group"
              >
                <action.icon size={22} weight="duotone" />
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.08) + 0.1 }}
                  className="absolute right-[56px] bg-charcoal text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  {action.label}
                </motion.span>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Main Button */}
          <motion.button
            onClick={handleMainClick}
            whileTap={{ scale: 0.92 }}
            className="w-[60px] h-[60px] bg-sungold text-presently-black rounded-full flex items-center justify-center shadow-gold relative z-10"
          >
            <motion.div
              animate={{ rotate: isOpen ? 135 : 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <MainIcon size={28} weight="bold" />
            </motion.div>
            
            {/* Pulsing ring */}
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-sungold animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
};
