import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../Button';

interface FindMyLocationProps {
  onLocationFound?: (location: { latitude: number; longitude: number; accuracy: number }) => void;
  className?: string;
}

/**
 * FindMyLocation Component - MVP/Coming Soon Feature
 * 
 * This component provides a UI for the "Find My Location" feature.
 * Currently displays as a Coming Soon feature with placeholder functionality.
 * 
 * Future Implementation:
 * - Real-time location tracking
 * - Integration with attendance marking
 * - Location history
 * - Geofencing for venue verification
 */
export const FindMyLocation: React.FC<FindMyLocationProps> = ({ 
  onLocationFound,
  className = '' 
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(locationData);
        setIsLocating(false);
        onLocationFound?.(locationData);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${className}`}>
      {/* Coming Soon Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Find My Location</h3>
            <p className="text-xs text-zinc-500">MVP Feature</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Coming Soon
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-6">
        Quickly locate yourself on campus and verify your attendance with precision geolocation.
      </p>

      {/* Location Display */}
      {location && !error && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-500">Location Found</p>
              <div className="mt-2 space-y-1 text-xs text-zinc-400">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
                <p>Accuracy: ±{Math.round(location.accuracy)}m</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-500">Error</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleFindLocation}
        disabled={isLocating}
        className="w-full gap-2"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Locating...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" />
            Find My Location
          </>
        )}
      </Button>

      {/* Features Preview */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-xs font-semibold text-zinc-400 mb-3">Upcoming Features:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Real-time location tracking</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Automatic venue detection</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Location history & analytics</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Smart attendance verification</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <p className="text-xs text-zinc-500 text-center">
          💡 This feature is currently in development and will be available in the next release.
        </p>
      </div>
    </div>
  );
};

export default FindMyLocation;
