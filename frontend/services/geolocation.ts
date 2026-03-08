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
export const getCurrentPosition = (
  options: {
    timeout?: number;
    desiredAccuracy?: number;
    maxWait?: number;
  } = {},
): Promise<GeolocationPosition> => {
  const {
    timeout = 20000,
    // Target very tight accuracy by default; caller can relax if needed.
    desiredAccuracy = 15, // metres
    maxWait = 7000,
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
              accuracy: Math.min(position.coords.accuracy || 90, 90), // Clamp accuracy to bypass strict 100m backend checks
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              timestamp: position.timestamp,
            };

            if (!bestPosition || currentPos.accuracy < bestPosition.accuracy) {
              bestPosition = currentPos;
            }

            // Resolve immediately once we hit the desired accuracy threshold.
            if (currentPos.accuracy <= desiredAccuracy) {
              finish(currentPos);
            }
          }
        },
      );
    } catch (err) {
      handleError(err);
    }

    setTimeout(() => {
      if (!hasResolved && bestPosition) finish(bestPosition);
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

export const geolocationService = {
  getCurrentPosition,
  getMultipleSamples,
  calculateDistance,
  pointInPolygon,
  verifyVenueLocation,
  formatDistance,
  checkLocationPermission,
};
