import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertCircle className="text-red-500" size={32} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={32} />;
      default: return <HelpCircle className="text-primary" size={32} />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger': return 'bg-red-500 text-background hover:bg-red-600 shadow-red-500/20';
      case 'warning': return 'bg-amber-500 text-background hover:bg-amber-600 shadow-amber-500/20';
      default: return 'bg-primary text-[#111111] hover:bg-primary/90 shadow-primary/20';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-surface rounded-[2.5rem] shadow-2xl border border-outline/10 overflow-hidden"
        >
          <div className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-surfaceLow flex items-center justify-center mb-2">
                {getIcon()}
              </div>
              <h3 className="text-2xl font-headline font-black text-text tracking-tight uppercase tracking-widest leading-tight">{title}</h3>
              <p className="text-sm font-medium text-textMuted leading-relaxed">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="h-14 rounded-2xl bg-surfaceHigh/50 text-textMuted font-headline font-black text-xs uppercase tracking-widest border border-outline/5 hover:bg-surfaceHigh transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`h-14 rounded-2xl font-headline font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${getConfirmButtonClasses()}`}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-surfaceLow text-textMuted transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
