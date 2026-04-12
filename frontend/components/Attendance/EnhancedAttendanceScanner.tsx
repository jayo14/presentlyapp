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
  const [mode, setMode] = useState<ScanMode>('scan');
  const [sessionCode, setSessionCode] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [locationInfo, setLocationInfo] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraPermissionDenied, setIsCameraPermissionDenied] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [autoSwitchToQr, setAutoSwitchToQr] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const scanFrameRef = useRef<number | null>(null);
  const jsQrRef = useRef<any>(null);
  const isDecodeInProgressRef = useRef(false);
  const hasDetectedCodeRef = useRef(false);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try { await Haptics.impact({ style }); } catch (err) { }
    }
  };

  const sanitizeSessionCode = (value: string) =>
    value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

  const handleSessionCodeChange = (value: string) => {
    setSessionCode(sanitizeSessionCode(value));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const normalized = sanitizeSessionCode(text);
      if (!normalized) {
        toast.error('Clipboard does not contain a valid session code.');
        return;
      }
      setSessionCode(normalized);
      toast.success('Session code pasted.');
    } catch {
      toast.error('Unable to access clipboard.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSessionCode('');
      setStatus('idle');
      setErrorMsg('');
      setLocationInfo('');
      setMode('scan');
      setAttendanceData(null);
      setAutoSwitchToQr(false);
      hasDetectedCodeRef.current = false;
    } else {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'input' && autoSwitchToQr) {
      setMode('scan');
    }
  }, [mode, autoSwitchToQr]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    import('jsqr')
      .then((m) => {
        const jsQR = m.default || (m as any);
        if (typeof jsQR === 'function') {
          jsQrRef.current = jsQR;
        }
      })
      .catch((err) => {
        console.error('Failed to preload jsqr:', err);
      });
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
    if (scanFrameRef.current) {
      window.cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }
    isDecodeInProgressRef.current = false;
    hasDetectedCodeRef.current = false;
    setIsCameraActive(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !isCameraActive || status !== 'idle' || isDecodeInProgressRef.current || hasDetectedCodeRef.current) return;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const jsQR = jsQrRef.current;
    if (typeof jsQR !== 'function') {
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      contextRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
    }
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!context) return;

    isDecodeInProgressRef.current = true;
    try {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        let qrData = code.data;
        let sessionCodeFromQR = qrData;
        if (qrData.includes('/check-in/')) {
          const match = qrData.match(/\/check-in\/([A-Z0-9]+)/i);
          if (match && match[1]) sessionCodeFromQR = match[1].toUpperCase();
        }
        hasDetectedCodeRef.current = true;
        processAttendance(sessionCodeFromQR.toUpperCase());
        triggerHaptic(ImpactStyle.Heavy);
      }
    } finally {
      isDecodeInProgressRef.current = false;
    }
  };

  useEffect(() => {
    const runScanLoop = () => {
      scanQRCode();
      scanFrameRef.current = window.requestAnimationFrame(runScanLoop);
    };

    if (isCameraActive && mode === 'scan' && status === 'idle') {
      scanFrameRef.current = window.requestAnimationFrame(runScanLoop);
    }

    return () => {
      if (scanFrameRef.current) {
        window.cancelAnimationFrame(scanFrameRef.current);
        scanFrameRef.current = null;
      }
      isDecodeInProgressRef.current = false;
      hasDetectedCodeRef.current = false;
    };
  }, [isCameraActive, mode, status]);

  const processAttendance = async (codeToVerify: string) => {
    const normalizedCode = sanitizeSessionCode(codeToVerify);
    if (normalizedCode.length !== 8) {
      setErrorMsg('Session code must be exactly 8 alphanumeric characters.');
      setStatus('error');
      return;
    }
    try {
      setStatus('locating');
      const payload = await geolocationService.getAttendancePayload();
      setStatus('verifying');
      const attendanceResponse = await onVerify(normalizedCode, payload);
      if (attendanceResponse) {
        setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        setAttendanceData({
          courseCode: attendanceResponse.course_code || normalizedCode,
          courseName: attendanceResponse.course_name || 'Course Session',
          location: attendanceResponse.venue_name || 'Verified Venue',
          sessionCode: normalizedCode
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
    <div className="fixed inset-0 z-[110] bg-background text-foreground flex flex-col font-sans overflow-hidden transition-colors duration-500">
      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[120] pointer-events-none">
        <button
          onClick={onClose}
          className="w-12 h-12 pointer-events-auto flex items-center justify-center bg-black/40 dark:bg-surface/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-border shadow-2xl active:scale-95 transition-all text-background"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center">
          <div className="px-4 py-1.5 bg-black/40 dark:bg-surface/40 backdrop-blur-2xl rounded-full border border-white/10 dark:border-border flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${mode === 'scan' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-background">
              {mode === 'scan' ? 'Scanner Mode' : 'Keyboard Mode'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMode(mode === 'scan' ? 'input' : 'scan')}
          className="w-12 h-12 pointer-events-auto flex items-center justify-center bg-black/40 dark:bg-surface/40 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-border shadow-2xl active:scale-95 transition-all text-background"
          aria-label={mode === 'scan' ? "Switch to keyboard" : "Switch to scanner"}
        >
          {mode === 'scan' ? <Keyboard size={24} strokeWidth={2.5} /> : <Scan size={24} strokeWidth={2.5} />}
        </button>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-surface">
        <AnimatePresence mode="wait">
          {status === 'idle' && mode === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-[115] bg-background flex flex-col justify-center p-8 transition-colors duration-500"
            >
              <div className="max-w-md mx-auto w-full flex flex-col h-full items-center justify-center">
                <div className="text-center pt-6 mb-12">
                  <h2 className="text-4xl font-headline font-black tracking-tight text-foreground">Session Code</h2>
                  <p className="text-muted-foreground font-medium">Enter the 8-character unique session code assigned to your current lecture.</p>
                </div>

                <div className="w-full space-y-6">
                  <div className="relative group">
                    <input
                      value={sessionCode}
                      onChange={(event) => handleSessionCodeChange(event.target.value)}
                      inputMode="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      autoComplete="off"
                      maxLength={8}
                      placeholder="••••••••"
                      className="w-full h-24 rounded-3xl border-2 border-border bg-surface px-5 text-center text-4xl font-black tracking-[0.2em] text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                      autoFocus
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`w-2 h-0.5 rounded-full transition-colors ${sessionCode.length > i ? 'bg-primary' : 'bg-muted'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="h-14 rounded-2xl bg-surface hover:bg-muted/50 border border-border text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-foreground"
                    >
                      <Clipboard size={18} className="text-primary" />
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionCode('')}
                      className="h-14 rounded-2xl bg-surface hover:bg-muted/50 border border-border text-sm font-black uppercase tracking-wider transition-all text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="w-full my-4">
                  <button
                    disabled={sessionCode.length !== 8 || status !== 'idle'}
                    onClick={() => processAttendance(sessionCode)}
                    className="w-full h-20 bg-primary text-on-primary-fixed rounded-[2.5rem] font-headline font-black text-xl shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                  >
                    {status === 'idle' ? 'Validate Session Code' : 'Processing...'}
                  </button>

                  <p className="mt-6 text-center text-xs font-bold text-muted-foreground opacity-60">
                    By checking in, you confirm your physical presence in the lecture hall.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'idle' && mode === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative"
            >
              {/* Immersive Camera View */}
              <div className="absolute inset-0 overflow-hidden bg-surface">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
                />

                {/* Advanced Scanning UI */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {/* The Scanning Frame (Larger for better range) */}
                  <div className="relative w-[85vw] h-[85vw] max-w-sm max-h-sm">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-[8px] border-l-[8px] border-primary rounded-tl-[3rem] shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]" />
                    <div className="absolute top-0 right-0 w-20 h-20 border-t-[8px] border-r-[8px] border-primary rounded-tr-[3rem] shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-[8px] border-l-[8px] border-primary rounded-bl-[3rem] shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-[8px] border-r-[8px] border-primary rounded-br-[3rem] shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]" />

                    {/* Scanning Line */}
                    <motion.div
                      animate={{ top: ['5%', '95%', '5%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-8 right-8 h-1 bg-primary/80 blur-[0.5px] shadow-[0_0_30px_rgba(var(--primary-rgb),1)] z-10 rounded-full"
                    />

                    {/* Center Helper Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <QrCode size={180} strokeWidth={0.5} className="text-background" />
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="mt-4 text-center">
                    {/* <h3 className="text-xl font-headline font-black text-background drop-shadow-lg mb-2">Center QR Code</h3> */}
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffffff]">Scanning environment...</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Gradient Overlay for readability */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Mobile-Friendly Bottom Sheet Style Indicator */}
              {/* <div className="absolute bottom-10 left-0 right-0 px-8 pointer-events-none">
                <div className="max-w-xs mx-auto p-2 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-background leading-relaxed">
                    Verification is instantaneous once the code is identified within the frame.
                  </p>
                </div>
              </div> */}
            </motion.div>
          )}

          {(status === 'locating' || status === 'verifying') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-2xl z-[150] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Loader2 size={100} className="animate-spin text-primary opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center group">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin size={48} className="text-primary" />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-4xl font-headline font-black mb-4 text-white/80 tracking-tight">Verifying Attendance</h3>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                {status === 'locating' ? 'Identifying your location...' : 'Confirming your check-in...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

};
