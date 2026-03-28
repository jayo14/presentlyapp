import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  className = ''
}) => {
  const isHorizontal = side === 'left' || side === 'right';
  
  const variants = {
    hidden: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet Content */}
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-[110] bg-white dark:bg-surface shadow-2xl flex flex-col ${
              side === 'right' ? 'top-0 right-0 h-full w-full sm:max-w-md border-l border-outline/10' :
              side === 'left' ? 'top-0 left-0 h-full w-full sm:max-w-md border-r border-outline/10' :
              side === 'top' ? 'top-0 left-0 w-full h-auto max-h-[90vh] border-b border-outline/10' :
              'bottom-0 left-0 w-full h-auto max-h-[90vh] rounded-t-[2.5rem] border-t border-outline/10'
            } ${className}`}
          >
            <div className={`p-8 flex flex-col h-full overflow-hidden ${side === 'bottom' ? 'pb-12' : ''}`}>
               {/* Header */}
               <div className="flex justify-between items-start mb-8 flex-shrink-0">
                  <div className="space-y-1">
                     {title && <h2 className="text-3xl font-headline font-black text-text tracking-tight uppercase">{title}</h2>}
                     {description && <p className="text-textMuted font-medium text-sm">{description}</p>}
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-surfaceHigh/50 flex items-center justify-center text-textMuted hover:text-text hover:bg-surfaceHigh transition-all active:scale-90"
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
               </div>

               {/* Children */}
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {children}
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
