/**
 * Lightweight venue location validation (no PostGIS / heavy GIS libs needed).
 *
 * Provides:
 *  - haversineDistance  – distance in metres between two lat/lng points
 *  - pointInPolygon     – ray-casting algorithm identical to backend geolocation_utils.py
 *  - validateLocation   – unified "is student inside venue?" check
 */

/** Haversine distance in metres between two lat/lng points */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Ray-casting point-in-polygon.
 *
 * `polygon` is an array of **[lng, lat]** pairs (GeoJSON / MapLibre convention).
 * Returns true when `point` [lat, lng] is inside the polygon.
 *
 * Mirrors the Python implementation in backend/institutions/geolocation_utils.py.
 */
export function pointInPolygon(
  point: [number, number], // [lat, lng]
  polygon: number[][],     // [[lng, lat], …]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const [lat, lon] = point;
  let inside = false;
  const n = polygon.length;

  let [p1Lng, p1Lat] = polygon[0];
  for (let i = 1; i <= n; i++) {
    const [p2Lng, p2Lat] = polygon[i % n];

    if (Math.min(p1Lat, p2Lat) < lat && lat <= Math.max(p1Lat, p2Lat)) {
      if (p2Lat !== p1Lat) {
        const lonIntersect =
          p1Lng + ((lat - p1Lat) * (p2Lng - p1Lng)) / (p2Lat - p1Lat);
        if (lon <= lonIntersect) inside = !inside;
      }
    }

    p1Lng = p2Lng;
    p1Lat = p2Lat;
  }

  return inside;
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
 * @param boundary     Polygon as [[lng, lat], …] pairs.  Pass null/undefined to use radius.
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
    // Polygon mode – boundary coords may be [lng, lat] or [lat, lng];
    // the serializer stores them as [lat, lng] per the Python convention.
    // We normalise: if abs(coord[0]) <= 90 && abs(coord[1]) <= 180 it's [lat, lng].
    let poly = boundary;
    const first = boundary[0];
    const isLatLng = Math.abs(first[0]) <= 90 && Math.abs(first[1]) <= 180;
    if (isLatLng) {
      // Convert [lat, lng] → [lng, lat] for pointInPolygon
      poly = boundary.map(([lat, lng]) => [lng, lat]);
    }
    const isInside = pointInPolygon([studentLat, studentLng], poly);
    return { isInside, distance, method: 'polygon' };
  }

  return { isInside: distance <= radius, distance, method: 'radius' };
}
