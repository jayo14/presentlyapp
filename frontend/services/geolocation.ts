import { Geolocation } from '@capacitor/geolocation';

/**
 * Geolocation utilities for frontend attendance check-in
 * Enhanced with anti-spoofing and multi-sample precision.
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
  timestamp: number;
  isMock?: boolean;
}

const DEFAULT_SAMPLE_COUNT = 4;
const DEFAULT_SAMPLE_INTERVAL = 2000; // 2 seconds

/**
 * Get multiple high-accuracy location samples for anti-spoofing.
 */
export const getMultipleSamples = async (
  count: number = DEFAULT_SAMPLE_COUNT,
  interval: number = DEFAULT_SAMPLE_INTERVAL
): Promise<GeolocationPosition[]> => {
  const samples: GeolocationPosition[] = [];

  for (let i = 0; i < count; i++) {
    const pos = await getCurrentPosition({ timeout: 10000 });
    samples.push(pos);
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  return samples;
};

/**
 * Get current position with high accuracy and stability.
 */
export const getCurrentPosition = (
  options: { 
    timeout?: number; 
    desiredAccuracy?: number; 
    maxWait?: number 
  } = {}
): Promise<GeolocationPosition> => {
  const { 
    timeout = 15000,
    desiredAccuracy = 20, // meters
    maxWait = 5000
  } = options;

  return new Promise(async (resolve, reject) => {
    let bestPosition: GeolocationPosition | null = null;
    let watchId: string | null = null;
    let timerId: any;
    let hasResolved = false;

    const cleanup = () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
      if (timerId) clearTimeout(timerId);
    };

    const finish = (position: GeolocationPosition) => {
      if (hasResolved) return;
      hasResolved = true;
      cleanup();
      resolve(position);
    };

    const handleError = (error: any) => {
      if (bestPosition && !hasResolved) {
        finish(bestPosition);
        return;
      }
      if (hasResolved) return;
      hasResolved = true;
      cleanup();
      reject(new Error(error?.message || 'Failed to get location'));
    };

    timerId = setTimeout(() => {
      if (bestPosition) finish(bestPosition);
      else handleError({ message: 'Location request timed out' });
    }, timeout);

    try {
      watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout, maximumAge: 0 },
        (position, err) => {
          if (err) return;
          if (position) {
            const currentPos: GeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              timestamp: position.timestamp,
            };

            if (!bestPosition || currentPos.accuracy < bestPosition.accuracy) {
              bestPosition = currentPos;
            }

            if (currentPos.accuracy <= desiredAccuracy) {
              finish(currentPos);
            }
          }
        }
      );
    } catch (err) {
      handleError(err);
    }
    
    setTimeout(() => {
        if (!hasResolved && bestPosition) finish(bestPosition);
    }, maxWait);
  });
};

export const calculateDistance = (
  lat1: number, lon1: number, lat2: number, lon2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
  if (!polygon || polygon.length < 3) return false;
  const [lat, lon] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat_i, lon_i] = polygon[i];
    const [lat_j, lon_j] = polygon[j];
    const intersect = ((lon_i > lon) !== (lon_j > lon)) && (lat < (lat_j - lat_i) * (lon - lon_i) / (lon_j - lon_i) + lat_i);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location === 'granted';
  } catch (error) {
    return false;
  }
};

export const geolocationService = {
  getCurrentPosition,
  getMultipleSamples,
  calculateDistance,
  pointInPolygon,
  checkLocationPermission,
};
