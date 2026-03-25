import React from 'react';
import { X, AlertCircle, RefreshCcw, HelpCircle, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AttendanceFailurePageProps {
  errorMsg?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const AttendanceFailurePage: React.FC<AttendanceFailurePageProps> = ({
  errorMsg = "Your current location (±1,200m) is too far from the session venue. Please move closer to the lecture hall (max 50m).",
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="p-6 flex items-center justify-between relative z-10">
        <button 
          onClick={handleClose}
          className="w-12 h-12 flex items-center justify-center bg-surface/80 backdrop-blur-xl rounded-2xl border border-border active:scale-95 transition-all text-foreground"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60 transition-opacity">Verification Failed</span>
        <div className="w-12 h-12"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Failure Visual */}
        <div className="relative mb-12">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-32 h-32 bg-red-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(220,38,38,0.4)] relative z-20"
            >
               <X size={64} strokeWidth={4} className="text-white" />
            </motion.div>
            
            {/* Animated Rings */}
            <motion.div 
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-red-600 rounded-[2.5rem] z-10"
            />
        </div>

        {/* Text Details */}
        <div className="text-center space-y-4 mb-12 text-foreground">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-headline font-black tracking-tight"
          >
            Check-in<br/>Rejected
          </motion.h2>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-red-500 font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2"
          >
             <TriangleAlert size={14} fill="currentColor" />
             Security Violation
          </motion.div>
        </div>

        {/* Error Details Card */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-surface/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-border space-y-6"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <AlertCircle size={18} />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Rejection Reason</h4>
             </div>
             
             <p className="text-lg font-headline font-bold leading-relaxed text-foreground">
               {errorMsg}
             </p>
          </div>

          <div className="pt-4 border-t border-border flex items-center gap-4 text-[11px] font-bold text-muted-foreground/40">
             <div className="flex items-center gap-1.5"><RefreshCcw size={12} /> Auto-retry active</div>
             <div className="flex items-center gap-1.5"><HelpCircle size={12} /> Support ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
          </div>
        </motion.div>
      </main>

      {/* Footer Actions */}
      <footer className="p-8 space-y-4 relative z-10">
         <motion.button 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.6 }}
           onClick={onRetry}
           className="w-full h-16 bg-foreground text-background rounded-[1.5rem] font-headline font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
         >
            <RefreshCcw size={20} />
            Try Again
         </motion.button>
         
         <motion.button 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.7 }}
           onClick={handleClose}
           className="w-full h-16 bg-surface/80 border border-border rounded-[1.5rem] font-headline font-black text-lg hover:bg-muted/50 transition-all text-foreground"
         >
            Contact Support
         </motion.button>
      </footer>
    </div>
  );
};

export default AttendanceFailurePage;
