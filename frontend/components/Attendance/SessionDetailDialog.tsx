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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-surface w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] border border-outline/10 overflow-hidden relative"
        {...modalProps}
      >
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

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side: QR & Identity (Dark side) */}
          <div className="w-full md:w-[45%] bg-zinc-900 p-10 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Mesh */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFD700 1px, transparent 0)', backgroundSize: '24px 24px' }} />
             
             <div className="relative z-10 w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,215,0,0.15)] mb-8 w-full max-w-[240px] aspect-square flex items-center justify-center border-4 border-primary/20">
                  <QRCodeSVG value={sessionUrl} size={180} level="H" includeMargin />
                </div>
                
                <div className="space-y-2 text-center w-full">
                   <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Identity Hub</div>
                   <div 
                     onClick={() => {
                       navigator.clipboard.writeText(session.session_code);
                       toast.success('Code Synchronized');
                     }}
                     className="bg-black/40 border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-primary/30 transition-all group group-active:scale-95"
                   >
                      <div className="text-4xl font-black text-white font-mono tracking-widest group-hover:text-primary transition-colors">{session.session_code}</div>
                      <div className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <Copy size={12} /> Click to Sync
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Telemetry & Actions */}
          <div className="flex-1 p-10 flex flex-col relative">
             <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surfaceHigh/50 flex items-center justify-center text-textMuted hover:text-text hover:rotate-90 transition-all duration-500">
                <X size={20} strokeWidth={3} />
             </button>

             <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-3">
                   <Timer size={14} className="text-primary" />
                   <span className="text-[10px] font-black tracking-widest text-primary uppercase">Live Monitoring</span>
                </div>
                <h3 className="text-3xl font-headline font-black text-text tracking-tight uppercase truncate">{session.course_code}</h3>
                <p className="text-textMuted font-medium truncate">{session.course_name}</p>
             </div>

             <div className="space-y-6 flex-1">
                {/* Countdown */}
                <div className="bg-surfaceLow border border-outline/10 rounded-3xl p-6 relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Time to Auto-Close</p>
                      <div className={`text-5xl font-black font-mono tracking-tighter ${isExpired ? 'text-red-500' : 'text-text'}`}>
                        {timeLeft}
                      </div>
                   </div>
                   <Clock className="absolute top-1/2 -right-4 -translate-y-1/2 text-text opacity-[0.03] w-32 h-32 rotate-12" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-surfaceLow border border-outline/10 rounded-3xl p-5">
                      <div className="flex items-center gap-2 text-primary mb-2">
                         <Users size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Registered</span>
                      </div>
                      <div className="text-3xl font-black">{session.attendee_count || 0}</div>
                   </div>
                   <div className="bg-surfaceLow border border-outline/10 rounded-3xl p-5">
                      <div className="flex items-center gap-2 text-primary mb-2">
                         <MapPin size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Radius</span>
                      </div>
                      <div className="text-3xl font-black">{session.location_radius}m</div>
                   </div>
                </div>

                {/* URL Share */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">Access Endpoint</span>
                      <button onClick={handleCopyLink} className="text-primary hover:text-primary/80 transition-colors">
                        <Share2 size={16} />
                      </button>
                   </div>
                   <div className="bg-surfaceHigh/30 px-5 py-3 rounded-2xl border border-outline/10 text-xs font-mono text-textMuted truncate">
                      {sessionUrl}
                   </div>
                </div>
             </div>

             <div className="mt-10 flex flex-col gap-3">
                {session.is_active && !isExpired ? (
                  <button 
                    onClick={() => setShowEndConfirmation(true)}
                    className="w-full h-16 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Power size={20} /> Terminate Protocol
                  </button>
                ) : (
                  <div className="w-full h-16 bg-surfaceLow rounded-2xl flex items-center justify-center gap-3 text-textMuted font-black uppercase tracking-widest border border-outline/5 grayscale">
                    <AlertTriangle size={20} /> Protocol Inactive
                  </div>
                )}
                <Button variant="secondary" onClick={onClose} className="w-full h-16 rounded-2xl text-lg font-black bg-surfaceHigh hover:bg-surfaceHigh/80">
                   Return to Hub
                </Button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
