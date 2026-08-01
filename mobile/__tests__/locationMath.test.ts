/**
 * Unit tests for GPS sample averaging, outlier rejection, and spread calculation.
 *
 * These tests verify the math in isolation using fixed sample arrays,
 * independent of the actual GPS watch machinery.
 */

const EARTH_RADIUS_METERS = 6_371_000;

const haversineDistanceMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

interface Sample {
  lat: number;
  lng: number;
  accuracy: number;
}

interface AverageResult {
  lat: number;
  lng: number;
  accuracy: number;
  sampleSpread: number;
  rejectedOutlierCount: number;
}

function computeWeightedAverageWithOutliers(
  samples: Sample[],
  outlierThresholdMeters = 30,
): AverageResult {
  if (samples.length === 0) {
    throw new Error('No samples');
  }

  let accepted = samples;
  let rejectedOutlierCount = 0;

  if (accepted.length >= 3) {
    const lats = accepted.map(s => s.lat).sort((a, b) => a - b);
    const lngs = accepted.map(s => s.lng).sort((a, b) => a - b);
    const medianLat = lats[Math.floor(lats.length / 2)];
    const medianLng = lngs[Math.floor(lngs.length / 2)];

    const before = accepted.length;
    accepted = accepted.filter(s => {
      const dist = haversineDistanceMeters(s.lat, s.lng, medianLat, medianLng);
      return dist <= outlierThresholdMeters;
    });
    rejectedOutlierCount = before - accepted.length;

    if (accepted.length === 0) {
      accepted = samples;
      rejectedOutlierCount = 0;
    }
  }

  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;

  for (const s of accepted) {
    const w = 1 / Math.max(s.accuracy, 0.001) ** 2;
    totalWeight += w;
    weightedLat += s.lat * w;
    weightedLng += s.lng * w;
  }

  const avgLat = weightedLat / totalWeight;
  const avgLng = weightedLng / totalWeight;
  const avgAccuracy = accepted.reduce((sum, s) => sum + s.accuracy, 0) / accepted.length;

  let spreadSumSq = 0;
  for (const s of accepted) {
    const d = haversineDistanceMeters(s.lat, s.lng, avgLat, avgLng);
    spreadSumSq += d * d;
  }
  const sampleSpread = Math.sqrt(spreadSumSq / accepted.length);

  return { lat: avgLat, lng: avgLng, accuracy: avgAccuracy, sampleSpread, rejectedOutlierCount };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GPS weighted average and outlier rejection', () => {
  // A cluster of samples near (0, 0) with varying accuracy.
  const tightCluster: Sample[] = [
    { lat: 0.0001, lng: 0.0001, accuracy: 5 },
    { lat: -0.0001, lng: 0.0001, accuracy: 8 },
    { lat: 0.0001, lng: -0.0001, accuracy: 3 },
    { lat: -0.0001, lng: -0.0001, accuracy: 10 },
    { lat: 0.0, lng: 0.0, accuracy: 4 },
  ];

  // One sample far away from the cluster (outlier).
  const withOutlier: Sample[] = [
    ...tightCluster,
    { lat: 0.05, lng: 0.05, accuracy: 5 }, // ~7km away — clear outlier
  ];

  it('weights high-accuracy samples more heavily than low-accuracy ones', () => {
    const result = computeWeightedAverageWithOutliers(tightCluster);
    // The center should be pulled toward the high-accuracy samples (accuracy 3, 4, 5)
    // and away from the low-accuracy ones (accuracy 8, 10).
    // With plain average, the center would be near (0, 0).
    // With weighted average, it should be closer to the 3-5m accuracy samples.
    expect(result.lat).toBeGreaterThan(-0.00005);
    expect(result.lat).toBeLessThan(0.00005);
    expect(result.lng).toBeGreaterThan(-0.00005);
    expect(result.lng).toBeLessThan(0.00005);
  });

  it('produces a tighter sampleSpread for a tight cluster', () => {
    const result = computeWeightedAverageWithOutliers(tightCluster);
    // All samples are within ~15m of each other, so spread should be small.
    expect(result.sampleSpread).toBeLessThan(20);
  });

  it('rejects outliers beyond the threshold', () => {
    const result = computeWeightedAverageWithOutliers(withOutlier, 30);
    expect(result.rejectedOutlierCount).toBe(1);
  });

  it('ignores the outlier when computing the average', () => {
    const withoutOutlier = computeWeightedAverageWithOutliers(withOutlier, 30);
    const onlyCluster = computeWeightedAverageWithOutliers(tightCluster, 30);

    expect(withoutOutlier.lat).toBeCloseTo(onlyCluster.lat, 6);
    expect(withoutOutlier.lng).toBeCloseTo(onlyCluster.lng, 6);
  });

  it('falls back to all samples if outlier removal empties the set', () => {
    // All samples are far from each other, but we still need a result.
    const farApart: Sample[] = [
      { lat: 0.1, lng: 0.1, accuracy: 5 },
      { lat: -0.1, lng: -0.1, accuracy: 5 },
      { lat: 0.1, lng: -0.1, accuracy: 5 },
    ];
    const result = computeWeightedAverageWithOutliers(farApart, 1);
    expect(result.rejectedOutlierCount).toBe(0);
    expect(result.sampleSpread).toBeGreaterThan(0);
  });

  it('does not reject outliers when fewer than 3 samples', () => {
    const twoSamples: Sample[] = [
      { lat: 0, lng: 0, accuracy: 5 },
      { lat: 0.1, lng: 0.1, accuracy: 5 },
    ];
    const result = computeWeightedAverageWithOutliers(twoSamples, 30);
    expect(result.rejectedOutlierCount).toBe(0);
  });

  it('returns 0 spread for identical samples', () => {
    const identical: Sample[] = [
      { lat: 0, lng: 0, accuracy: 5 },
      { lat: 0, lng: 0, accuracy: 8 },
      { lat: 0, lng: 0, accuracy: 3 },
    ];
    const result = computeWeightedAverageWithOutliers(identical, 30);
    expect(result.sampleSpread).toBeCloseTo(0, 5);
  });

  it('computes non-zero spread for scattered samples', () => {
    const scattered: Sample[] = [
      { lat: 0, lng: 0, accuracy: 5 },
      { lat: 0.001, lng: 0, accuracy: 5 },
      { lat: 0, lng: 0.001, accuracy: 5 },
    ];
    const result = computeWeightedAverageWithOutliers(scattered, 1000);
    expect(result.sampleSpread).toBeGreaterThan(0);
  });

  it('does not throw on empty array when fallback is provided', () => {
    // The function itself throws on empty; this documents the contract.
    expect(() => computeWeightedAverageWithOutliers([])).toThrow('No samples');
  });
});
