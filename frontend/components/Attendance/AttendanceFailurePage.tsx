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
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="p-6 flex items-center justify-between relative z-10">
        <button 
          onClick={handleClose}
          className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-95 transition-all"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-red-500">Verification Failed</span>
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
               <X size={64} strokeWidth={4} className="text-[#111111]" />
            </motion.div>
            
            {/* Animated Rings */}
            <motion.div 
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-red-600 rounded-[2.5rem] z-10"
            />
        </div>

        {/* Text Details */}
        <div className="text-center space-y-4 mb-12">
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
          className="w-full bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 space-y-6"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <AlertCircle size={18} />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Rejection Reason</h4>
             </div>
             
             <p className="text-lg font-headline font-bold leading-relaxed text-red-100/90">
               {errorMsg}
             </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-4 text-[11px] font-bold opacity-40">
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
           className="w-full h-16 bg-white text-[#111111] rounded-[1.5rem] font-headline font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
         >
            <RefreshCcw size={20} />
            Try Again
         </motion.button>
         
         <motion.button 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.7 }}
           onClick={handleClose}
           className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] font-headline font-black text-lg hover:bg-white/10 transition-all"
         >
            Contact Support
         </motion.button>
      </footer>
    </div>
  );
};

export default AttendanceFailurePage;
