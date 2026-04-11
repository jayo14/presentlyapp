import React from 'react';
import { X, RefreshCcw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AttendanceFailurePageProps {
  errorMsg?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const AttendanceFailurePage: React.FC<AttendanceFailurePageProps> = ({
  errorMsg = "Your location is too far from the session venue.",
  onRetry,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border border-outline rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-8 flex flex-col items-center text-center">
          {/* Status Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
              <X size={32} strokeWidth={3} />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-500/20 rounded-full"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-text mb-2 tracking-tight">Check-in Failed</h2>
          
          {/* Detailed Message */}
          <div className="bg-surfaceLow border border-outline rounded-2xl p-5 mb-8 w-full">
            <p className="text-sm font-medium leading-relaxed text-textMuted">
              {errorMsg}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button 
              onClick={onRetry}
              className="w-full h-14 bg-primary text-black rounded-xl font-headline font-black text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Try Again
            </button>
            
            <button 
              onClick={handleClose}
              className="w-full h-14 bg-surfaceHigh text-text rounded-xl font-bold text-sm hover:bg-surfaceHigh/80 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-surfaceLow py-4 px-6 border-t border-outline flex items-center justify-center gap-2 text-[10px] font-bold text-textMuted uppercase tracking-widest">
          <AlertCircle size={12} />
          Verification Unsuccessful
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceFailurePage;
