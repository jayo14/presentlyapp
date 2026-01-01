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
 * Get current position with high accuracy
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        });
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
  if (!navigator.permissions) {
    // Permissions API not supported, assume we need to request
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
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
