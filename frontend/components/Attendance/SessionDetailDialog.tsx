import React, { useState, useEffect } from 'react';
import { X, Clock, Users, MapPin, Copy, CheckCircle2, AlertTriangle, Timer, Power, Share2, QrCode } from 'lucide-react';
import { Button } from '../Button';
import { QRCodeSVG } from 'qrcode.react';
import { AttendanceSession, sessionApi } from '../../services/api/attendance';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionDetailDialogProps {
  session: AttendanceSession;
  onClose: () => void;
  onSessionEnded?: () => void;
}

export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({ session, onClose, onSessionEnded }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  
  const { modalProps } = useModalAccessibility(true, onClose);

  const sessionUrl = `${window.location.origin}/check-in/${session.session_code}`;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(session.end_time).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0 || !session.is_active) {
        setTimeLeft('00:00:00');
        if (!isExpired && session.is_active && onSessionEnded) {
            onSessionEnded();
        }
        setIsExpired(true);
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [session, isExpired, onSessionEnded]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionUrl);
    toast.success('Link copied to clipboard');
  };

  const confirmEndSession = async () => {
    try {
      setIsEnding(true);
      await sessionApi.end(session.id);
      toast.success('Session terminated');
      if (onSessionEnded) onSessionEnded();
      onClose();
    } catch (err) {
      toast.error('Failed to end session');
    } finally {
      setIsEnding(false);
      setShowEndConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background-dark font-display text-slate-100 overflow-hidden relative">
      <style>{`
        .gold-glow {
            box-shadow: 0 0 40px rgba(255, 202, 13, 0.15);
        }
        
        .pulse-live {
            animation: ripple 2s infinite;
        }

        @keyframes ripple {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .scanning-line {
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #FFCA0D, transparent);
            position: absolute;
            top: 0;
            left: 0;
            animation: scan 3s ease-in-out infinite;
            z-index: 10;
        }

        @keyframes scan {
            0%, 100% { top: 5%; opacity: 0; }
            10%, 90% { opacity: 1; }
            50% { top: 95%; }
        }

        .counter-pulse {
            animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes badge-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>

      {/* Close Button Top Right */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      {/* End Session Overlay */}
      <AnimatePresence>
        {showEndConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-red-600/95 backdrop-blur-md flex items-center justify-center p-12 text-center"
          >
            <div className="space-y-8 max-w-sm">
               <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={48} className="text-white" />
               </div>
               <h3 className="text-4xl font-headline font-black text-white tracking-tight">Terminate Session?</h3>
               <p className="text-white/80 font-medium text-lg">This will immediately block all incoming attendance synchronizations.</p>
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={confirmEndSession}
                    disabled={isEnding}
                    className="w-full h-16 bg-white text-red-600 font-black rounded-2xl text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    {isEnding ? 'Terminating...' : 'Confirm Termination'}
                  </button>
                  <button 
                    onClick={() => setShowEndConfirmation(false)}
                    className="text-white/60 font-black text-sm uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel Operation
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pt-14 pb-4 px-8 flex flex-col gap-1 w-full z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-red-600 pulse-live"></div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">Live Broadcasting</span>
          </div>
          <div className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
            <MapPin size={10} />
            {session.venue_name || 'Classroom'}
          </div>
        </div>
        <div className="mt-2">
           <h1 className="text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
              {session.course_code}
              <span className="text-sm font-normal text-slate-500">{session.course_name}</span>
           </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 overflow-y-auto py-8">
        {/* QR Code Section */}
        <div className="w-full max-w-[320px] aspect-square bg-white p-2 rounded-[2rem] gold-glow border-2 border-primary/30 flex items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
          <div className="scanning-line"></div>
          <div className="bg-white p-4 rounded-xl w-full h-full flex items-center justify-center">
             <QRCodeSVG value={sessionUrl} size={256} level="H" includeMargin />
          </div>
          {/* Aesthetic Corners */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Session Code Display */}
        <div className="mt-10 text-center w-full max-w-sm">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mb-4 font-black">Sync Protocol Code</p>
          <div 
            onClick={() => {
              navigator.clipboard.writeText(session.session_code);
              toast.success('Code copied to clipboard');
            }}
            className="flex items-center justify-center gap-4 bg-white/[0.03] py-5 px-8 rounded-3xl border border-white/10 shadow-inner group cursor-pointer active:scale-95 transition-all"
          >
            <span className="text-5xl font-black text-primary tracking-wider font-mono">
              {session.session_code?.slice(0, 4)}
            </span>
            <div className="h-10 w-[2px] bg-white/10"></div>
            <span className="text-5xl font-black text-primary tracking-wider font-mono">
              {session.session_code?.slice(4)}
            </span>
          </div>
        </div>

        {/* Real-time Counter Badge */}
        <div className="mt-12 relative flex flex-col items-center">
          <div className="relative w-36 h-36 flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 counter-pulse">
            <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent animate-spin duration-[4000ms]"></div>
            <div className="text-center">
              <span className="block text-5xl font-black text-white leading-none">{session.attendee_count || 0}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-2 block">Joined</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Waiting for participants...</p>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="pb-12 px-8 flex flex-col items-center gap-6 z-20 w-full max-w-2xl mx-auto">
        {/* Meta Info Bar */}
        <div className="w-full flex justify-between items-center px-6 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-3xl">
          <div className="flex items-center gap-3">
             <Clock size={18} className="text-slate-500" />
             <span className={`text-sm font-black tracking-widest font-mono ${isExpired ? 'text-red-500' : 'text-slate-300'}`}>
               {timeLeft}
             </span>
          </div>
          <div className="h-5 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-3">
             <div className="flex gap-0.5 items-end h-3">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="w-1 h-2 bg-primary rounded-full"></div>
                <div className="w-1 h-2.5 bg-primary rounded-full"></div>
                <div className="w-1 h-3 bg-primary rounded-full"></div>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Link</span>
          </div>
        </div>

        {/* End Session Button */}
        <div className="w-full relative group">
          {session.is_active && !isExpired ? (
            <button 
              onClick={() => setShowEndConfirmation(true)}
              className="w-full py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all duration-500 active:scale-[0.98]"
            >
              <Power size={18} />
              End Broadcast Session
            </button>
          ) : (
             <button 
              onClick={onClose}
              className="w-full py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 bg-white/5 text-white/40 border border-white/10"
            >
              Session Protocol Ended
            </button>
          )}
          <p className="text-[9px] text-center text-slate-600 mt-3 font-bold uppercase tracking-widest">Confirmation required to end broadcast</p>
        </div>

        {/* Home Indicator Mimic */}
        <div className="w-32 h-1.5 bg-white/10 rounded-full"></div>
      </footer>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none -z-10" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
    </div>
  );
};
