import React, { useState, useRef, useEffect } from 'react';
import { X, Keyboard, Scan, MapPin, CheckCircle, XCircle, AlertTriangle, Loader2, Camera as CameraIcon, RotateCcw, Clipboard, ChevronRight, QrCode } from 'lucide-react';
import { Button } from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { AttendanceSuccessPage } from './AttendanceSuccessPage';
import { AttendanceFailurePage } from './AttendanceFailurePage';
import { geolocationService } from '../../services/geolocation';

interface EnhancedAttendanceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, location: any) => Promise<any>;
}

type ScanMode = 'idle' | 'scan' | 'input';
type ScanStatus = 'idle' | 'locating' | 'verifying' | 'success' | 'error';

interface AttendanceData {
  courseCode?: string;
  courseName?: string;
  location?: string;
  sessionCode?: string;
}

export const EnhancedAttendanceScanner: React.FC<EnhancedAttendanceScannerProps> = ({
  isOpen,
  onClose,
  onVerify
}) => {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [sessionCode, setSessionCode] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [locationInfo, setLocationInfo] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraPermissionDenied, setIsCameraPermissionDenied] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try { await Haptics.impact({ style }); } catch (err) {}
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSessionCode('');
      setStatus('idle');
      setErrorMsg('');
      setLocationInfo('');
      setMode('idle');
      setAttendanceData(null);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mode === 'scan' && status === 'idle') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode, status]);

  const startCamera = async () => {
    try {
      const constraints = { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsCameraPermissionDenied(false);
        };
      }
    } catch (err: any) {
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsCameraPermissionDenied(true);
      }
      toast.error('Camera access denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !isCameraActive || status !== 'idle') return;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      contextRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
    }
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!context) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    import('jsqr').then((m) => {
      const jsQR = m.default || (m as any);
      if (typeof jsQR !== 'function') {
        console.error('jsQR is not a function after dynamic import');
        return;
      }
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        let qrData = code.data;
        let sessionCodeFromQR = qrData;
        if (qrData.includes('/check-in/')) {
          const match = qrData.match(/\/check-in\/([A-Z0-9]+)/i);
          if (match && match[1]) sessionCodeFromQR = match[1].toUpperCase();
        }
        processAttendance(sessionCodeFromQR.toUpperCase());
        triggerHaptic(ImpactStyle.Heavy);
      }
    }).catch((err) => {
      console.error('Failed to load jsqr:', err);
    });
  };

  useEffect(() => {
    if (isCameraActive && mode === 'scan' && status === 'idle') {
      scanIntervalRef.current = window.setInterval(scanQRCode, 250);
    }
    return () => { if (scanIntervalRef.current) window.clearInterval(scanIntervalRef.current); };
  }, [isCameraActive, mode, status]);

  const processAttendance = async (codeToVerify: string) => {
    if (!codeToVerify || codeToVerify.length < 6) {
      setErrorMsg('Invalid session code');
      setStatus('error');
      return;
    }
    try {
      setStatus('locating');
      const payload = await geolocationService.getAttendancePayload();
      setStatus('verifying');
      const attendanceResponse = await onVerify(codeToVerify, payload);
      if (attendanceResponse) {
        setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        setAttendanceData({
          courseCode: attendanceResponse.course_code || codeToVerify,
          courseName: attendanceResponse.course_name || 'Course Session',
          location: attendanceResponse.venue_name || 'Verified Venue',
          sessionCode: codeToVerify
        });
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Verification Failed');
    }
  };

  if (!isOpen) return null;

  if (status === 'success' && attendanceData) {
    return (
      <AttendanceSuccessPage
        courseCode={attendanceData.courseCode}
        courseName={attendanceData.courseName}
        location={attendanceData.location}
        time={checkInTime}
        onBackToHome={onClose}
      />
    );
  }

  if (status === 'error') {
    return (
      <AttendanceFailurePage 
        errorMsg={errorMsg}
        onRetry={() => { setStatus('idle'); setMode('idle'); }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-[#111111] text-white flex flex-col font-sans overflow-hidden">
      <header className="p-6 flex items-center justify-between relative z-10">
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-95 transition-all">
          <X size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Attendance Mission</span>
        <div className="w-12 h-12"></div>
      </header>

      <main className="flex-1 flex flex-col p-8 relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col justify-center space-y-12"
            >
              <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-primary">
                    <QrCode size={40} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-4xl font-headline font-black tracking-tight">How will you<br/>check-in?</h2>
                 <p className="text-white/40 font-medium">Position your device or enter the session key provided by your instructor.</p>
              </div>

              <div className="space-y-4">
                 <button 
                   onClick={() => setMode('scan')}
                   className="w-full h-24 bg-primary text-[#111111] rounded-[2rem] flex items-center justify-between px-8 group drop-shadow-2xl active:scale-98 transition-all"
                 >
                    <div className="flex items-center gap-5">
                       <Scan size={32} strokeWidth={2.5} />
                       <div className="text-left">
                          <p className="text-lg font-headline font-black">Scan QR Code</p>
                          <p className="text-xs font-bold opacity-60">Focus on the screen</p>
                       </div>
                    </div>
                    <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                 </button>

                 <button 
                   onClick={() => setMode('input')}
                   className="w-full h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between px-8 group active:scale-98 transition-all"
                 >
                    <div className="flex items-center gap-5">
                       <Keyboard size={32} strokeWidth={2.5} className="text-primary" />
                       <div className="text-left">
                          <p className="text-lg font-headline font-black">Enter Code</p>
                          <p className="text-xs font-bold opacity-40">Manual 6-digit entry</p>
                       </div>
                    </div>
                    <ChevronRight size={24} strokeWidth={3} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          )}

          {mode === 'input' && (
            <motion.div 
              key="input"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center space-y-8 mb-12">
                 <h2 className="text-3xl font-headline font-black">Authentication Code</h2>
                 <p className="text-white/40 text-sm">Enter the numeric code to proceed with check-in.</p>
                 
                 <div className="flex justify-center gap-3">
                    {[0,1,2,3,4,5].map((i) => (
                      <div key={i} className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                        sessionCode.length > i ? 'border-primary bg-primary/5 text-primary' : 'border-white/10 bg-white/5 text-white/20'
                      }`}>
                         {sessionCode[i] || '0'}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 {[1,2,3,4,5,6,7,8,9].map(num => (
                   <button 
                     key={num} 
                     onClick={() => setSessionCode(prev => (prev + num).slice(0,6))}
                     className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 font-headline font-black text-xl flex items-center justify-center active:scale-90 transition-all"
                   >
                     {num}
                   </button>
                 ))}
                 <button onClick={() => setSessionCode('')} className="h-16 rounded-2xl bg-white/5 font-black text-xs uppercase opacity-40">Clear</button>
                 <button 
                    onClick={() => setSessionCode(prev => (prev + '0').slice(0,6))}
                    className="h-16 rounded-2xl bg-white/5 font-headline font-black text-xl flex items-center justify-center"
                 >
                   0
                 </button>
                 <button 
                    onClick={() => setSessionCode(prev => prev.slice(0, -1))}
                    className="h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary"
                 >
                   <RotateCcw size={20} />
                 </button>
              </div>

              <button 
                 disabled={sessionCode.length < 6}
                 onClick={() => processAttendance(sessionCode)}
                 className="w-full h-20 bg-primary text-[#111111] rounded-[2.5rem] mt-12 font-headline font-black text-xl shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] disabled:opacity-30 disabled:grayscale transition-all"
              >
                 Verify Attendance
              </button>
              
              <button 
                onClick={() => setMode('idle')}
                className="mt-6 text-xs font-black uppercase tracking-widest opacity-40 text-center"
              >
                Go Back
              </button>
            </motion.div>
          )}

          {mode === 'scan' && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative"
            >
               <div className="absolute inset-0 rounded-[3rem] overflow-hidden border border-white/10 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60" />
                  
                  {/* Scanning Frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-64 h-64 relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl transition-all" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl transition-all" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl transition-all" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl transition-all" />
                        
                        {/* Scanning Line */}
                        <motion.div 
                           animate={{ top: ['0%', '100%'] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           className="absolute left-2 right-2 h-1 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),1)]"
                        />
                     </div>
                  </div>
               </div>

               <div className="absolute bottom-12 left-0 right-0 text-center px-12 space-y-4">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                     <Loader2 size={16} className="animate-spin text-primary" />
                     <span className="text-xs font-black uppercase tracking-widest">Targeting Session...</span>
                  </div>
                  <p className="text-white/40 text-sm">Align the QR code within the highlighted corners to automatically check-in.</p>
               </div>
               
               <button 
                 onClick={() => setMode('idle')}
                 className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
               >
                  <Keyboard size={18} />
               </button>
            </motion.div>
          )}

          {(status === 'locating' || status === 'verifying') && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#111111]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12 text-center"
            >
               <div className="relative mb-12">
                  <Loader2 size={80} className="animate-spin text-primary opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <MapPin size={32} className="text-primary animate-bounce" />
                  </div>
               </div>
               <h3 className="text-3xl font-headline font-black mb-4">Establishing Secure Connection</h3>
               <p className="text-white/40 text-sm leading-relaxed max-w-xs">{status === 'locating' ? 'Verifying spatial coordinates and biometric signals...' : 'Exchanging encryption keys with the institution core...'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
