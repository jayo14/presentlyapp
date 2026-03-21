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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cardackgroundlack/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        {...modalProps}
        aria-labelledby="dialog-title"
        className="bg-cardackgroundackground text-text border border-outline rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] outline-none relative overflow-hidden"
      >
        {/* End Session Confirmation Overlay */}
        {showEndConfirmation && (
          <div className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="max-w-sm w-full text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={40} />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-text mb-2">End Session?</h3>
                <p className="text-textMuted text-sm">
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
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-text border-none"
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
        <div className="p-4 sm:p-6 border-b border-outline flex justify-between items-center bg-surfaceLow/50 flex-shrink-0">
          <div className="min-w-0 pr-4">
            <h3 id="dialog-title" className="font-headline text-lg sm:text-xl font-bold text-text flex items-center gap-2">
              <span className="p-1.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                <Timer size={20} />
              </span>
              <span className="truncate">Session Details</span>
            </h3>
            <p className="text-xs sm:text-sm text-textMuted mt-1 truncate">{session.course_name} ({session.course_code})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surfaceLow rounded-full transition-colors flex-shrink-0" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            {/* Left Side: QR Code */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-surfaceLow/30">
              <div className="bg-surface p-3 sm:p-4 rounded-2xl shadow-lg border border-outline mb-6 w-full max-w-[240px] aspect-square flex items-center justify-center">
                <QRCodeSVG value={sessionUrl} size={200} level="H" includeMargin className="w-full h-full" />
              </div>
              <div className="text-center space-y-3 group relative w-full">
                <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-textMuted flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Session Code
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </div>
                
                <div className="relative">
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 rounded-2xl blur-xl animate-pulse"></div>
                  
                  {/* Code Container */}
                  <div 
                    className="relative bg-gradient-to-br from-zinc-900 to-black border-outline border-primary/20 rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] group/code"
                    onClick={() => {
                      navigator.clipboard.writeText(session.session_code);
                      toast.success('Code copied to clipboard');
                    }}
                    title="Click to copy code"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=)' }}></div>
                    
                    {/* Code Display */}
                    <div className="relative flex items-center justify-center gap-3">
                      <div className="text-2xl sm:text-4xl font-black text-primary font-mono tracking-wider break-all select-all">
                        {session.session_code}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center opacity-0 group-hover/code:opacity-100 transition-all duration-300 transform group-hover/code:rotate-12">
                        <Copy size={16} className="sm:w-5 sm:h-5 text-primary" />
                      </div>
                    </div>
                    
                    {/* Copy Hint */}
                    <div className="mt-3 text-[10px] sm:text-xs text-textMuted font-medium opacity-0 group-hover/code:opacity-100 transition-opacity duration-300">
                      Click to copy
                    </div>
                  </div>
                </div>
                
                {/* QR Alternative Text */}
                <div className="text-[10px] text-textMuted pt-2">
                  Students can scan QR or enter this code
                </div>
              </div>
            </div>

            {/* Right Side: Stats & Info */}
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Countdown */}
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-textMuted font-bold mb-1">Time Remaining</div>
                    <div className={`text-3xl sm:text-4xl font-mono font-bold tracking-tighter ${isExpired ? 'text-red-500' : 'text-primary'}`}>
                      {timeLeft}
                    </div>
                </div>
                {/* Background pattern */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 text-text pointer-events-none">
                    <Clock size={100} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-surfaceLow border border-outline">
                  <div className="text-textMuted mb-1 flex items-center gap-1.5">
                    <Users size={14} className="flex-shrink-0" /> 
                    <span className="text-[10px] font-bold uppercase truncate">Students</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold">{session.attendee_count || 0}</div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-surfaceLow border border-outline">
                  <div className="text-textMuted mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="flex-shrink-0" /> 
                    <span className="text-[10px] font-bold uppercase truncate">Radius</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold">{session.location_radius}m</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] sm:text-xs font-bold text-textMuted uppercase tracking-wide">Share Link</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-inputccent px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium truncate text-textMuted border border-outline">
                    {sessionUrl}
                  </div>
                  <Button variant="secondary" size="icon" className="flex-shrink-0" onClick={handleCopyLink} title="Copy Link">
                    <Copy size={18} />
                  </Button>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col gap-3">
                {session.is_active && !isExpired ? (
                  <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-text border-none h-11 sm:h-12 rounded-xl text-sm"
                      onClick={handleEndSession}
                      isLoading={isEnding}
                  >
                      <Power size={18} className="mr-2 flex-shrink-0" /> 
                      <span className="truncate">End Session Early</span>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-inputccent rounded-xl text-textMuted font-bold text-sm">
                      <AlertTriangle size={18} className="flex-shrink-0" /> Session Ended
                  </div>
                )}
                <Button variant="secondary" className="w-full h-11 sm:h-12 rounded-xl text-sm" onClick={onClose}>
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
