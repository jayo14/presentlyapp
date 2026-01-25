import { Geolocation, Position } from '@capacitor/geolocation';

/**
 * Geolocation utilities for frontend attendance check-in
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
}

/**
 * Get current position with high accuracy and stability.
 * Uses watchPosition to warm up GPS and find the best accuracy within a timeout.
 */
export const getCurrentPosition = (
  options: { 
    timeout?: number; 
    desiredAccuracy?: number; 
    maxWait?: number 
  } = {}
): Promise<GeolocationPosition> => {
  const { 
    timeout = 30000, 
    desiredAccuracy = 20, // meters
    maxWait = 5000 // wait up to 5s for better accuracy if initial is poor
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
      const permissionStatus = await checkLocationPermission();
      if (!permissionStatus) {
        // Try to request permission
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          reject(new Error('Location permission denied. Please enable location access.'));
          return;
        }
      }
    } catch (e) {
      console.warn('Error checking permissions:', e);
      // Continue anyway, maybe it works
    }

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
      // If we have a cached position, use it instead of failing completely
      if (bestPosition && !hasResolved) {
        finish(bestPosition);
        return;
      }

      if (hasResolved) return;
      
      let message = 'Failed to get location';
      if (error && error.message) {
        message = error.message;
      }
      
      hasResolved = true;
      cleanup();
      reject(new Error(message));
    };

    // Set absolute timeout
    timerId = setTimeout(() => {
      if (bestPosition) {
        finish(bestPosition);
      } else {
        handleError({ code: 3, message: 'Timeout' });
      }
    }, timeout);

    try {
      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: timeout,
          maximumAge: 0
        },
        (position, err) => {
          if (err) {
            // Don't error out immediately on watch error, just log and wait for timeout or success
            console.warn('Watch position error:', err);
            return;
          }

          if (position) {
            const currentPos: GeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            };

            // If this is the first reading, or better accuracy than previous
            if (!bestPosition || currentPos.accuracy < bestPosition.accuracy) {
              bestPosition = currentPos;
            }

            // If accuracy is good enough, return immediately
            if (currentPos.accuracy <= desiredAccuracy) {
              finish(currentPos);
            }
          }
        }
      );
    } catch (err) {
      handleError(err);
    }
    
    // Safety fallback: if we haven't hit desired accuracy by maxWait, just return best we have
    setTimeout(() => {
        if (!hasResolved && bestPosition) {
            finish(bestPosition);
        }
    }, maxWait);
  });
};

/**
 * Calculate distance between two points (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if a point is inside a polygon (Ray casting algorithm)
 */
export const pointInPolygon = (
  point: [number, number],
  polygon: number[][]
): boolean => {
  if (!polygon || polygon.length < 3) return false;

  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat_i, lon_i] = polygon[i];
    const [lat_j, lon_j] = polygon[j];

    // Check if point's longitude is between the two vertices' longitudes
    const intersect =
      ((lon_i > lon) !== (lon_j > lon)) &&
      (lat < (lat_j - lat_i) * (lon - lon_i) / (lon_j - lon_i) + lat_i);

    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Request and check location permission status
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

/**
 * Verify if user is within venue boundaries
 */
export const verifyVenueLocation = (
  userLat: number,
  userLon: number,
  userElevation: number | undefined,
  venueLat: number,
  venueLon: number,
  venueElevation: number | undefined,
  boundary: number[][] | undefined,
  radius: number
): { verified: boolean; distance: number; message: string } => {
  const distance = calculateDistance(userLat, userLon, venueLat, venueLon);

  // Check polygon boundary if available
  if (boundary && boundary.length >= 3) {
    const inBoundary = pointInPolygon([userLat, userLon], boundary);
    
    // Additional elevation check if both elevations are available
    if (inBoundary && userElevation !== undefined && venueElevation !== undefined) {
      const elevationDiff = Math.abs(userElevation - venueElevation);
      if (elevationDiff > 10) {
        return {
          verified: false,
          distance,
          message: `You are ${distance.toFixed(0)}m from venue center but elevation mismatch (${elevationDiff.toFixed(0)}m difference)`,
        };
      }
    }

    return {
      verified: inBoundary,
      distance,
      message: inBoundary
        ? 'Location verified within venue boundary'
        : `You are ${distance.toFixed(0)}m from venue. Please move closer.`,
    };
  }

  // Use radius-based verification
  const verified = distance <= radius;
  return {
    verified,
    distance,
    message: verified
      ? `Location verified (${distance.toFixed(0)}m from venue)`
      : `You are ${distance.toFixed(0)}m from venue. Required: within ${radius}m.`,
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

export const geolocationService = {
  getCurrentPosition,
  calculateDistance,
  pointInPolygon,
  checkLocationPermission,
  verifyVenueLocation,
  formatDistance,
};
