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

  const handleShare = async () => {
    const shareMessage = `Join attendance for ${session.course_code}: ${session.course_name}\nVenue: ${session.venue_name || 'Classroom'}\nSession Code: ${session.session_code}\nLink: ${sessionUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Attendance Session: ${session.course_code}`,
          text: shareMessage,
          url: sessionUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        toast.success('Check-in details copied to clipboard');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Could not share. Details copied to clipboard.');
        await navigator.clipboard.writeText(shareMessage);
      }
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('session-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${session.course_code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code downloaded');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 font-sans text-slate-100 overflow-hidden" {...modalProps}>
      <style>{`
        .gold-glow {
            box-shadow: 0 0 60px rgba(255, 202, 13, 0.2);
        }
        
        .pulse-live {
            animation: ripple 2s infinite;
        }

        @keyframes ripple {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .counter-pulse {
            animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes badge-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.9; }
        }
      `}</style>

      {/* Close Button Top Right */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
      >
        <X size={28} />
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

      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="pt-8 sm:pt-16 pb-6 sm:pb-8 px-6 sm:px-10 flex flex-col gap-2 w-full z-20 shrink-0">
          <div className="flex justify-between items-center gap-4">

            <div className="text-[10px] sm:text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-md flex items-center gap-2 sm:gap-3 truncate max-w-[80%]">
              <MapPin size={12} className="shrink-0 sm:w-4 sm:h-4" />
              <span className="truncate">{session.venue_name || 'Main Hall'}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex flex-col gap-1 sm:gap-2">
              {session.course_code}
              <span className="text-sm sm:text-xl font-normal text-slate-500 line-clamp-1">{session.course_name}</span>
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-8 z-10 py-6 sm:py-12 space-y-12 sm:space-y-20">
          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
            <div className="w-[min(85vw,380px)] aspect-square bg-white p-2 sm:p-3 rounded-[2rem] sm:rounded-[3rem] gold-glow border-2 border-primary/30 flex items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700 mx-auto">
              <div className="bg-white p-4 sm:p-6 rounded-2xl w-full h-full flex items-center justify-center">
                <QRCodeSVG id="session-qr-code" value={sessionUrl} size={320} style={{ width: '100%', height: '100%' }} level="H" includeMargin />
              </div>
              {/* Aesthetic Corners */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 w-8 h-8 sm:w-12 sm:h-12 border-t-[4px] sm:border-t-[6px] border-l-[4px] sm:border-l-[6px] border-primary rounded-tl-xl sm:rounded-tl-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-12 sm:h-12 border-t-[4px] sm:border-t-[6px] border-r-[4px] sm:border-r-[6px] border-primary rounded-tr-xl sm:rounded-tr-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 w-8 h-8 sm:w-12 sm:h-12 border-b-[4px] sm:border-b-[6px] border-l-[4px] sm:border-l-[6px] border-primary rounded-bl-xl sm:rounded-bl-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-8 h-8 sm:w-12 sm:h-12 border-b-[4px] sm:border-b-[6px] border-r-[4px] sm:border-r-[6px] border-primary rounded-br-xl sm:rounded-br-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-3 sm:gap-4 w-full justify-center px-4">
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white/60 hover:text-primary hover:border-primary/30 hover:bg-white/10 transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
              >
                <Share2 size={14} className="sm:w-4 sm:h-4" />
                Share Link
              </button>
              <button
                onClick={handleDownloadQR}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white/60 hover:text-primary hover:border-primary/30 hover:bg-white/10 transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest whitespace-nowrap"
              >
                <QrCode size={14} className="sm:w-4 sm:h-4" />
                Save QR
              </button>
            </div>
          </div>

          {/* Session Code Display */}
          <div className="text-center w-full max-w-xl px-4">
            <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-4 sm:mb-6 font-black">Session Code</p>
            <div
              onClick={() => {
                navigator.clipboard.writeText(session.session_code);
                toast.success('Code copied to clipboard');
              }}
              className="flex items-center justify-center bg-white/[0.03] py-5 sm:py-8 px-6 sm:px-12 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-inner group cursor-pointer active:scale-95 transition-all hover:bg-white/[0.05]"
            >
              <span className="text-4xl sm:text-7xl font-black text-primary tracking-[0.2em] font-mono">
                {session.session_code}
              </span>
            </div>
          </div>

          {/* Real-time Counter Badge */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-36 h-36 sm:w-52 sm:h-52 flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 counter-pulse">
              <div className="absolute inset-0 rounded-full border-[6px] sm:border-[8px] border-primary border-t-transparent animate-spin duration-[5000ms]"></div>
              <div className="text-center">
                <span className="block text-4xl sm:text-7xl font-black text-white leading-none">{session.attendee_count || 0}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-black mt-2 sm:mt-4 block">Total Joined</span>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center gap-2 sm:gap-3 bg-white/5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse"></div>
              <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Participants</p>
            </div>
          </div>
        </main>

        {/* Footer Controls */}
        <footer className="pb-8 sm:pb-16 px-6 sm:px-10 flex flex-col items-center gap-6 sm:gap-10 z-20 w-full max-w-4xl mx-auto shrink-0">
          {/* Meta Info Bar */}
          <div className="w-full flex justify-between items-center px-6 sm:px-10 py-4 sm:py-6 bg-white/[0.02] rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-2 sm:gap-4 font-mono truncate">
              <Clock size={18} className="text-slate-500 shrink-0 sm:w-6 sm:h-6" />
              <span className={`text-lg sm:text-2xl font-black tracking-widest ${isExpired ? 'text-red-500' : 'text-slate-300'}`}>
                {timeLeft}
              </span>
            </div>
            <div className="h-6 sm:h-8 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden xs:flex gap-0.5 sm:gap-1 items-end h-4 sm:h-5">
                <div className="w-1.5 h-2 bg-primary rounded-full"></div>
                <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Secure Link</span>
            </div>
          </div>

          {/* End Session Button */}
          <div className="w-full relative group max-w-2xl px-4 text-center">
            {session.is_active && !isExpired ? (
              <button
                onClick={() => setShowEndConfirmation(true)}
                className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center justify-center gap-3 sm:gap-4 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all duration-700 active:scale-[0.98] shadow-lg shadow-red-900/10"
              >
                <Power size={20} className="sm:w-6 sm:h-6" />
                Terminate Broadcast
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center justify-center gap-3 sm:gap-4 bg-white/5 text-white/40 border border-white/10"
              >
                Broadcast Concluded
              </button>
            )}
            <p className="text-[9px] sm:text-[10px] text-center text-slate-600 mt-3 sm:mt-4 font-black uppercase tracking-widest">Warning: Action will block all incoming synced data</p>
          </div>

          {/* Home Indicator Mimic */}
          <div className="w-32 sm:w-40 h-1 sm:h-2 bg-white/10 rounded-full"></div>
        </footer>
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-[-15%] right-[-10%] w-[80%] h-[80%] bg-primary/5 blur-[180px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-15%] left-[-15%] w-[70%] h-[70%] bg-red-900/5 blur-[160px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none -z-10"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}
      ></div>
    </div>
  );
};
