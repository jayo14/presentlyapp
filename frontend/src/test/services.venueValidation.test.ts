import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  pointInPolygon,
  validateLocation,
} from '../../services/venueValidation';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(7.3775, 3.8936, 7.3775, 3.8936)).toBeCloseTo(0, 3);
  });

  it('returns a positive distance between two different points', () => {
    // Rough distance between two known points ~111km per degree latitude
    const dist = haversineDistance(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(100_000);
    expect(dist).toBeLessThan(120_000);
  });

  it('calculates distance symmetrically', () => {
    const d1 = haversineDistance(7.3775, 3.8936, 7.3800, 3.8950);
    const d2 = haversineDistance(7.3800, 3.8950, 7.3775, 3.8936);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

describe('pointInPolygon', () => {
  // A simple square polygon in [lng, lat] form (as expected by pointInPolygon directly)
  const squarePoly: number[][] = [
    [3.89, 7.37], // [lng, lat]
    [3.90, 7.37],
    [3.90, 7.38],
    [3.89, 7.38],
    [3.89, 7.37], // closed
  ];

  it('returns true for a point inside the polygon', () => {
    // Center of the square: lat=7.375, lng=3.895
    expect(pointInPolygon([7.375, 3.895], squarePoly)).toBe(true);
  });

  it('returns false for a point outside the polygon', () => {
    // Clearly outside
    expect(pointInPolygon([7.400, 3.895], squarePoly)).toBe(false);
  });

  it('returns false when polygon has fewer than 3 points', () => {
    expect(pointInPolygon([7.375, 3.895], [[3.89, 7.37], [3.90, 7.37]])).toBe(false);
  });
});

describe('validateLocation', () => {
  // Backend stores boundary as [lat, lng] pairs – validateLocation normalizes them internally
  const squarePoly: number[][] = [
    [7.37, 3.89], // [lat, lng]
    [7.37, 3.90],
    [7.38, 3.90],
    [7.38, 3.89],
    [7.37, 3.89],
  ];

  const venueLat = 7.375;
  const venueLng = 3.895;

  it('returns polygon method and isInside=true when inside polygon boundary', () => {
    const result = validateLocation(7.375, 3.895, venueLat, venueLng, squarePoly, 50);
    expect(result.method).toBe('polygon');
    expect(result.isInside).toBe(true);
  });

  it('returns polygon method and isInside=false when outside polygon boundary', () => {
    const result = validateLocation(7.400, 3.895, venueLat, venueLng, squarePoly, 50);
    expect(result.method).toBe('polygon');
    expect(result.isInside).toBe(false);
  });

  it('returns radius method when no boundary provided', () => {
    const result = validateLocation(7.375, 3.895, venueLat, venueLng, null, 50);
    expect(result.method).toBe('radius');
    // Student at venue centre → inside 50m radius
    expect(result.isInside).toBe(true);
  });

  it('returns radius method and isInside=false when student is beyond radius', () => {
    // ~1km away
    const result = validateLocation(7.385, 3.895, venueLat, venueLng, null, 50);
    expect(result.method).toBe('radius');
    expect(result.isInside).toBe(false);
  });

  it('always returns a numeric distance', () => {
    const result = validateLocation(7.375, 3.895, venueLat, venueLng, squarePoly, 50);
    expect(typeof result.distance).toBe('number');
    expect(isFinite(result.distance)).toBe(true);
  });
});
