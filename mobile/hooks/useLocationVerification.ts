import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocationPayload {
  coordinates: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  sampleCount: number;
  mockGpsFlag: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  movementVariance: number;
  suspiciouslyStill: boolean;
  /** Summed absolute gyroscope deltas over the collection window (supplementary signal). */
  gyroDelta: { x: number; y: number; z: number };
  collectionDurationMs: number;
  timestamp: string;
  /** Standard deviation (in meters) of accepted GPS samples from the weighted center. */
  sampleSpread?: number;
  /** Number of outlier samples rejected before averaging. */
  rejectedOutlierCount?: number;
}

export type VerificationStatus =
  | 'idle'
  | 'requesting_permissions'
  | 'collecting'
  | 'complete'
  | 'error';

export interface UseLocationVerificationResult {
  status: VerificationStatus;
  payload: LocationPayload | null;
  error: string | null;
  start: () => void;
  cancel: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLLECTION_WINDOW_MS = 17000; // ~17 seconds (within the 15–20 s window)
const MIN_SAMPLES = 3;
const ACCURACY_THRESHOLD_M = 50;
const SENSOR_INTERVAL_MS = 100;
const STILL_VARIANCE_THRESHOLD = 0.015;
// Fallback accuracy value (metres) used when the platform returns no accuracy data
const FALLBACK_ACCURACY_METERS = 999;
// Minimum accuracy denominator to prevent division by zero in the weighting formula
const MIN_ACCURACY_FOR_WEIGHT = 0.001;
// Suspiciously perfect accuracy values that commonly indicate a mock GPS
const MOCK_ACCURACY_VALUES = new Set([0, 1]);
const MOCK_ACCURACY_REPEAT_THRESHOLD = 3; // flag if same suspicious value seen ≥ this many times

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocationVerification(): UseLocationVerificationResult {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [payload, setPayload] = useState<LocationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs let us cancel/clean up without stale-closure issues
  const cancelledRef = useRef(false);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  const registerCleanup = (fn: () => void) => {
    cleanupFnsRef.current.push(fn);
  };

  const runCleanup = useCallback(() => {
    cleanupFnsRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore cleanup errors
      }
    });
    cleanupFnsRef.current = [];
  }, []);

  // Clean up when the component using this hook unmounts
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      runCleanup();
    };
  }, [runCleanup]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    runCleanup();
    setStatus('idle');
  }, [runCleanup]);

  const start = useCallback(async () => {
    // Reset state for a fresh run
    cancelledRef.current = false;
    cleanupFnsRef.current = [];
    setPayload(null);
    setError(null);
    setStatus('requesting_permissions');

    // ------------------------------------------------------------------
    // 1. Request permissions
    // ------------------------------------------------------------------
    const { status: permStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (cancelledRef.current) return;

    if (permStatus !== 'granted') {
      setError(
        'Location permission denied. Please allow location access in your device settings to mark attendance.'
      );
      setStatus('error');
      return;
    }

    setStatus('collecting');
    const startTime = Date.now();

    // ------------------------------------------------------------------
    // 2. GPS collection
    // ------------------------------------------------------------------
    interface GpsSample {
      lat: number;
      lng: number;
      accuracy: number;
      isMock: boolean;
    }

    const gpsSamples: GpsSample[] = [];

    // Track how many times each suspiciously-perfect accuracy value appears
    const suspiciousAccuracyCounts = new Map<number, number>();

    const locationSubscriptionPromise = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (loc) => {
        if (cancelledRef.current) return;

        const accuracy = loc.coords.accuracy ?? FALLBACK_ACCURACY_METERS;
        const isMock = !!(loc as any).mocked;

        // Track suspiciously perfect accuracy
        if (MOCK_ACCURACY_VALUES.has(Math.round(accuracy))) {
          const rounded = Math.round(accuracy);
          suspiciousAccuracyCounts.set(
            rounded,
            (suspiciousAccuracyCounts.get(rounded) ?? 0) + 1
          );
        }

        // Reject low-quality samples (but still track mock metadata)
        if (accuracy > ACCURACY_THRESHOLD_M) return;

        gpsSamples.push({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy,
          isMock,
        });
      }
    );

    // Use an object property so TypeScript doesn't narrow the value to `null`
    // after the async `.then()` assignment.
    const locationSubHolder: { sub: Location.LocationSubscription | null } = { sub: null };
    locationSubscriptionPromise
      .then((sub) => {
        locationSubHolder.sub = sub;
        registerCleanup(() => sub.remove());
      })
      .catch(() => {
        // If we can't start watching, we'll fall back to getLastKnownPositionAsync
      });

    // ------------------------------------------------------------------
    // 3. Network signals
    // ------------------------------------------------------------------
    let networkType: 'wifi' | 'cellular' | 'none' = 'none';

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
        } else {
          networkType = 'none';
        }

        // On Android, attempt a non-blocking last-known position to get any
        // extra context (SSID is not directly exposed by expo-location, but
        // the call provides an opportunity for future extension).
        if (Platform.OS === 'android') {
          Location.getLastKnownPositionAsync({}).catch(() => undefined);
        }
      } catch {
        // Soft signal — failure is acceptable
      }
    })();

    // ------------------------------------------------------------------
    // 4. Sensor sampling (Accelerometer + Gyroscope)
    // ------------------------------------------------------------------

    // We compute running statistics without keeping raw arrays:
    //   Welford's online algorithm for mean & M2 (variance numerator)
    let accelCount = 0;
    let accelMeanX = 0,
      accelMeanY = 0,
      accelMeanZ = 0;
    let accelM2X = 0,
      accelM2Y = 0,
      accelM2Z = 0;

    let gyroDeltaX = 0,
      gyroDeltaY = 0,
      gyroDeltaZ = 0;
    let prevGyro: { x: number; y: number; z: number } | null = null;

    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

    const accelSub = Accelerometer.addListener((data) => {
      if (cancelledRef.current) return;
      accelCount++;
      // Welford online update
      const deltaX = data.x - accelMeanX;
      accelMeanX += deltaX / accelCount;
      accelM2X += deltaX * (data.x - accelMeanX);

      const deltaY = data.y - accelMeanY;
      accelMeanY += deltaY / accelCount;
      accelM2Y += deltaY * (data.y - accelMeanY);

      const deltaZ = data.z - accelMeanZ;
      accelMeanZ += deltaZ / accelCount;
      accelM2Z += deltaZ * (data.z - accelMeanZ);
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

    // ------------------------------------------------------------------
    // 5. Wait for the collection window to elapse
    // ------------------------------------------------------------------
    await new Promise<void>((resolve) => {
      const tid = setTimeout(() => resolve(), COLLECTION_WINDOW_MS);
      registerCleanup(() => clearTimeout(tid));
    });

    if (cancelledRef.current) return;

    // Stop sensors immediately after the window
    accelSub.remove();
    gyroSub.remove();
    locationSubHolder.sub?.remove();
    await networkPromise;

    const collectionDurationMs = Date.now() - startTime;

    // ------------------------------------------------------------------
    // 6. Compute GPS payload
    // ------------------------------------------------------------------

    // If not enough samples passed the accuracy filter, attempt a fallback
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
          'Please move to an area with better GPS signal and try again.'
      );
      setStatus('error');
      runCleanup();
      return;
    }

    // ------------------------------------------------------------------
    // Haversine helper (local, no extra dependency)
    // ------------------------------------------------------------------
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

    // Weighted average with outlier rejection
    // Weights are 1 / accuracy^2 because GPS error is approximately Gaussian
    // and the reported `accuracy` value represents roughly one standard deviation.
    let accepted = gpsSamples;
    let rejectedOutlierCount = 0;

    if (accepted.length >= 3) {
      const lats = accepted.map(s => s.lat).sort((a, b) => a - b);
      const lngs = accepted.map(s => s.lng).sort((a, b) => a - b);
      const medianLat = lats[Math.floor(lats.length / 2)];
      const medianLng = lngs[Math.floor(lngs.length / 2)];

      const before = accepted.length;
      accepted = accepted.filter(s => {
        const dist = haversineDistanceMeters(s.lat, s.lng, medianLat, medianLng);
        if (dist > 30) {
          console.log(`Rejecting outlier (${Math.round(dist)}m from median)`);
          return false;
        }
        return true;
      });
      rejectedOutlierCount = before - accepted.length;

      if (accepted.length === 0) {
        accepted = gpsSamples;
        rejectedOutlierCount = 0;
      }
    }

    // Accuracy-weighted average: weight = 1 / accuracy^2
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    for (const s of accepted) {
      const w = 1 / Math.max(s.accuracy, MIN_ACCURACY_FOR_WEIGHT) ** 2;
      totalWeight += w;
      weightedLat += s.lat * w;
      weightedLng += s.lng * w;
    }

    const avgLat = weightedLat / totalWeight;
    const avgLng = weightedLng / totalWeight;
    const avgAccuracy = accepted.reduce((sum, s) => sum + s.accuracy, 0) / accepted.length;

    // Compute sample spread = std dev (in meters) from weighted center
    let spreadSumSq = 0;
    for (const s of accepted) {
      const d = haversineDistanceMeters(s.lat, s.lng, avgLat, avgLng);
      spreadSumSq += d * d;
    }
    const sampleSpread = Math.sqrt(spreadSumSq / accepted.length);

    // Mock GPS detection:
    // (a) any sample was explicitly marked as mocked
    const anyExplicitMock = gpsSamples.some((s) => s.isMock);
    // (b) suspiciously perfect accuracy repeated many times
    const suspiciousRepeat = [...suspiciousAccuracyCounts.values()].some(
      (count) => count >= MOCK_ACCURACY_REPEAT_THRESHOLD
    );
    const mockGpsFlag = anyExplicitMock || suspiciousRepeat;

    // ------------------------------------------------------------------
    // 7. Compute movement variance from Welford statistics
    // ------------------------------------------------------------------
    // variance per axis = M2 / count  (population variance)
    const varX = accelCount > 1 ? accelM2X / accelCount : 0;
    const varY = accelCount > 1 ? accelM2Y / accelCount : 0;
    const varZ = accelCount > 1 ? accelM2Z / accelCount : 0;
    const movementVariance = (varX + varY + varZ) / 3;
    const suspiciouslyStill = movementVariance < STILL_VARIANCE_THRESHOLD;

    // ------------------------------------------------------------------
    // 8. Assemble final payload
    // ------------------------------------------------------------------
    const result: LocationPayload = {
      coordinates: {
        lat: avgLat,
        lng: avgLng,
        accuracyMeters: avgAccuracy,
      },
      sampleCount: gpsSamples.length,
      mockGpsFlag,
      networkType,
      movementVariance,
      suspiciouslyStill,
      gyroDelta: { x: gyroDeltaX, y: gyroDeltaY, z: gyroDeltaZ },
      collectionDurationMs,
      timestamp: new Date().toISOString(),
      sampleSpread,
      rejectedOutlierCount,
    };

    if (!cancelledRef.current) {
      setPayload(result);
      setStatus('complete');
    }
  }, [runCleanup]);

  return { status, payload, error, start, cancel };
}
