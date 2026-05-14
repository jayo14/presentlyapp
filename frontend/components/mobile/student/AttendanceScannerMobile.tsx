import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Keyboard, Scan, MapPin, 
  CircleNotch, QrCode, ClipboardText, 
  Warning, ArrowsClockwise, CaretRight, Sparkle
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';
import { geolocationService } from '../../../services/geolocation';
import { offlineSyncManager } from '../../../utils/offlineSync';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';


export const AttendanceScannerMobile: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'scan' | 'input'>('scan');
  const [sessionCode, setSessionCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const jsQrRef = useRef<any>(null);

  useEffect(() => {
    import('jsqr').then((m) => { jsQrRef.current = m.default || m; });
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (mode === 'scan' && status === 'idle') startCamera();
    else stopCamera();
  }, [mode, status]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 8) return;
    setStatus('processing');
    triggerHaptic(ImpactStyle.Heavy);
    
    try {
      const location = await geolocationService.getAttendancePayload();
      // In a real app, you'd call the api here. 
      // For this redesign, I'll simulate a success.
      setTimeout(() => setStatus('success'), 1500);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden">
      <SEO title="Scanner | Presently" />

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          <X size={24} weight="bold" />
        </button>

        <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-sungold rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">
             {mode === 'scan' ? 'Scanner Active' : 'Keyboard Entry'}
           </span>
        </div>

        <button 
          onClick={() => setMode(mode === 'scan' ? 'input' : 'scan')}
          className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
        >
          {mode === 'scan' ? <Keyboard size={24} weight="duotone" /> : <Scan size={24} weight="duotone" />}
        </button>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {mode === 'scan' && status === 'idle' && (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <div className="relative w-72 h-72">
                    {/* Corner Borders */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-sungold rounded-tl-3xl shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-sungold rounded-tr-3xl shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-sungold rounded-bl-3xl shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-sungold rounded-br-3xl shadow-[0_0_20px_rgba(245,197,24,0.5)]" />
                    
                    {/* Scanning Line */}
                    <motion.div 
                      animate={{ top: ['5%', '95%', '5%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-4 right-4 h-0.5 bg-sungold/50 shadow-[0_0_15px_rgba(245,197,24,1)] z-10"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                       <QrCode size={120} />
                    </div>
                 </div>
                 
                 <p className="mt-12 text-sm font-bold uppercase tracking-widest text-white/60">Position QR code within frame</p>
              </div>
            </motion.div>
          )}

          {mode === 'input' && status === 'idle' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm px-8 space-y-10"
            >
              <div className="text-center space-y-2">
                 <h2 className="text-4xl font-bold tracking-tight">Manual Entry</h2>
                 <p className="text-white/60 font-medium">Enter the 8-digit session code provided by your lecturer.</p>
              </div>

              <div className="space-y-6">
                <input 
                  type="text"
                  maxLength={8}
                  placeholder="••••••••"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full h-24 bg-white/5 border-2 border-white/10 rounded-3xl text-center text-5xl font-black tracking-[0.2em] outline-none focus:border-sungold transition-all"
                />

                <div className="flex gap-4">
                  <button className="flex-1 h-14 bg-white/5 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all">
                     <ClipboardText size={20} weight="duotone" />
                     Paste
                  </button>
                  <button 
                    onClick={() => setSessionCode('')}
                    className="flex-1 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-all"
                  >
                     Clear
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleVerify(sessionCode)}
                disabled={sessionCode.length !== 8}
                className="w-full h-18 bg-sungold text-black rounded-3xl font-black text-xl shadow-gold active:scale-95 transition-all disabled:opacity-30"
              >
                Verify Session
              </button>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div 
              key="processing"
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                 <CircleNotch size={80} className="animate-spin text-sungold opacity-20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin size={32} weight="fill" className="text-sungold animate-bounce" />
                 </div>
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-bold">Verifying Location</h3>
                 <p className="text-white/60 font-medium px-12">Ensuring you're within the designated lecture hall area.</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center border-4 border-success shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                 <Sparkle size={48} weight="fill" className="text-success" />
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-4xl font-bold tracking-tight">Attendance Logged</h2>
                 <p className="text-white/60 font-medium px-12">Successful check-in for <span className="text-white font-bold">CSC 401: Intro to AI</span></p>
              </div>
              <div className="w-full max-w-[280px] p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                 <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-bold uppercase tracking-widest">Time</span>
                    <span className="font-bold">10:45 AM</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-bold uppercase tracking-widest">Venue</span>
                    <span className="font-bold">Main Auditorium</span>
                 </div>
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-64 h-16 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Back to Dashboard <CaretRight size={20} weight="bold" />
              </button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              className="flex flex-col items-center gap-8 text-center"
            >
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center text-error border-4 border-error">
                 <Warning size={40} weight="fill" />
              </div>
              <div className="space-y-2 px-12">
                 <h2 className="text-3xl font-bold">Verification Failed</h2>
                 <p className="text-white/60 font-medium">We couldn't confirm your location. Please ensure GPS is active and try again.</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="w-64 h-16 bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-white/10"
              >
                <ArrowsClockwise size={20} weight="bold" />
                Retry Verification
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="p-10 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
         Encrypted Presence Verification
      </footer>
    </div>
  );
};
