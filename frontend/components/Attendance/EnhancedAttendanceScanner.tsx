import React, { useState, useRef, useEffect } from 'react';
import { X, Keyboard, Scan, MapPin, CheckCircle, XCircle, AlertTriangle, Loader2, Camera as CameraIcon } from 'lucide-react';
import { Button } from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface EnhancedAttendanceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, location: any) => Promise<boolean>;
}

type ScanMode = 'scan' | 'input';
type ScanStatus = 'idle' | 'locating' | 'verifying' | 'success' | 'error';

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
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Haptic feedback helper
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style });
      } catch (err) {
        console.log('Haptics not available');
      }
    }
  };

  // Get precise location using Capacitor
  const getPreciseLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy
      };
    } catch (error: any) {
      console.error('Geolocation error:', error);
      throw new Error('Unable to get your location. Please enable location services.');
    }
  };

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSessionCode('');
      setStatus('idle');
      setErrorMsg('');
      setLocationInfo('');
      setMode('scan');
      setIsCameraPermissionDenied(false);
    } else {
      // Clean up camera when closing
      stopCamera();
    }
  }, [isOpen]);

  // Camera Logic
  useEffect(() => {
    if (isOpen && mode === 'scan' && status === 'idle') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, status]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

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
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsCameraPermissionDenied(true);
      }
      toast.error('Camera access denied. Please enable camera permissions.');
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
    setIsScanning(false);
  };

  // QR Code Scanner using canvas and image processing
  const scanQRCode = () => {
    if (!videoRef.current || !isCameraActive || status !== 'idle') {
      return;
    }

    const video = videoRef.current;
    
    // Ensure video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try to decode QR code using jsQR library (we'll need to add this)
    try {
      // Import jsQR dynamically
      import('jsqr').then(({ default: jsQR }) => {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Found QR code!
          const qrData = code.data;
          console.log('QR Code detected:', qrData);
          
          // Extract session code from QR data
          // Assuming QR contains URL like: https://presentlyapp.vercel.app/check-in/SESSIONCODE
          // Or just the session code directly
          let sessionCodeFromQR = qrData;
          
          // If it's a URL, extract the session code
          if (qrData.includes('/check-in/')) {
            const match = qrData.match(/\/check-in\/([A-Z0-9]+)/i);
            if (match && match[1]) {
              sessionCodeFromQR = match[1];
            }
          }
          
          // Stop scanning and process attendance
          if (scanIntervalRef.current) {
            window.clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          setIsScanning(false);
          
          // Trigger haptic feedback
          triggerHaptic(ImpactStyle.Medium);
          
          // Process the code
          processAttendance(sessionCodeFromQR);
        }
      }).catch((err) => {
        console.error('jsQR import error:', err);
        // Fallback: show message to user
        toast.error('QR scanner library not available. Please use manual entry.');
        setMode('input');
      });
    } catch (err) {
      console.error('QR scan error:', err);
    }
  };

  // Start QR scanning loop when camera is active
  useEffect(() => {
    if (isCameraActive && mode === 'scan' && status === 'idle') {
      setIsScanning(true);
      // Scan every 300ms for QR codes
      scanIntervalRef.current = window.setInterval(() => {
        scanQRCode();
      }, 300);
    } else {
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      setIsScanning(false);
    }

    return () => {
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isCameraActive, mode, status]);

  const handleModeSwitch = async (newMode: ScanMode) => {
    await triggerHaptic(ImpactStyle.Light);
    setMode(newMode);
    setSessionCode('');
    setErrorMsg('');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setSessionCode(val);
  };

  const processAttendance = async (codeToVerify: string) => {
    if (!codeToVerify || codeToVerify.length < 6) {
      setErrorMsg('Please enter a valid session code (at least 6 characters)');
      await triggerHaptic(ImpactStyle.Heavy);
      return;
    }

    try {
      // Step 1: Get precise location
      setStatus('locating');
      setErrorMsg('');
      setLocationInfo('Getting your precise location...');
      await triggerHaptic(ImpactStyle.Light);

      const location = await getPreciseLocation();
      
      setLocationInfo(
        `Location acquired (±${location.accuracy?.toFixed(0)}m accuracy)` +
        (location.altitude ? ` at ${location.altitude.toFixed(0)}m elevation` : '')
      );

      // Step 2: Verify attendance
      setStatus('verifying');
      setLocationInfo('Verifying session and location...');
      await triggerHaptic(ImpactStyle.Light);

      const success = await onVerify(codeToVerify, location);

      if (success) {
        setStatus('success');
        setLocationInfo('✓ Attendance marked successfully!');
        await triggerHaptic(ImpactStyle.Heavy);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to mark attendance. Please try again.');
      setLocationInfo('');
      await triggerHaptic(ImpactStyle.Heavy);
    }
  };

  const handleSubmit = () => {
    processAttendance(sessionCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Scanning Animation Styles */}
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 100%)); opacity: 0; }
        }
        .scan-line-anim {
          animation: scan-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {/* Header Bar */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent"
        >
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm font-medium">
            Mark Attendance
          </div>

          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </motion.div>

        {/* Mode Switcher */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black via-black/95 to-transparent"
        >
          {status === 'idle' && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleModeSwitch('scan')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all ${
                  mode === 'scan'
                    ? 'bg-primary text-black shadow-lg shadow-primary/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Scan className="w-5 h-5" />
                Scan QR
              </button>
              <button
                onClick={() => handleModeSwitch('input')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all ${
                  mode === 'input'
                    ? 'bg-primary text-black shadow-lg shadow-primary/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Keyboard className="w-5 h-5" />
                Enter Code
              </button>
            </div>
          )}

          {/* Location Info */}
          {locationInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-2xl backdrop-blur-lg flex items-center gap-3 ${
                status === 'success'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : status === 'error'
                  ? 'bg-red-500/20 border border-red-500/30'
                  : 'bg-blue-500/20 border border-blue-500/30'
              }`}
            >
              {status === 'locating' && <MapPin className="w-5 h-5 text-blue-400 animate-pulse" />}
              {status === 'verifying' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
              <p className="text-white text-sm flex-1">{locationInfo}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-lg flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm flex-1">{errorMsg}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Area */}
        {mode === 'scan' && status === 'idle' && (
          <motion.div
            key="scan-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {!isCameraActive && !isCameraPermissionDenied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-white/70">Starting camera...</p>
                </div>
              </div>
            )}

            {isCameraPermissionDenied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black p-8">
                <div className="text-center">
                  <CameraIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">Camera Access Required</h3>
                  <p className="text-white/70 mb-6">Please enable camera permissions to scan QR codes</p>
                  <Button onClick={startCamera} className="mx-auto">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Scanning Frame */}
            {isCameraActive && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                role="status"
                aria-label="QR code scanning area - position QR code within the frame"
              >
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/60" />

                {/* Scanning Frame */}
                <div className="relative w-[85vw] h-[85vw] max-w-[400px] max-h-[400px]">
                  {/* Pulsing Background Ring */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/20 pulse-ring" />
                  
                  {/* Main Frame */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/30 bg-white/5 backdrop-blur-[2px] overflow-hidden">
                    {/* Corner Indicators - Enhanced Size */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-2xl shadow-[0_0_20px_rgba(255,202,13,0.6)]" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-2xl shadow-[0_0_20px_rgba(255,202,13,0.6)]" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-2xl shadow-[0_0_20px_rgba(255,202,13,0.6)]" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-2xl shadow-[0_0_20px_rgba(255,202,13,0.6)]" />
                    
                    {/* Animated Scanning Line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent scan-line-anim shadow-[0_0_20px_rgba(255,202,13,0.9)]" />
                  </div>

                  {/* Center Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary/50 rounded-full" />
                  </div>
                </div>

                {/* Instruction Text */}
                <div className="absolute bottom-32 left-0 right-0 text-center">
                  <div className="inline-block px-6 py-3 bg-black/60 backdrop-blur-lg rounded-full">
                    <p className="text-white font-medium">
                      {isScanning ? 'Scanning for QR codes...' : 'Position QR code within the frame'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'input' && status === 'idle' && (
          <motion.div
            key="input-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="w-full max-w-md">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Keyboard className="w-12 h-12 text-primary" />
              </div>

              <h3 className="text-3xl font-bold text-white text-center mb-3">Enter Session Code</h3>
              <p className="text-white/60 text-center mb-12">
                Type the 6-8 character code displayed on screen
              </p>

              <input
                type="text"
                value={sessionCode}
                onChange={handleCodeChange}
                maxLength={8}
                placeholder="XXXXXXXX"
                autoFocus
                className="w-full bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-2xl px-6 py-6 text-center text-4xl font-mono tracking-[0.3em] uppercase text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all mb-6"
              />

              <Button
                onClick={handleSubmit}
                disabled={sessionCode.length < 6}
                className="w-full h-16 text-lg font-bold rounded-2xl"
              >
                Verify & Mark Attendance
              </Button>
            </div>
          </motion.div>
        )}

        {/* Loading/Success/Error States */}
        {(status === 'locating' || status === 'verifying' || status === 'success') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-lg"
          >
            <div className="text-center px-8">
              {status === 'locating' && (
                <>
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <MapPin className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Getting Location</h3>
                  <p className="text-white/60">Please wait...</p>
                </>
              )}

              {status === 'verifying' && (
                <>
                  <Loader2 className="w-24 h-24 text-primary animate-spin mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">Verifying</h3>
                  <p className="text-white/60">Checking your attendance...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Success!</h3>
                  <p className="text-white/60">Attendance marked successfully</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAttendanceScanner;
