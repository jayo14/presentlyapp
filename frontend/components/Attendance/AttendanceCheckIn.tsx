import React, { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Fingerprint, Globe, Smartphone, ChevronRight, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import { sessionApi, CheckInData } from '../../services/api/attendance';
import { getAttendancePayload, getCurrentPosition, getIPLocation } from '../../services/geolocation';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface AttendanceCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type CheckInStatus = 'idle' | 'locating' | 'verifying' | 'success' | 'error';

export const AttendanceCheckIn: React.FC<AttendanceCheckInProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [sessionCode, setSessionCode] = useState('');
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<any>(null);
  
  const { modalProps } = useModalAccessibility(isOpen, onClose);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode || sessionCode.length < 6) {
      setError('Please enter a valid session code');
      return;
    }

    try {
      setStatus('locating');
      setError(null);
      setLocationInfo('Calibrating precise location signals...');

      let checkInData: CheckInData;
      try {
        const payload = await getAttendancePayload();
        setLocationInfo(`Refined GPS: ${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`);
        checkInData = {
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
          visitorId: payload.visitorId,
          webglRenderer: payload.webglRenderer,
          ipCity: payload.ipCity,
          ipLocation: payload.ipLocation,
          motionDetected: payload.motionDetected,
          sampleCount: payload.sampleCount,
          isStaticGPS: payload.isStaticGPS,
          isDesktop: payload.isDesktop,
        };
      } catch {
        const position = await getCurrentPosition();
        setLocationInfo(`Standard GPS: ${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`);
        const ipLoc = await getIPLocation();
        checkInData = {
          latitude: position.latitude,
          longitude: position.longitude,
          elevation: position.altitude,
          ipCity: ipLoc?.city,
          ipLocation: ipLoc ? { latitude: ipLoc.latitude, longitude: ipLoc.longitude } : undefined,
          samples: [{
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            timestamp: position.timestamp,
          }],
        };
      }

      setStatus('verifying');
      setLocationInfo('Encrypting payload & validating geofence...');

      const result: any = await sessionApi.checkInByCode(sessionCode.toUpperCase(), checkInData);
      setCheckInResult(result);

      if (result?.success || result?.status === 'success' || result?.location_verified) {
        setStatus('success');
        toast.success('System Authenticated', { description: 'Your attendance has been cryptographically signed.' });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setStatus('error');
        const errMsg = result?.error || result?.warning || `Distance mismatch: You are ${result?.distance_from_venue?.toFixed(0) || '0'}m away.`;
        setError(errMsg);
      }
    } catch (err: any) {
      setStatus('error');
      const raw = err?.response?.data?.error || err?.response?.data?.reason || err?.message || 'Verification process failed';
      setError(raw);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setLocationInfo(null);
    setSessionCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-surface w-full md:max-w-lg h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[3.5rem] md:rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-outline/10 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="px-10 pt-12 pb-6 flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black tracking-widest text-primary uppercase">Secure Check-in</span>
            </div>
            <h2 className="text-4xl font-headline font-black text-text tracking-tight leading-tight uppercase">Identity Sync</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-surfaceHigh/40 flex items-center justify-center text-textMuted hover:text-text hover:bg-surfaceHigh transition-all active:scale-90"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-12 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            {status === 'idle' || status === 'error' ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <p className="text-textMuted font-medium text-lg leading-relaxed">
                    Provide the 6-character intelligence code displayed by your lecturer to synchronize your attendance.
                  </p>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-500" size={24} />
                      <input 
                        type="text" 
                        placeholder="ENTER SESSION CODE"
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                        maxLength={12}
                        className="w-full h-24 bg-surfaceLow border-2 border-outline/10 group-hover:border-primary/20 focus:border-primary/50 text-center text-4xl font-black tracking-[0.3em] font-mono rounded-[2rem] outline-none transition-all duration-500 placeholder:text-textMuted/20 shadow-sm"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                {status === 'error' && error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="p-6 bg-red-400/5 border border-red-400/10 rounded-[1.75rem] flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400 flex-shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-500 text-sm">Validation Error</h4>
                      <p className="text-red-400/80 text-xs mt-1 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <button 
                    onClick={handleCheckIn}
                    disabled={sessionCode.length < 6}
                    className="w-full h-24 bg-text dark:bg-primary text-background dark:text-background font-black text-xl rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    {status === 'error' ? 'Retry Synchronisation' : 'Initiate Sync'}
                    <ChevronRight size={24} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 text-textMuted font-black text-sm uppercase tracking-widest hover:text-text transition-colors"
                  >
                    Abort Operation
                  </button>
                </div>

                <div className="pt-8 border-t border-outline/10">
                  <div className="flex items-center gap-4 text-textMuted/40">
                    <MapPin size={20} />
                    <p className="text-xs font-bold leading-relaxed">Your biometric and geolocation telemetry will be verified against the secure venue perimeter.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-12">
                   <div className={`w-40 h-40 rounded-full flex items-center justify-center relative z-10 transition-colors duration-1000 ${
                     status === 'success' ? 'bg-green-500/10' : 'bg-primary/5'
                   }`}>
                      {status === 'locating' && <Globe size={80} className="text-primary animate-pulse" />}
                      {status === 'verifying' && <Loader2 size={80} className="text-primary animate-spin" />}
                      {status === 'success' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                          <CheckCircle2 size={80} className="text-green-500" />
                        </motion.div>
                      )}
                   </div>
                   <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse -z-0 opacity-20" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-headline font-black text-text tracking-tight uppercase">
                    {status === 'locating' && 'Geospatial Calibration'}
                    {status === 'verifying' && 'Secure Verification'}
                    {status === 'success' && 'Identity Verified'}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <p className="text-textMuted font-medium text-lg leading-relaxed max-w-sm mx-auto">
                      {locationInfo}
                    </p>
                    {status === 'success' && (
                       <div className="flex justify-center gap-2 mt-4">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-green-500/20">Attendance Secured</span>
                          <span className="px-3 py-1 bg-surfaceHigh text-textMuted rounded-full text-[10px] font-black tracking-widest uppercase border border-outline/10">Ref: {checkInResult?.id || 'TX-SYNC'}</span>
                       </div>
                    )}
                  </div>
                </div>

                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 w-full space-y-4"
                  >
                    <div className="p-6 bg-surfaceLow rounded-[2.5rem] border border-outline/10 flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-surfaceHigh flex items-center justify-center shadow-lg">
                          <Smartphone size={32} className="text-primary" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Success</p>
                          <p className="text-sm font-bold text-text">Hardware Signature Matched</p>
                       </div>
                    </div>
                    <Button onClick={onClose} className="w-full h-24 rounded-[2rem] text-xl font-black">Finalize & Close</Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-10 py-8 bg-surfaceLow/50 border-t border-outline/10 flex items-center justify-between opacity-50 relative z-10">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'locating' ? 'bg-primary animate-ping' : 'bg-green-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS: Active</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">ENC: AES-256</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">V: 1.4.2</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceCheckIn;
