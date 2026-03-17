/**
 * attendanceScoring.ts
 *
 * Pure confidence-scoring engine for GPS-verified university attendance.
 * Takes a LocationPayload (produced by useLocationVerification) and a
 * SessionConfig (provided by the backend) and returns a ConfidenceResult
 * with a 0–100 score, a verdict, a per-category breakdown, and human-readable
 * failure reasons.
 *
 * No side effects, no API calls — safe to call anywhere.
 */

import { LocationPayload } from '../hooks/useLocationVerification';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

/** Backend-supplied description of the current attendance session. */
export interface SessionConfig {
  sessionId: string;
  lecturerCoordinates: { lat: number; lng: number };
  /** Radius within which a student is considered "in range" (e.g. 50 m). */
  allowedRadiusMeters: number;
  /** Minimum collection window the student must have been present for (ms). */
  requiredPresenceWindowMs: number;
  /** Minimum number of GPS samples required for a valid payload. */
  minSamples: number;
  /** When true, stricter thresholds apply (e.g. suspiciouslyStill → auto-reject). */
  strictMode: boolean;
}

/** Per-category point contributions (all values are non-negative integers). */
export interface ScoreBreakdown {
  /** 0–40 pts based on Haversine distance to the lecturer's location. */
  proximityScore: number;
  /** 0–20 pts based on GPS accuracy and sample count. */
  accuracyScore: number;
  /** 0–20 pts based on accelerometer movement variance. */
  movementScore: number;
  /** 0–20 pts based on mock-GPS detection, network type, and duration. */
  integrityScore: number;
}

/** Final attendance verdict. */
export type Verdict = 'ACCEPTED' | 'FLAGGED' | 'REJECTED';

/** Result returned by {@link computeAttendanceConfidence}. */
export interface ConfidenceResult {
  /** Composite score in the range 0–100. */
  score: number;
  verdict: Verdict;
  breakdown: ScoreBreakdown;
  /** Human-readable explanations for every point deduction or auto-reject. */
  failReasons: string[];
}

// ---------------------------------------------------------------------------
// Haversine helper
// ---------------------------------------------------------------------------

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Returns the great-circle distance in **metres** between two WGS-84 points
 * using the Haversine formula.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

/**
 * Computes an attendance confidence score from a `LocationPayload` and a
 * `SessionConfig`.
 *
 * The result contains:
 * - `score`     – composite 0–100 value
 * - `verdict`   – ACCEPTED / FLAGGED / REJECTED
 * - `breakdown` – per-category point contributions
 * - `failReasons` – human-readable deduction explanations
 *
 * This is a **pure function**: it has no side effects and makes no API calls.
 */
export function computeAttendanceConfidence(
  payload: LocationPayload,
  sessionConfig: SessionConfig,
): ConfidenceResult {
  const failReasons: string[] = [];
  let autoReject = false;

  // -------------------------------------------------------------------------
  // 1. PROXIMITY SCORE (0–40 pts)
  //    Full 40 pts within allowedRadiusMeters, linear decay to 0 at 2×radius,
  //    hard 0 beyond 2× radius.
  // -------------------------------------------------------------------------
  const distanceM = haversineDistanceMeters(
    payload.coordinates.lat,
    payload.coordinates.lng,
    sessionConfig.lecturerCoordinates.lat,
    sessionConfig.lecturerCoordinates.lng,
  );

  const maxRadius = sessionConfig.allowedRadiusMeters;
  let proximityScore: number;

  if (distanceM <= maxRadius) {
    proximityScore = 40;
  } else if (distanceM <= 2 * maxRadius) {
    // Linear decay: score = 40 × (2×radius − distance) / radius
    proximityScore = Math.round(40 * (2 * maxRadius - distanceM) / maxRadius);
  } else {
    proximityScore = 0;
    failReasons.push(
      `Student is ${Math.round(distanceM)}m away — beyond the 2× allowed radius (${2 * maxRadius}m).`,
    );
  }

  // -------------------------------------------------------------------------
  // 2. ACCURACY SCORE (0–20 pts)
  //    Tiered by GPS accuracy; 0 if sample count is insufficient.
  // -------------------------------------------------------------------------
  let accuracyScore: number;

  if (payload.sampleCount < sessionConfig.minSamples) {
    accuracyScore = 0;
    failReasons.push(
      `Insufficient GPS samples: ${payload.sampleCount} collected, ${sessionConfig.minSamples} required.`,
    );
  } else if (payload.coordinates.accuracyMeters <= 15) {
    accuracyScore = 20;
  } else if (payload.coordinates.accuracyMeters <= 30) {
    accuracyScore = 15;
  } else if (payload.coordinates.accuracyMeters <= 50) {
    accuracyScore = 10;
  } else {
    accuracyScore = 0;
    failReasons.push(
      `GPS accuracy too low: ${Math.round(payload.coordinates.accuracyMeters)}m (threshold: 50m).`,
    );
  }

  // -------------------------------------------------------------------------
  // 3. MOVEMENT SCORE (0–20 pts)
  //    Rewards natural human movement; penalises suspicious stillness.
  //    In strictMode, suspiciouslyStill triggers an automatic REJECT.
  // -------------------------------------------------------------------------
  let movementScore: number;

  if (payload.suspiciouslyStill) {
    movementScore = 0;
    failReasons.push('Device appears suspiciously still — possible stationary spoofing.');

    if (sessionConfig.strictMode) {
      autoReject = true;
      failReasons.push('Strict mode: suspiciously still device is an automatic rejection.');
    }
  } else if (payload.movementVariance >= 0.05) {
    // ≥ 0.05 m²/s² average variance across axes — typical ambulatory movement
    movementScore = 20;
  } else if (payload.movementVariance >= 0.015) {
    // 0.015–0.05: subtle movement (e.g. standing and shifting weight)
    movementScore = 10;
  } else {
    movementScore = 0;
    failReasons.push(
      `Movement variance too low (${payload.movementVariance.toFixed(4)}) — minimal movement detected.`,
    );
  }

  // -------------------------------------------------------------------------
  // 4. INTEGRITY SCORE (0–20 pts)
  //    Deductions for mock GPS, missing network, and short collection window.
  //    mockGpsFlag triggers an automatic REJECT regardless of score.
  // -------------------------------------------------------------------------
  let integrityScore = 20;

  if (payload.mockGpsFlag) {
    integrityScore -= 20;
    autoReject = true;
    failReasons.push('Mock/spoofed GPS detected — automatic rejection.');
  }

  if (payload.networkType === 'none') {
    integrityScore -= 10;
    failReasons.push('No network connectivity detected during collection.');
  }

  if (payload.collectionDurationMs < sessionConfig.requiredPresenceWindowMs) {
    integrityScore -= 5;
    failReasons.push(
      `Collection window too short: ${payload.collectionDurationMs}ms < required ${sessionConfig.requiredPresenceWindowMs}ms.`,
    );
  }

  // Guard against negative integrity score
  integrityScore = Math.max(0, integrityScore);

  // -------------------------------------------------------------------------
  // Composite score & verdict
  // -------------------------------------------------------------------------
  const score = proximityScore + accuracyScore + movementScore + integrityScore;

  let verdict: Verdict;

  if (autoReject || score < 50) {
    verdict = 'REJECTED';
  } else if (score >= 75) {
    verdict = 'ACCEPTED';
  } else {
    verdict = 'FLAGGED';
  }

  return {
    score,
    verdict,
    breakdown: {
      proximityScore,
      accuracyScore,
      movementScore,
      integrityScore,
    },
    failReasons,
  };
}
