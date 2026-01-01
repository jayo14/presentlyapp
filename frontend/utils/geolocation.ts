/**
 * Geolocation utilities for attendance check-in
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get current user location
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        const errorMessages: Record<number, string> = {
          1: 'Location permission denied. Please enable location access.',
          2: 'Location information unavailable.',
          3: 'Location request timed out.',
        };
        
        reject({
          code: error.code,
          message: errorMessages[error.code] || 'Unknown error occurred',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
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
 * Check if user is within the allowed radius
 */
export const isWithinRadius = (
  userLat: number,
  userLon: number,
  venueLat: number,
  venueLon: number,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(userLat, userLon, venueLat, venueLon);
  return distance <= radiusMeters;
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

/**
 * Get location accuracy description
 */
export const getAccuracyDescription = (accuracy: number): string => {
  if (accuracy <= 10) return 'Excellent';
  if (accuracy <= 50) return 'Good';
  if (accuracy <= 100) return 'Fair';
  return 'Poor';
};

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state === 'granted' || result.state === 'prompt';
    }
    // Fallback: try to get location to trigger permission
    await getCurrentLocation();
    return true;
  } catch (error) {
    return false;
  }
};
