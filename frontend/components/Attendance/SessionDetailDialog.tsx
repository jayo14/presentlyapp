import React, { useState, useEffect } from 'react';
import { X, Clock, Users, MapPin, ExternalLink, Copy, CheckCircle2, AlertTriangle, Timer, Power } from 'lucide-react';
import { Button } from '../Button';
import { QRCodeSVG } from 'qrcode.react';
import { AttendanceSession, sessionApi } from '../../services/api/attendance';
import { toast } from 'sonner';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface SessionDetailDialogProps {
  session: AttendanceSession;
  onClose: () => void;
  onSessionEnded?: () => void;
}

export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({ session, onClose, onSessionEnded }) => {
  const [timeLeft, setTimeTimeout] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const { modalProps } = useModalAccessibility(true, onClose);

  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Link for the session
  const sessionUrl = `${window.location.origin}/check-in/${session.session_code}`;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(session.end_time).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0 || !session.is_active) {
        setTimeTimeout('00:00:00');
        if (!isExpired && session.is_active && onSessionEnded) {
            onSessionEnded();
        }
        setIsExpired(true);
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeTimeout(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionUrl);
    toast.success('Link copied to clipboard');
  };

  const handleEndSession = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndSession = async () => {
    try {
      setIsEnding(true);
      await sessionApi.end(session.id);
      toast.success('Session ended successfully');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        {...modalProps}
        aria-labelledby="dialog-title"
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] outline-none relative overflow-hidden"
      >
        {/* End Session Confirmation Overlay */}
        {showEndConfirmation && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="max-w-sm w-full text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">End Session?</h3>
                <p className="text-zinc-500 text-sm">
                  Are you sure you want to end this session early? Students will no longer be able to check in.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="secondary" 
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setShowEndConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none"
                  onClick={confirmEndSession}
                  isLoading={isEnding}
                >
                  Confirm End
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
          <div>
            <h3 id="dialog-title" className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Timer size={20} />
              </span>
              Session Details
            </h3>
            <p className="text-sm text-zinc-500 mt-1">{session.course_name} ({session.course_code})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid md:grid-cols-2">
            {/* Left Side: QR Code */}
            <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/20">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-zinc-100 mb-6">
                <QRCodeSVG value={sessionUrl} size={200} level="H" includeMargin />
              </div>
              <div className="text-center space-y-2 group relative">
                <div className="text-xs uppercase tracking-widest font-bold text-zinc-400">Session Code</div>
                <div 
                  className="text-3xl font-black text-primary font-mono tracking-tighter cursor-pointer flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(session.session_code);
                    toast.success('Code copied to clipboard');
                  }}
                  title="Click to copy code"
                >
                  {session.session_code}
                  <Copy size={20} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                </div>
              </div>
            </div>

            {/* Right Side: Stats & Info */}
            <div className="p-8 space-y-8">
              {/* Countdown */}
              <div className="bg-zinc-900 dark:bg-black rounded-2xl p-6 border border-zinc-800 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">Time Remaining</div>
                    <div className={`text-4xl font-mono font-bold tracking-tighter ${isExpired ? 'text-red-500' : 'text-primary'}`}>
                      {timeLeft}
                    </div>
                </div>
                {/* Background pattern */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 text-white">
                    <Clock size={100} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <div className="text-zinc-500 mb-1 flex items-center gap-1.5"><Users size={14} /> <span className="text-[10px] font-bold uppercase">Students</span></div>
                  <div className="text-xl font-bold">{session.attendee_count || 0}</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <div className="text-zinc-500 mb-1 flex items-center gap-1.5"><MapPin size={14} /> <span className="text-[10px] font-bold uppercase">Radius</span></div>
                  <div className="text-xl font-bold">{session.location_radius}m</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Share Link</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 rounded-xl text-sm font-medium truncate text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                    {sessionUrl}
                  </div>
                  <Button variant="secondary" size="icon" onClick={handleCopyLink} title="Copy Link">
                    <Copy size={18} />
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                {session.is_active && !isExpired ? (
                  <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white border-none h-12 rounded-xl"
                      onClick={handleEndSession}
                      isLoading={isEnding}
                  >
                      <Power size={18} className="mr-2" /> End Session Early
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-500 font-bold text-sm">
                      <AlertTriangle size={18} /> Session Ended
                  </div>
                )}
                <Button variant="secondary" className="w-full h-12 rounded-xl" onClick={onClose}>
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
