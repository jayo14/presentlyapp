import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import L from 'leaflet';

interface FindMyLocationProps {
  onLocationFound?: (location: { latitude: number; longitude: number; accuracy: number }) => void;
  className?: string;
}

export const FindMyLocation: React.FC<FindMyLocationProps> = ({ 
  onLocationFound,
  className = '' 
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [7.3775, 3.8936], // Default center
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    // Force invalidation to ensure correct rendering in flex containers
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map when location changes
  useEffect(() => {
    if (!mapRef.current || !location) return;

    const map = mapRef.current;
    const { latitude, longitude, accuracy } = location;
    const latLng = L.latLng(latitude, longitude);

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.marker(latLng).addTo(map);
    }

    // Update accuracy circle
    if (circleRef.current) {
      circleRef.current.setLatLng(latLng);
      circleRef.current.setRadius(accuracy);
    } else {
      circleRef.current = L.circle(latLng, {
        radius: accuracy,
        color: '#ffca0d',
        fillColor: '#ffca0d',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
    }

    map.setView(latLng, 16);
    
    // Invalidate size again to be sure
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

  }, [location]);

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
        setError(error.message || 'Failed to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleRefreshMap = () => {
    if (mapRef.current) {
        mapRef.current.invalidateSize();
        if (location) {
            mapRef.current.setView([location.latitude, location.longitude], 16);
        }
    }
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">My Location</h3>
              <p className="text-xs text-zinc-500">Live Geolocation</p>
            </div>
          </div>
          <Button
            onClick={handleFindLocation}
            disabled={isLocating}
            size="sm"
            className="gap-2"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {location ? 'Update' : 'Find Me'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[300px] bg-zinc-950">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />
        
        {!location && !isLocating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-10 p-6 text-center">
                <MapPin className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-400 text-sm mb-4">Map view is ready. Click 'Find Me' to see your current position.</p>
                <Button variant="secondary" onClick={handleFindLocation} size="sm">
                    Activate GPS
                </Button>
            </div>
        )}

        {isLocating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-zinc-400 text-sm">Accessing GPS...</p>
            </div>
        )}

        <button 
            onClick={handleRefreshMap}
            className="absolute bottom-4 right-4 z-[1000] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg text-zinc-500 hover:text-primary transition-colors"
            title="Fix Map Rendering"
        >
            <RefreshCw size={18} />
        </button>
      </div>

      {/* Footer Info */}
      {location && (
        <div className="p-4 bg-zinc-800/50 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>LAT: {location.latitude.toFixed(6)}</span>
            <span>LNG: {location.longitude.toFixed(6)}</span>
            <span>ACC: ±{Math.round(location.accuracy)}m</span>
        </div>
      )}
    </div>
  );
};

export default FindMyLocation;
