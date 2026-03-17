/**
 * useAttendanceSession.ts
 *
 * Phase 3: Behavioral validation hook for GPS-verified university attendance.
 *
 * Wraps Phase 1 (location-payload collection) and Phase 2 (confidence
 * scoring) in a time-gated presence window that observes natural device
 * behaviour before allowing a confidence score to be computed.
 *
 * Presence-window flow
 * --------------------
 * 1. Student calls `startSession()`.
 * 2. A presence window begins (duration = SessionConfig.requiredPresenceWindowMs,
 *    default 20 s).
 * 3. During the window:
 *    - GPS samples are collected continuously (Phase 1 logic).
 *    - Accelerometer + Gyroscope are monitored via Welford online algorithm.
 *    - `windowProgress` (0–100) is updated every 100 ms for the progress bar.
 *    - If the student leaves the allowed radius the timer is restarted once
 *      (warning shown).  On a second exit the session is REJECTED.
 *    - If the app goes to background the timer pauses and `appBackgrounded`
 *      is flagged (integrity signal — not silently ignored).
 * 4. After the window closes, a LocationPayload is assembled and
 *    `computeAttendanceConfidence()` is called.
 * 5. The result (plus behavioural flags) is submitted to the backend.
 *    Phase 4 will wire up the real endpoint; for now a mock is used.
 *
 * Behavioural flags
 * -----------------
 *   appBackgrounded      – did the app leave foreground during the window?
 *   backgroundDurationMs – total milliseconds spent backgrounded
 *   locationExitCount    – how many times the student left the allowed radius
 *   windowRestartCount   – how many times the window was restarted
 *   tapPatternSuspicious – > 3 startSession calls within 5 s before the window
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { LocationPayload } from './useLocationVerification';
import {
  SessionConfig,
  ConfidenceResult,
  computeAttendanceConfidence,
  haversineDistanceMeters,
} from '../utils/attendanceScoring';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

/** Status of the attendance session state machine. */
export type AttendanceSessionStatus =
  | 'idle'
  | 'collecting'
  | 'processing'
  | 'submitted'
  | 'rejected';

/** Behavioural signals recorded during the presence window. */
export interface BehavioralFlags {
  /** True if the app left the foreground at any point during the window. */
  appBackgrounded: boolean;
  /** Total milliseconds spent in the background during the window. */
  backgroundDurationMs: number;
  /** Number of times the student exited the allowed radius mid-window. */
  locationExitCount: number;
  /** Number of times the presence window was restarted due to a radius exit. */
  windowRestartCount: number;
  /**
   * True when `startSession` was tapped more than 3 times within 5 seconds
   * before the window started — a potential replay / automation signal.
   */
  tapPatternSuspicious: boolean;
}

/** Value returned by the hook. */
export interface UseAttendanceSessionResult {
  status: AttendanceSessionStatus;
  /** Progress of the presence window: 0–100.  Drive a progress bar with this. */
  windowProgress: number;
  confidenceResult: ConfidenceResult | null;
  behavioralFlags: BehavioralFlags;
  error: string | null;
  /** Begin the check-in flow. No-op while already collecting or processing. */
  startSession: () => void;
  /** Abort any in-progress session and reset to idle. */
  cancelSession: () => void;
}

// ---------------------------------------------------------------------------
// Internal constants (mirror Phase 1 values where applicable)
// ---------------------------------------------------------------------------

const PRESENCE_WINDOW_DEFAULT_MS = 20_000;
const MIN_SAMPLES = 3;
const ACCURACY_THRESHOLD_M = 50;
const SENSOR_INTERVAL_MS = 100;
const STILL_VARIANCE_THRESHOLD = 0.015;
const FALLBACK_ACCURACY_METERS = 999;
const MIN_ACCURACY_FOR_WEIGHT = 0.001;
const MOCK_ACCURACY_VALUES = new Set([0, 1]);
const MOCK_ACCURACY_REPEAT_THRESHOLD = 3;
const PROGRESS_TICK_MS = 100;

/** Maximum taps within TAP_WINDOW_MS before `tapPatternSuspicious` is set. */
const TAP_SUSPICIOUS_THRESHOLD = 3;
const TAP_WINDOW_MS = 5_000;

// ---------------------------------------------------------------------------
// Internal GPS sample type
// ---------------------------------------------------------------------------

interface GpsSample {
  lat: number;
  lng: number;
  accuracy: number;
  isMock: boolean;
}

// ---------------------------------------------------------------------------
// Mock backend submission (Phase 4 will replace this)
// ---------------------------------------------------------------------------

/**
 * Simulates submitting the attendance payload to the backend.
 * Includes the LocationPayload, ConfidenceResult, and BehavioralFlags so
 * that Phase 4 only needs to swap this out for a real API call.
 */
async function mockSubmitAttendance(
  _payload: LocationPayload,
  _result: ConfidenceResult,
  _flags: BehavioralFlags,
  _config: SessionConfig,
): Promise<{ success: boolean }> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Default behavioural flags
// ---------------------------------------------------------------------------

const DEFAULT_FLAGS: BehavioralFlags = {
  appBackgrounded: false,
  backgroundDurationMs: 0,
  locationExitCount: 0,
  windowRestartCount: 0,
  tapPatternSuspicious: false,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Orchestrates the full GPS-verified attendance check-in flow.
 *
 * @param sessionConfig  Backend-supplied session description (required).
 *                       Pass `SessionConfig` obtained after the student enters
 *                       their session code or scans the QR code.
 */
export function useAttendanceSession(
  sessionConfig: SessionConfig,
): UseAttendanceSessionResult {
  const presenceWindowMs =
    sessionConfig?.requiredPresenceWindowMs ?? PRESENCE_WINDOW_DEFAULT_MS;

  // ---------------------------------------------------------------------------
  // React state (drives UI)
  // ---------------------------------------------------------------------------
  const [status, setStatus] = useState<AttendanceSessionStatus>('idle');
  const [windowProgress, setWindowProgress] = useState(0);
  const [confidenceResult, setConfidenceResult] =
    useState<ConfidenceResult | null>(null);
  const [behavioralFlags, setBehavioralFlags] =
    useState<BehavioralFlags>(DEFAULT_FLAGS);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Refs (mutable across renders / shared with async callbacks)
  // ---------------------------------------------------------------------------

  /** Set to true on cancel or unmount to short-circuit async work. */
  const cancelledRef = useRef(false);

  /** Cleanup functions registered during a session — all invoked on cancel/unmount. */
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  /** Timestamps of recent `startSession` calls for tap-pattern detection. */
  const tapTimestampsRef = useRef<number[]>([]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const registerCleanup = (fn: () => void) => {
    cleanupFnsRef.current.push(fn);
  };

  const runCleanup = useCallback(() => {
    cleanupFnsRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore cleanup errors
      }
    });
    cleanupFnsRef.current = [];
  }, []);

  // ---------------------------------------------------------------------------
  // Unmount cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      runCleanup();
    };
  }, [runCleanup]);

  // ---------------------------------------------------------------------------
  // cancelSession
  // ---------------------------------------------------------------------------

  const cancelSession = useCallback(() => {
    cancelledRef.current = true;
    runCleanup();
    setStatus('idle');
    setWindowProgress(0);
    setError(null);
  }, [runCleanup]);

  // ---------------------------------------------------------------------------
  // startSession
  // ---------------------------------------------------------------------------

  const startSession = useCallback(async () => {
    // Prevent concurrent sessions
    if (status === 'collecting' || status === 'processing') return;

    // -------------------------------------------------------------------------
    // 0. Reset state
    // -------------------------------------------------------------------------
    cancelledRef.current = false;
    cleanupFnsRef.current = [];
    setWindowProgress(0);
    setConfidenceResult(null);
    setError(null);

    // -------------------------------------------------------------------------
    // Tap-pattern detection
    // Record this call and prune timestamps older than TAP_WINDOW_MS.
    // -------------------------------------------------------------------------
    const now = Date.now();
    tapTimestampsRef.current = tapTimestampsRef.current.filter(
      (t) => now - t < TAP_WINDOW_MS,
    );
    tapTimestampsRef.current.push(now);
    const tapPatternSuspicious =
      tapTimestampsRef.current.length > TAP_SUSPICIOUS_THRESHOLD;

    setBehavioralFlags({ ...DEFAULT_FLAGS, tapPatternSuspicious });
    setStatus('collecting');

    // -------------------------------------------------------------------------
    // 1. Request foreground location permission
    // -------------------------------------------------------------------------
    const { status: permStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (cancelledRef.current) return;

    if (permStatus !== 'granted') {
      setError(
        'Location permission denied. Please allow location access in your device settings to mark attendance.',
      );
      setStatus('idle');
      return;
    }

    // =========================================================================
    // Mutable window-state shared across all callbacks via closure.
    // Primitives (numbers, booleans) are used so that closures always read
    // the latest value via the enclosing scope — no stale-ref needed here.
    // =========================================================================

    // --- GPS ---
    const gpsSamples: GpsSample[] = [];
    const suspiciousAccuracyCounts = new Map<number, number>();

    // --- Accelerometer (Welford online mean + M2 per axis) ---
    let accelCount = 0;
    let accelMeanX = 0,
      accelMeanY = 0,
      accelMeanZ = 0;
    let accelM2X = 0,
      accelM2Y = 0,
      accelM2Z = 0;

    // --- Gyroscope (summed absolute deltas) ---
    let gyroDeltaX = 0,
      gyroDeltaY = 0,
      gyroDeltaZ = 0;
    let prevGyro: { x: number; y: number; z: number } | null = null;

    // --- Network ---
    let networkType: 'wifi' | 'cellular' | 'none' = 'none';

    // --- Background tracking ---
    let appBackgrounded = false;
    let isInBackground = false;
    let backgroundStartMs: number | null = null;
    let totalBackgroundMs = 0;

    // --- Presence window timing ---
    // windowElapsedMs = accumulated active (foreground) time
    // windowStartMs   = timestamp when the current active period began
    let windowElapsedMs = 0;
    let windowStartMs = Date.now();

    // --- Radius-exit tracking ---
    let locationExitCount = 0;
    let windowRestartCount = 0;
    let wasInRadius = true;

    // Resolve handle for the window-completion promise (set below)
    let resolveWindow: (() => void) | null = null;

    /**
     * Returns total active (foreground) milliseconds elapsed in the window.
     * Accounts for time frozen while the app was in the background.
     */
    const getElapsedMs = () =>
      windowElapsedMs + (isInBackground ? 0 : Date.now() - windowStartMs);

    // -------------------------------------------------------------------------
    // 2. AppState listener — pause timer when app enters background
    // -------------------------------------------------------------------------
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (cancelledRef.current) return;

      if (nextState !== 'active') {
        // Entering background or inactive
        if (!isInBackground) {
          isInBackground = true;
          appBackgrounded = true;
          backgroundStartMs = Date.now();
          // Freeze the window timer
          windowElapsedMs += Date.now() - windowStartMs;
          setBehavioralFlags((prev) => ({ ...prev, appBackgrounded: true }));
        }
      } else {
        // Returning to foreground
        if (isInBackground) {
          const bgMs = backgroundStartMs ? Date.now() - backgroundStartMs : 0;
          totalBackgroundMs += bgMs;
          backgroundStartMs = null;
          isInBackground = false;
          windowStartMs = Date.now(); // resume from now
          setBehavioralFlags((prev) => ({
            ...prev,
            appBackgrounded: true,
            backgroundDurationMs: totalBackgroundMs,
          }));
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);
    registerCleanup(() => appStateSub.remove());

    // -------------------------------------------------------------------------
    // 3. GPS collection + radius-exit detection
    // -------------------------------------------------------------------------
    const locationSubHolder: { sub: Location.LocationSubscription | null } = {
      sub: null,
    };

    const handleLocationUpdate = (loc: Location.LocationObject) => {
      if (cancelledRef.current) return;

      const accuracy = loc.coords.accuracy ?? FALLBACK_ACCURACY_METERS;
      const isMock = !!(loc as any).mocked;

      // Mock-GPS heuristic: perfect accuracy values repeated suspiciously
      if (MOCK_ACCURACY_VALUES.has(Math.round(accuracy))) {
        const rounded = Math.round(accuracy);
        suspiciousAccuracyCounts.set(
          rounded,
          (suspiciousAccuracyCounts.get(rounded) ?? 0) + 1,
        );
      }

      // Only keep high-quality samples for the payload
      if (accuracy <= ACCURACY_THRESHOLD_M) {
        gpsSamples.push({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy,
          isMock,
        });
      }

      // Radius-exit detection runs on every sample regardless of accuracy
      const dist = haversineDistanceMeters(
        loc.coords.latitude,
        loc.coords.longitude,
        sessionConfig.lecturerCoordinates.lat,
        sessionConfig.lecturerCoordinates.lng,
      );
      const inRadius = dist <= sessionConfig.allowedRadiusMeters;

      if (!inRadius && wasInRadius) {
        // Transition: in-range → out-of-range
        locationExitCount++;
        wasInRadius = false;

        if (locationExitCount === 1) {
          // First exit: restart the window once
          windowRestartCount++;
          windowElapsedMs = 0;
          windowStartMs = Date.now();
          setBehavioralFlags((prev) => ({
            ...prev,
            locationExitCount,
            windowRestartCount,
          }));
          setError(
            'You left the allowed area. The presence window has been restarted — please return to your session location.',
          );
          // Auto-clear warning after 3 s
          const warnTimer = setTimeout(() => {
            if (!cancelledRef.current) setError(null);
          }, 3_000);
          registerCleanup(() => clearTimeout(warnTimer));
        } else {
          // Second exit: reject
          setBehavioralFlags((prev) => ({
            ...prev,
            locationExitCount,
            appBackgrounded: appBackgrounded,
            backgroundDurationMs: totalBackgroundMs,
          }));
          cancelledRef.current = true;
          setStatus('rejected');
          setError(
            'You have left the allowed area a second time. Attendance check-in has been rejected.',
          );
          runCleanup(); // removes all subscriptions and resolves window promise
          resolveWindow?.();
        }
      } else if (inRadius && !wasInRadius) {
        // Transition: out-of-range → in-range
        wasInRadius = true;
      }
    };

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      handleLocationUpdate,
    )
      .then((sub) => {
        locationSubHolder.sub = sub;
        registerCleanup(() => sub.remove());
      })
      .catch(() => {
        // Subscription failed — fall through to getLastKnownPositionAsync
        // fallback at the end of the window.
      });

    // -------------------------------------------------------------------------
    // 4. Accelerometer + Gyroscope
    // -------------------------------------------------------------------------
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

    const accelSub = Accelerometer.addListener((data) => {
      if (cancelledRef.current) return;
      accelCount++;
      const dX = data.x - accelMeanX;
      accelMeanX += dX / accelCount;
      accelM2X += dX * (data.x - accelMeanX);
      const dY = data.y - accelMeanY;
      accelMeanY += dY / accelCount;
      accelM2Y += dY * (data.y - accelMeanY);
      const dZ = data.z - accelMeanZ;
      accelMeanZ += dZ / accelCount;
      accelM2Z += dZ * (data.z - accelMeanZ);
    });
    registerCleanup(() => accelSub.remove());

    const gyroSub = Gyroscope.addListener((data) => {
      if (cancelledRef.current) return;
      if (prevGyro !== null) {
        gyroDeltaX += Math.abs(data.x - prevGyro.x);
        gyroDeltaY += Math.abs(data.y - prevGyro.y);
        gyroDeltaZ += Math.abs(data.z - prevGyro.z);
      }
      prevGyro = { x: data.x, y: data.y, z: data.z };
    });
    registerCleanup(() => gyroSub.remove());

    // -------------------------------------------------------------------------
    // 5. Network state (async, non-blocking)
    // -------------------------------------------------------------------------
    const networkPromise = (async () => {
      try {
        const netState = await Network.getNetworkStateAsync();
        const nt = netState.type;
        if (nt === Network.NetworkStateType.WIFI) {
          networkType = 'wifi';
        } else if (
          nt === Network.NetworkStateType.CELLULAR ||
          nt === Network.NetworkStateType.WIMAX ||
          nt === Network.NetworkStateType.BLUETOOTH
        ) {
          networkType = 'cellular';
        }
        if (Platform.OS === 'android') {
          // Prime the Android location cache so subsequent calls return faster.
          // The result is intentionally discarded here; it serves only as a
          // warm-up request (mirroring the Phase 1 useLocationVerification approach).
          Location.getLastKnownPositionAsync({}).catch(() => undefined);
        }
      } catch {
        // Soft signal — failure is acceptable
      }
    })();

    // -------------------------------------------------------------------------
    // 6. Progress ticker — fires every PROGRESS_TICK_MS while in foreground
    // -------------------------------------------------------------------------
    const progressIntervalId = setInterval(() => {
      if (cancelledRef.current) {
        clearInterval(progressIntervalId);
        return;
      }
      if (isInBackground) return;

      const elapsed = getElapsedMs();
      const progress = Math.min(100, (elapsed / presenceWindowMs) * 100);
      setWindowProgress(Math.round(progress));

      if (elapsed >= presenceWindowMs) {
        clearInterval(progressIntervalId);
        resolveWindow?.();
      }
    }, PROGRESS_TICK_MS);
    registerCleanup(() => clearInterval(progressIntervalId));

    // -------------------------------------------------------------------------
    // 7. Await presence window completion (or cancellation / rejection)
    // -------------------------------------------------------------------------
    await new Promise<void>((resolve) => {
      resolveWindow = resolve;
      // Guard: if the window is already satisfied (e.g. very short config),
      // resolve immediately.
      if (getElapsedMs() >= presenceWindowMs) {
        resolve();
        return;
      }
      // Ensure cancellation/unmount unblocks this await.
      registerCleanup(resolve);
    });

    if (cancelledRef.current) return;

    // -------------------------------------------------------------------------
    // 8. Stop sensors; await network result
    // -------------------------------------------------------------------------
    // runCleanup() invokes all registered cleanup callbacks: sensor removes,
    // interval clear, and AppState listener removal.  The window-completion
    // promise has already resolved at this point so calling it again is safe.
    runCleanup();
    await networkPromise;

    const collectionDurationMs = getElapsedMs();

    setWindowProgress(100);
    setStatus('processing');

    // -------------------------------------------------------------------------
    // 9. Build LocationPayload (Phase 1 logic)
    // -------------------------------------------------------------------------

    // Attempt a fallback if we didn't collect enough high-quality samples
    if (gpsSamples.length < MIN_SAMPLES) {
      try {
        const fallback = await Location.getLastKnownPositionAsync({});
        if (fallback) {
          const acc = fallback.coords.accuracy ?? FALLBACK_ACCURACY_METERS;
          gpsSamples.push({
            lat: fallback.coords.latitude,
            lng: fallback.coords.longitude,
            accuracy: acc,
            isMock: !!(fallback as any).mocked,
          });
        }
      } catch {
        // Non-fatal
      }
    }

    if (cancelledRef.current) return;

    if (gpsSamples.length < MIN_SAMPLES) {
      setError(
        `Could not collect enough GPS samples (got ${gpsSamples.length}/${MIN_SAMPLES}). ` +
          'Please move to an area with better GPS signal and try again.',
      );
      setStatus('idle');
      return;
    }

    // Weighted-average position (weight = 1 / accuracy)
    let totalWeight = 0,
      weightedLat = 0,
      weightedLng = 0;
    for (const s of gpsSamples) {
      const w = 1 / Math.max(s.accuracy, MIN_ACCURACY_FOR_WEIGHT);
      totalWeight += w;
      weightedLat += s.lat * w;
      weightedLng += s.lng * w;
    }
    const avgLat = weightedLat / totalWeight;
    const avgLng = weightedLng / totalWeight;
    const avgAccuracy =
      gpsSamples.reduce((sum, s) => sum + s.accuracy, 0) / gpsSamples.length;

    // Mock-GPS detection
    const anyExplicitMock = gpsSamples.some((s) => s.isMock);
    const suspiciousRepeat = [...suspiciousAccuracyCounts.values()].some(
      (c) => c >= MOCK_ACCURACY_REPEAT_THRESHOLD,
    );
    const mockGpsFlag = anyExplicitMock || suspiciousRepeat;

    // Movement statistics from Welford accumulators
    const varX = accelCount > 1 ? accelM2X / accelCount : 0;
    const varY = accelCount > 1 ? accelM2Y / accelCount : 0;
    const varZ = accelCount > 1 ? accelM2Z / accelCount : 0;
    const movementVariance = (varX + varY + varZ) / 3;
    const suspiciouslyStill = movementVariance < STILL_VARIANCE_THRESHOLD;

    const locationPayload: LocationPayload = {
      coordinates: { lat: avgLat, lng: avgLng, accuracyMeters: avgAccuracy },
      sampleCount: gpsSamples.length,
      mockGpsFlag,
      networkType,
      movementVariance,
      suspiciouslyStill,
      gyroDelta: { x: gyroDeltaX, y: gyroDeltaY, z: gyroDeltaZ },
      collectionDurationMs,
      timestamp: new Date().toISOString(),
    };

    // -------------------------------------------------------------------------
    // 10. Compute confidence score (Phase 2)
    // -------------------------------------------------------------------------
    const result = computeAttendanceConfidence(locationPayload, sessionConfig);

    const finalFlags: BehavioralFlags = {
      appBackgrounded,
      backgroundDurationMs: totalBackgroundMs,
      locationExitCount,
      windowRestartCount,
      tapPatternSuspicious,
    };

    setConfidenceResult(result);
    setBehavioralFlags(finalFlags);

    if (result.verdict === 'REJECTED') {
      setStatus('rejected');
      return;
    }

    // -------------------------------------------------------------------------
    // 11. Submit to backend (mock — Phase 4 will wire up the real endpoint)
    //     The full payload includes LocationPayload, ConfidenceResult, and
    //     BehavioralFlags so that the backend receives all integrity signals.
    // -------------------------------------------------------------------------
    try {
      await mockSubmitAttendance(
        locationPayload,
        result,
        finalFlags,
        sessionConfig,
      );
      if (!cancelledRef.current) {
        setStatus('submitted');
      }
    } catch {
      if (!cancelledRef.current) {
        setError('Failed to submit attendance. Please try again.');
        setStatus('idle');
      }
    }
  }, [sessionConfig, presenceWindowMs, status, runCleanup]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    status,
    windowProgress,
    confidenceResult,
    behavioralFlags,
    error,
    startSession,
    cancelSession,
  };
}
