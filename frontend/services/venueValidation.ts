import * as turf from '@turf/turf';

/**
 * Venue location validation using Turf.js.
 *
 * Provides:
 *  - haversineDistance  – distance in metres using Turf.js
 *  - pointInPolygon     – point-in-polygon using Turf.js
 *  - validateLocation   – unified "is student inside venue?" check
 */

/** Distance in metres between two points */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const from = turf.point([lon1, lat1]);
  const to = turf.point([lon2, lat2]);
  return turf.distance(from, to, { units: 'meters' });
}

/**
 * Check if a point is inside a polygon.
 *
 * @param point    [lat, lng]
 * @param polygon  [[lng, lat], ...]
 */
export function pointInPolygon(
  point: [number, number],
  polygon: number[][],
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const pt = turf.point([point[1], point[0]]);

  // Ensure the polygon is closed for Turf.js
  const coords = [...polygon];
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push(coords[0]);
  }

  const poly = turf.polygon([coords]);
  return turf.booleanPointInPolygon(pt, poly);
}

export interface ValidationResult {
  isInside: boolean;
  distance: number; // metres from venue centre
  method: 'polygon' | 'radius';
}

/**
 * Determine whether a student's coordinates are inside a venue.
 *
 * @param studentLat   Student latitude
 * @param studentLng   Student longitude
 * @param venueLat     Venue centre latitude
 * @param venueLng     Venue centre longitude
 * @param boundary     Polygon as [[lng, lat], …] pairs (or [lat, lng]).
 * @param radius       Verification radius in metres (used when no boundary).
 */
export function validateLocation(
  studentLat: number,
  studentLng: number,
  venueLat: number,
  venueLng: number,
  boundary: number[][] | null | undefined,
  radius: number,
): ValidationResult {
  const distance = haversineDistance(studentLat, studentLng, venueLat, venueLng);

  if (boundary && boundary.length >= 3) {
    // Normalise boundary coordinates to [[lng, lat], ...]
    let poly = boundary;
    const first = boundary[0];
    const isLatLng = Math.abs(first[0]) <= 90 && Math.abs(first[1]) <= 180;
    if (isLatLng) {
      poly = boundary.map(([lat, lng]) => [lng, lat]);
    }

    const isInside = pointInPolygon([studentLat, studentLng], poly);
    return { isInside, distance, method: 'polygon' };
  }

  return { isInside: distance <= radius, distance, method: 'radius' };
}
