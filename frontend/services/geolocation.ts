import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Geolocation } from '@capacitor/geolocation';
import {
  haversineDistance,
  pointInPolygon as turfPointInPolygon,
  validateLocation,
  type ValidationResult,
} from './venueValidation';

/**
 * Geolocation utilities for frontend attendance check-in
 * Enhanced with anti-spoofing and multi-sample precision.
 *
 * All distance and polygon checks are delegated to Turf.js via `venueValidation`
 * to guarantee precise, well-tested geospatial maths across the app.
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

export interface AntiCheatSignals {
  visitorId?: string;
  webglRenderer?: string;
  motionDetected?: boolean;
  ipCity?: string;
  ipLocation?: { latitude: number; longitude: number };
}

const DEFAULT_SAMPLE_COUNT = 4;
const DEFAULT_SAMPLE_INTERVAL = 2000; // 2 seconds

/**
 * Get multiple high-accuracy location samples for anti-spoofing.
 */
export const getMultipleSamples = async (
  count: number = DEFAULT_SAMPLE_COUNT,
  interval: number = DEFAULT_SAMPLE_INTERVAL,
): Promise<GeolocationPosition[]> => {
  const samples: GeolocationPosition[] = [];

  for (let i = 0; i < count; i++) {
    const pos = await getCurrentPosition({ timeout: 15000 });
    samples.push(pos);
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  return samples;
};

/**
 * Get current position with high accuracy and stability.
 *
 * Uses Capacitor's high-accuracy mode and returns the best (lowest-accuracy)
 * fix observed within the allowed time budget.
 */
/**
 * Get current position with high accuracy, smoothing, and jitter rejection.
 * 
 * Collects multiple high-accuracy samples, filters out those with poor accuracy
 * (threshold: 50m), and averages the best ones to provide a stable, "Google-like"
 * location experience.
 */
export const getCurrentPosition = (
  options: {
    timeout?: number;
    desiredAccuracy?: number;
    maxWait?: number;
    requiredSamples?: number;
  } = {},
): Promise<GeolocationPosition> => {
  const {
    timeout = 30000,
    desiredAccuracy = 20, // metres
    maxWait = 15000,
    requiredSamples = 5,
  } = options;

  return new Promise(async (resolve, reject) => {
    let watchId: string | null = null;
    let timerId: any;
    let hasResolved = false;
    const samples: GeolocationPosition[] = [];
    let bestSinglePosition: GeolocationPosition | null = null;

    const cleanup = () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId }).catch(err => console.error('Error clearing watch:', err));
      }
      if (timerId) clearTimeout(timerId);
    };

    const finish = (position: GeolocationPosition) => {
      if (hasResolved) return;
      hasResolved = true;
      cleanup();
      resolve(position);
    };

    const handleError = async (error: any) => {
      // If we have at least some samples or a best position, prefer that over an error
      if (samples.length > 0 && !hasResolved) {
        finish(calculateAveragePosition(samples));
        return;
      }
      if (bestSinglePosition && !hasResolved) {
          finish(bestSinglePosition);
          return;
      }

      // NO GPS data at all - try IP fallback before giving up
      if (!hasResolved) {
          console.log('GPS failed. Attempting IP-based geolocation fallback...');
          const ipLoc = await getIPLocation();
          if (ipLoc) {
              finish({
                  latitude: ipLoc.latitude,
                  longitude: ipLoc.longitude,
                  accuracy: 5000, // Approximate IP accuracy
                  timestamp: Date.now(),
                  isMock: false
              });
              return;
          }
      }

      if (hasResolved) return;
      hasResolved = true;
      cleanup();
      reject(new Error(error?.message || 'Failed to get precise location'));
    };

    const calculateAveragePosition = (posSamples: GeolocationPosition[]): GeolocationPosition => {
      if (posSamples.length === 0) throw new Error('No samples to average');
      
      const sumLat = posSamples.reduce((sum, p) => sum + p.latitude, 0);
      const sumLng = posSamples.reduce((sum, p) => sum + p.longitude, 0);
      const avgAccuracy = posSamples.reduce((sum, p) => sum + p.accuracy, 0) / posSamples.length;
      
      return {
        ...posSamples[posSamples.length - 1], // Use metadata from last sample
        latitude: sumLat / posSamples.length,
        longitude: sumLng / posSamples.length,
        accuracy: avgAccuracy,
      };
    };

    // Overall timeout safeguard
    timerId = setTimeout(() => {
      if (samples.length > 0) {
        finish(calculateAveragePosition(samples));
      } else if (bestSinglePosition) {
        finish(bestSinglePosition);
      } else {
        handleError({ message: 'GPS signal too weak or timed out. Please ensure you are outdoors or near a window.' });
      }
    }, timeout);

    try {
      watchId = await Geolocation.watchPosition(
        { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
        },
        (position, err) => {
          if (err) {
            console.warn('Geolocation watch error:', err);
            return;
          }
          
          if (position) {
            const currentPos: GeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              timestamp: position.timestamp,
            };

            // Track the absolute best single position as fallback
            if (!bestSinglePosition || currentPos.accuracy < bestSinglePosition.accuracy) {
              bestSinglePosition = currentPos;
            }

            // FILTER (Step 2): Reject bad GPS readings (IP fallback or weak signal)
            // Anything over 40m is likely not pure GPS or is too noisy for geofencing
            // However, we still track it as 'bestSinglePosition' in case we get NOTHING better
            if (currentPos.accuracy > 40) {
              // Only log if it's exceptionally bad to avoid noise, but keep it for fallback
              if (currentPos.accuracy > 500) {
                console.log(`Poor signal (Step 2): ${currentPos.accuracy.toFixed(1)}m. Waiting for calibration...`);
              }
              return;
            }

            // Collect good samples for SMOOTHING
            samples.push(currentPos);

            // Optimization: If we have enough good samples and the last one is very accurate, resolve
            if (samples.length >= requiredSamples && currentPos.accuracy <= desiredAccuracy) {
              finish(calculateAveragePosition(samples));
            }
          }
        },
      );
    } catch (err) {
      handleError(err);
    }

    // Secondary timer to resolve with partial samples if we're taking too long but have data
    setTimeout(() => {
      if (!hasResolved && samples.length >= 2) {
        finish(calculateAveragePosition(samples));
      }
    }, maxWait);
  });
};

/**
 * Distance between two points in metres.
 * Delegates to Turf.js haversineDistance for maximum precision.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  return haversineDistance(lat1, lon1, lat2, lon2);
};

/**
 * Point-in-polygon helper that supports both [lat,lng] and [lng,lat] polygon inputs.
 * Uses Turf.js under the hood via venueValidation.pointInPolygon.
 */
export const pointInPolygon = (
  point: [number, number],
  polygon: number[][],
): boolean => {
  if (!polygon || polygon.length < 3) return false;

  let coords = polygon;
  const [a, b] = polygon[0];
  const isLatLng = Math.abs(a) <= 90 && Math.abs(b) <= 180;
  if (isLatLng) {
    coords = polygon.map(([lat, lng]) => [lng, lat]);
  }

  return turfPointInPolygon(point, coords);
};

/**
 * High-level venue-location verification using Turf.js.
 * Accepts student + venue coordinates, optional boundary and radius.
 */
export const verifyVenueLocation = (
  studentLat: number,
  studentLng: number,
  venueLat: number,
  venueLng: number,
  boundary: number[][] | null | undefined,
  radius: number,
): ValidationResult => {
  return validateLocation(studentLat, studentLng, venueLat, venueLng, boundary, radius);
};

/**
 * Human-friendly distance formatting while preserving metre-level precision.
 */
export const formatDistance = (distanceMetres: number): string => {
  if (!Number.isFinite(distanceMetres)) return '–';
  if (distanceMetres < 1000) {
    return `${Math.round(distanceMetres)} m`;
  }
  const km = distanceMetres / 1000;
  return `${km.toFixed(2)} km`;
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location === 'granted';
  } catch {
    return false;
  }
};

/**
 * Get the WebGL renderer name to detect emulators.
 */
export const getWebGLRenderer = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    console.error('WebGL detection error:', e);
  }
  return null;
};

/**
 * Get device fingerprint (visitorId).
 */
export const getVisitorId = async (): Promise<string | null> => {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (e) {
    console.error('Fingerprint generation error:', e);
    return null;
  }
};

/**
 * Get location based on IP address as a secondary verification method.
 */
export const getIPLocation = async (): Promise<{ latitude: number; longitude: number; city: string } | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || 'Unknown'
      };
    }
    return null;
  } catch (e) {
    console.error('IP Geolocation error:', e);
    return null;
  }
};

/**
 * Validates GPS position against IP location.
 * A threshold of ~50km is used to account for ISP gateway routing.
 */
export const validateGPSWithIP = async (gpsLat: number, gpsLng: number): Promise<{ 
  valid: boolean, 
  distance: number, 
  ipCity?: string 
}> => {
  const ipLoc = await getIPLocation();
  if (!ipLoc) return { valid: true, distance: 0 }; // Fail safe if API is down

  const dist = haversineDistance(gpsLat, gpsLng, ipLoc.latitude, ipLoc.longitude);
  
  // 50km is a standard safe threshold for IP geolocation vs GPS
  return {
    valid: dist <= 50000,
    distance: dist,
    ipCity: ipLoc.city
  };
};

/**
 * Detect device motion during the sampling window.
 * Returns true if ANY acceleration (excluding gravity) was detected.
 */
export const detectMotion = async (durationMs: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    let moved = false;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      if (acc && (Math.abs(acc.x || 0) > 0.1 || Math.abs(acc.y || 0) > 0.1 || Math.abs(acc.z || 0) > 0.1)) {
        moved = true;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    setTimeout(() => {
      window.removeEventListener('devicemotion', handleMotion);
      resolve(moved);
    }, durationMs);
  });
};

/**
 * Collect all anti-cheat signals.
 */
export const getAntiCheatSignals = async (): Promise<AntiCheatSignals> => {
  const [visitorId, webglRenderer, motionDetected, ipLoc] = await Promise.all([
    getVisitorId(),
    Promise.resolve(getWebGLRenderer()),
    detectMotion(3000), // Check for 3 seconds of micro-movement
    getIPLocation(),
  ]);

  return { 
    visitorId: visitorId || undefined, 
    webglRenderer: webglRenderer || undefined,
    motionDetected,
    ipCity: ipLoc?.city,
    ipLocation: ipLoc ? { latitude: ipLoc.latitude, longitude: ipLoc.longitude } : undefined
  };
};

export const geolocationService = {
  getCurrentPosition,
  getMultipleSamples,
  calculateDistance,
  pointInPolygon,
  verifyVenueLocation,
  formatDistance,
  checkLocationPermission,
  getAntiCheatSignals,
  getIPLocation,
  validateGPSWithIP,
};
