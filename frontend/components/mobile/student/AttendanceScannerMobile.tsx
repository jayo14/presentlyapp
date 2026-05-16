import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Keyboard, Scan, MapPin, 
  CircleNotch, QrCode, ClipboardText, 
  Warning, ArrowsClockwise, CaretRight, Sparkle,
  CheckCircle, XCircle
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { toast } from 'sonner';
import { geolocationService } from '../../../services/geolocation';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../SEO';


export const AttendanceScannerMobile: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'scan' | 'input'>('scan');
  const [sessionCode, setSessionCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'location_error'>('idle');
  const [errorReason, setErrorReason] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const jsQrRef = useRef<any>(null);
  const scanLoopRef = useRef<number>();

  useEffect(() => {
    import('jsqr').then((m) => { jsQrRef.current = m.default || m; });
    return () => {
      stopCamera();
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, []);

  const scanFrame = useCallback(() => {
    if (status !== 'idle' || mode !== 'scan') return;

    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
      canvasRef.current
    ) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (jsQrRef.current) {
          const code = jsQrRef.current(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code && code.data) {
            handleVerify(code.data);
            return;
          }
        }
      }
    }
    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [status, mode]);

  useEffect(() => {
    if (mode === 'scan' && status === 'idle') {
      startCamera();
    } else {
      stopCamera();
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    }
  }, [mode, status]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 1280 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
           videoRef.current?.play();
           scanLoopRef.current = requestAnimationFrame(scanFrame);
        };
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
  };

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try { await Haptics.impact({ style }); } catch (e) {}
  };

  const handleVerify = async (code: string) => {
    if (code.length < 6) return;
    setStatus('processing');
    triggerHaptic(ImpactStyle.Heavy);
    
    try {
      // Simulate geolocation verification
      await new Promise(r => setTimeout(r, 800));
      // const location = await geolocationService.getAttendancePayload();
      
      // Simulate API call
      setTimeout(() => {
        setStatus('success');
        triggerHaptic(ImpactStyle.Heavy);
        setTimeout(() => navigate(-1), 2500);
      }, 1000);
    } catch (err) {
      setErrorReason('Location mismatch');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden">
      <SEO title="Scanner | Presently" />

      {/* Hidden canvas for jsQR processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 p-4 pt-safe flex items-center justify-between z-10 w-full max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={24} weight="bold" />
        </button>

        {/* Mode Toggle Pill */}
        <div className="flex bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-sm relative">
          <motion.div 
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-sungold rounded-full"
            animate={{ x: mode === 'scan' ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
          <button 
            onClick={() => setMode('scan')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full z-10 transition-colors ${mode === 'scan' ? 'text-presently-black font-bold' : 'text-white'}`}
          >
            <Scan size={18} weight="bold" />
            <span className="text-[11px] uppercase tracking-wider">Scan QR</span>
          </button>
          <button 
            onClick={() => setMode('input')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full z-10 transition-colors ${mode === 'input' ? 'text-presently-black font-bold' : 'text-white'}`}
          >
            <Keyboard size={18} weight="bold" />
            <span className="text-[11px] uppercase tracking-wider">Code</span>
          </button>
        </div>
        
        {/* Placeholder to balance the flex layout */}
        <div className="w-12 h-12" />
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
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                    {/* Corner Borders */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-sungold rounded-tl-[24px]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-sungold rounded-tr-[24px]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-sungold rounded-bl-[24px]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-sungold rounded-br-[24px]" />
                    
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
                 
                 <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Position QR code within frame</p>
              </div>
            </motion.div>
          )}

          {mode === 'input' && status === 'idle' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm px-8 space-y-10"
            >
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-bold tracking-tight">Manual Entry</h2>
                 <p className="text-white/60 text-sm">Enter the 8-digit session code provided by your lecturer.</p>
              </div>

              <div className="space-y-6">
                <input 
                  type="text"
                  maxLength={8}
                  placeholder="••••••••"
                  value={sessionCode}
                  autoFocus
                  inputMode="text"
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full h-20 bg-white/10 border-2 border-white/20 rounded-3xl text-center text-4xl font-mono tracking-[0.3em] uppercase outline-none focus:border-sungold focus:shadow-[0_0_0_4px_rgba(245,197,24,0.15)] transition-all placeholder:text-white/20"
                />

                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      try {
                         const text = await navigator.clipboard.readText();
                         if (text) setSessionCode(text.trim().substring(0,8).toUpperCase());
                      } catch(e) {}
                    }}
                    className="flex-1 h-12 bg-white/10 rounded-xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all text-sm"
                  >
                     <ClipboardText size={18} weight="duotone" />
                     Paste Code
                  </button>
                  <button 
                    onClick={() => setSessionCode('')}
                    className="flex-1 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold active:scale-95 transition-all text-sm"
                  >
                     Clear
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleVerify(sessionCode)}
                disabled={sessionCode.length < 6}
                className="w-full h-14 bg-sungold text-presently-black rounded-2xl font-black shadow-gold active:scale-95 transition-all disabled:opacity-40"
              >
                Verify Attendance
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
                 <h3 className="text-xl font-bold">Verifying Location</h3>
                 <p className="text-white/60 text-sm px-8">Confirming you're within the designated lecture area.</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-moss-green/20 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[120]"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-surface dark:bg-charcoal p-8 rounded-[32px] flex flex-col items-center text-center shadow-2xl max-w-xs w-full"
              >
                <CheckCircle size={80} weight="fill" className="text-moss-green mb-4" />
                <h2 className="text-2xl font-bold tracking-tight text-presently-black dark:text-white mb-2">You're marked present ✓</h2>
                <p className="text-slate-400 text-sm font-medium">CSC 401: Intro to AI • 10:45 AM</p>
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-soft-coral/20 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[120]"
            >
               <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-surface dark:bg-charcoal p-8 rounded-[32px] flex flex-col items-center text-center shadow-2xl max-w-xs w-full"
              >
                <XCircle size={80} weight="fill" className="text-soft-coral mb-4" />
                <h2 className="text-2xl font-bold tracking-tight text-presently-black dark:text-white mb-2">Couldn't verify attendance</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">{errorReason || 'Invalid session code or expired.'}</p>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => setStatus('idle')}
                    className="w-full h-14 bg-soft-coral text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => navigate(-1)}
                    className="w-full h-14 bg-slate-100 dark:bg-white/10 text-presently-black dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
