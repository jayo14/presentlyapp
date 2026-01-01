import React, { useState, useEffect } from 'react';
import { MapPin, Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { sessionApi, CheckInData } from '../../services/api/attendance';
import { getCurrentPosition, verifyVenueLocation, formatDistance } from '../../services/geolocation';

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

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode || sessionCode.length < 6) {
      setError('Please enter a valid session code');
      return;
    }

    try {
      // Step 1: Get location
      setStatus('locating');
      setError(null);
      setLocationInfo('Getting your location...');

      const position = await getCurrentPosition();
      
      setLocationInfo(
        `Location found: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}` +
        (position.altitude ? ` @ ${position.altitude.toFixed(0)}m elevation` : '')
      );

      // Step 2: Check in
      setStatus('verifying');
      setLocationInfo('Verifying session and location...');

      const checkInData: CheckInData = {
        latitude: position.latitude,
        longitude: position.longitude,
        elevation: position.altitude,
      };

      // Find session by code first (we'd need to add this endpoint or search through sessions)
      // For now, we'll assume we need the session ID
      // In a real implementation, you'd have an endpoint that accepts session_code
      
      // Placeholder: You should implement an endpoint that accepts session_code
      // For now, let's simulate the check-in
      const result = await sessionApi.checkIn(1, checkInData); // This needs to be updated to accept session_code
      
      setCheckInResult(result);

      if (result.location_verified) {
        setStatus('success');
        setLocationInfo(
          `✓ Check-in successful! Distance: ${result.distance_from_venue.toFixed(0)}m from venue.`
        );
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setStatus('error');
        setError(
          result.warning || 
          `Location not verified. You are ${result.distance_from_venue.toFixed(0)}m from the venue.`
        );
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to check in. Please try again.');
      setLocationInfo(null);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setError(null);
    setLocationInfo(null);
    setCheckInResult(null);
    setSessionCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'idle' && <MapPin className="w-8 h-8 text-primary" />}
            {status === 'locating' && <Loader className="w-8 h-8 text-primary animate-spin" />}
            {status === 'verifying' && <Loader className="w-8 h-8 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {status === 'idle' && 'Check In to Session'}
            {status === 'locating' && 'Getting Location...'}
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Check-In Failed'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {status === 'idle' && 'Enter your session code to check in'}
            {status === 'locating' && 'Please allow location access'}
            {status === 'verifying' && 'Verifying your location and session'}
            {status === 'success' && 'You have been marked present'}
            {status === 'error' && 'Unable to complete check-in'}
          </p>
        </div>

        {/* Location Info */}
        {locationInfo && (
          <div className={`p-4 rounded-lg mb-4 ${
            status === 'success' 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 mt-0.5 ${
                status === 'success' ? 'text-green-500' : 'text-blue-500'
              }`} />
              <p className={`text-sm ${
                status === 'success' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {locationInfo}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {(status === 'idle' || status === 'error') && (
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Session Code
              </label>
              <Input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-8 character code"
                className="text-center text-lg tracking-wider font-mono"
                maxLength={12}
                autoFocus
                disabled={status === 'locating' || status === 'verifying'}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={status === 'locating' || status === 'verifying' || !sessionCode}
              >
                {status === 'locating' || status === 'verifying' ? 'Processing...' : 'Check In'}
              </Button>
              <Button
                type="button"
                onClick={status === 'error' ? handleReset : onClose}
                variant="secondary"
                className="flex-1"
              >
                {status === 'error' ? 'Try Again' : 'Cancel'}
              </Button>
            </div>
          </form>
        )}

        {/* Success/Loading State Actions */}
        {(status === 'success' || status === 'locating' || status === 'verifying') && (
          <div className="flex justify-center">
            {status === 'success' ? (
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            ) : (
              <div className="text-center text-zinc-400 text-sm">
                Please wait...
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-start gap-2 text-xs text-zinc-500">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your location will be used to verify you are within the venue boundaries.
              Location data is only used for attendance verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCheckIn;
