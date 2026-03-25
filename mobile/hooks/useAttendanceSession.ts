import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { LocationPayload } from './useLocationVerification';
import {
  SessionConfig,
  ConfidenceResult,
  computeAttendanceConfidence,
  haversineDistanceMeters,
} from '../utils/attendanceScoring';
import { api } from '@/services/api';
import { storage } from '@/utils/storage';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

/** Status of the attendance session state machine. */
export type AttendanceSessionStatus =
  | 'idle'
  | 'collecting'
  | 'processing'
  | 'submitted'
  | 'rejected'
  | 'queued'
  | 'error';

/** Behavioural signals recorded during the presence window. */
export interface BehavioralFlags {
  appBackgrounded: boolean;
  backgroundDurationMs: number;
  locationExitCount: number;
  windowRestartCount: number;
  tapPatternSuspicious: boolean;
}

/** Value returned by the hook. */
export interface UseAttendanceSessionResult {
  status: AttendanceSessionStatus;
  windowProgress: number;
  sampleCount: number;
  confidenceResult: ConfidenceResult | null;
  behavioralFlags: BehavioralFlags;
  error: string | null;
  startSession: () => void;
  cancelSession: () => void;
}

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

const PRESENCE_WINDOW_DEFAULT_MS = 15_000; // 15 seconds as per requirements
const MIN_SAMPLES = 3;
const ACCURACY_THRESHOLD_M = 100; // 100m as per requirements for GeoIP fallback trigger
const SENSOR_INTERVAL_MS = 100;
const STILL_VARIANCE_THRESHOLD = 0.015;
const FALLBACK_ACCURACY_METERS = 999;
const MIN_ACCURACY_FOR_WEIGHT = 0.001;
const MOCK_ACCURACY_VALUES = new Set([0, 1]);
const MOCK_ACCURACY_REPEAT_THRESHOLD = 3;
const PROGRESS_TICK_MS = 100;
const TAP_SUSPICIOUS_THRESHOLD = 3;
const TAP_WINDOW_MS = 5_000;

interface GpsSample {
  lat: number;
  lng: number;
  accuracy: number;
  isMock: boolean;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAttendanceSession(
  sessionConfig: SessionConfig | null | undefined,
): UseAttendanceSessionResult {
  const presenceWindowMs =
    sessionConfig?.requiredPresenceWindowMs ?? PRESENCE_WINDOW_DEFAULT_MS;

  const [status, setStatus] = useState<AttendanceSessionStatus>('idle');
  const [windowProgress, setWindowProgress] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [confidenceResult, setConfidenceResult] =
    useState<ConfidenceResult | null>(null);
  const [behavioralFlags, setBehavioralFlags] =
    useState<BehavioralFlags>({
      appBackgrounded: false,
      backgroundDurationMs: 0,
      locationExitCount: 0,
      windowRestartCount: 0,
      tapPatternSuspicious: false,
    });
  const [error, setError] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const cleanupFnsRef = useRef<Array<() => void>>([]);
  const tapTimestampsRef = useRef<number[]>([]);

  const registerCleanup = (fn: () => void) => {
    cleanupFnsRef.current.push(fn);
  };

  const runCleanup = useCallback(() => {
    cleanupFnsRef.current.forEach((fn: () => void) => {
      try {
        fn();
      } catch { /* ignore */ }
    });
    cleanupFnsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      runCleanup();
    };
  }, [runCleanup]);

  const cancelSession = useCallback(() => {
    cancelledRef.current = true;
    runCleanup();
    setStatus('idle');
    setWindowProgress(0);
    setSampleCount(0);
    setError(null);
  }, [runCleanup]);

  const startSession = useCallback(async () => {
    if (status === 'collecting' || status === 'processing') return;

    cancelledRef.current = false;
    cleanupFnsRef.current = [];
    setConfidenceResult(null);
    setError(null);

    if (!sessionConfig) {
      setError('Internal error: Session configuration missing.');
      setStatus('error');
      return;
    }

    const now = Date.now();
    tapTimestampsRef.current = tapTimestampsRef.current.filter(
      (t: number) => now - t < TAP_WINDOW_MS,
    );
    tapTimestampsRef.current.push(now);
    const tapPatternSuspicious =
      tapTimestampsRef.current.length > TAP_SUSPICIOUS_THRESHOLD;

    setBehavioralFlags({
      appBackgrounded: false,
      backgroundDurationMs: 0,
      locationExitCount: 0,
      windowRestartCount: 0,
      tapPatternSuspicious,
    });
    setStatus('collecting');

    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (cancelledRef.current) return;

    if (permStatus !== 'granted') {
      setError('Location permission denied. Please allow location access in your device settings.');
      setStatus('error');
      return;
    }

    const gpsSamples: GpsSample[] = [];
    const suspiciousAccuracyCounts = new Map<number, number>();

    let accelCount = 0;
    let accelMeanX = 0, accelMeanY = 0, accelMeanZ = 0;
    let accelM2X = 0, accelM2Y = 0, accelM2Z = 0;

    let gyroDeltaX = 0, gyroDeltaY = 0, gyroDeltaZ = 0;
    let prevGyro: { x: number; y: number; z: number } | null = null;

    let networkType: 'wifi' | 'cellular' | 'none' = 'none';
    let ipAddress: string | undefined;

    let appBackgrounded = false;
    let isInBackground = false;
    let backgroundStartMs: number | null = null;
    let totalBackgroundMs = 0;

    let windowElapsedMs = 0;
    let windowStartMs = Date.now();

    let locationExitCount = 0;
    let windowRestartCount = 0;
    let wasInRadius = true;

    let resolveWindow: (() => void) | null = null;

    const getElapsedMs = () =>
      windowElapsedMs + (isInBackground ? 0 : Date.now() - windowStartMs);

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (cancelledRef.current) return;
      if (nextState !== 'active') {
        if (!isInBackground) {
          isInBackground = true;
          appBackgrounded = true;
          backgroundStartMs = Date.now();
          windowElapsedMs += Date.now() - windowStartMs;
          setBehavioralFlags((prev: BehavioralFlags) => ({ ...prev, appBackgrounded: true }));
        }
      } else {
        if (isInBackground) {
          const bgMs = backgroundStartMs ? Date.now() - backgroundStartMs : 0;
          totalBackgroundMs += bgMs;
          backgroundStartMs = null;
          isInBackground = false;
          windowStartMs = Date.now();
          setBehavioralFlags((prev: BehavioralFlags) => ({
            ...prev,
            appBackgrounded: true,
            backgroundDurationMs: totalBackgroundMs,
          }));
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);
    registerCleanup(() => appStateSub.remove());

    const handleLocationUpdate = (loc: Location.LocationObject) => {
      if (cancelledRef.current) return;

      const accuracy = loc.coords.accuracy ?? FALLBACK_ACCURACY_METERS;
      const isMock = !!(loc as any).mocked;

      if (MOCK_ACCURACY_VALUES.has(Math.round(accuracy))) {
        const rounded = Math.round(accuracy);
        suspiciousAccuracyCounts.set(rounded, (suspiciousAccuracyCounts.get(rounded) ?? 0) + 1);
      }

      if (accuracy <= ACCURACY_THRESHOLD_M) {
        gpsSamples.push({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy,
          isMock,
          timestamp: loc.timestamp,
        });
        setSampleCount(gpsSamples.length);
      }

      const dist = haversineDistanceMeters(
        loc.coords.latitude,
        loc.coords.longitude,
        sessionConfig.lecturerCoordinates.lat,
        sessionConfig.lecturerCoordinates.lng,
      );
      const inRadius = dist <= sessionConfig.allowedRadiusMeters;

      if (!inRadius && wasInRadius) {
        locationExitCount++;
        wasInRadius = false;
        if (locationExitCount === 1) {
          windowRestartCount++;
           windowElapsedMs = 0;
          windowStartMs = Date.now();
          setBehavioralFlags((prev: BehavioralFlags) => ({ ...prev, locationExitCount, windowRestartCount }));
          setError('You left the allowed area. Progress restarted.');
          setTimeout(() => { if (!cancelledRef.current) setError(null); }, 3000);
        } else {
          cancelledRef.current = true;
          setStatus('rejected');
          setError('Center has been rejected due to multiple area exits.');
          runCleanup();
          resolveWindow?.();
        }
      } else if (inRadius && !wasInRadius) {
        wasInRadius = true;
      }
    };

    const locSubPromise = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
      handleLocationUpdate,
    );
    locSubPromise.then((sub: Location.LocationSubscription) => registerCleanup(() => sub.remove()));

    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

    const accelSub = Accelerometer.addListener((data: { x: number, y: number, z: number }) => {
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

    const gyroSub = Gyroscope.addListener((data: { x: number; y: number; z: number }) => {
      if (cancelledRef.current) return;
      if (prevGyro !== null) {
        gyroDeltaX += Math.abs(data.x - prevGyro.x);
        gyroDeltaY += Math.abs(data.y - prevGyro.y);
        gyroDeltaZ += Math.abs(data.z - prevGyro.z);
      }
      prevGyro = { x: data.x, y: data.y, z: data.z };
    });
    registerCleanup(() => gyroSub.remove());

    const networkPromise = (async () => {
      try {
        const netState = await Network.getNetworkStateAsync();
        ipAddress = await Network.getIpAddressAsync();
        const nt = netState.type;
        if (nt === Network.NetworkStateType.WIFI) networkType = 'wifi';
        else if (nt === Network.NetworkStateType.CELLULAR) networkType = 'cellular';
      } catch { /* ignore */ }
    })();

    const progressIntervalId = setInterval(() => {
      if (cancelledRef.current) { clearInterval(progressIntervalId); return; }
      if (isInBackground) return;
      const elapsed = getElapsedMs();
      setWindowProgress(Math.round(Math.min(100, (elapsed / presenceWindowMs) * 100)));
      if (elapsed >= presenceWindowMs) { resolveWindow?.(); }
    }, PROGRESS_TICK_MS);
    registerCleanup(() => clearInterval(progressIntervalId));

    await new Promise<void>((resolve) => {
      resolveWindow = resolve;
      if (getElapsedMs() >= presenceWindowMs) resolve();
      registerCleanup(resolve as () => void);
    });

    if (cancelledRef.current) return;

    runCleanup();
    await networkPromise;

    setStatus('processing');

    const collectionDurationMs = getElapsedMs();

    // Fallback if not enough samples
    if (gpsSamples.length < MIN_SAMPLES) {
      try {
        const last = await Location.getLastKnownPositionAsync({});
        if (last) {
          gpsSamples.push({
            lat: last.coords.latitude,
            lng: last.coords.longitude,
            accuracy: last.coords.accuracy ?? FALLBACK_ACCURACY_METERS,
            isMock: !!(last as any).mocked,
            timestamp: last.timestamp
          });
        }
      } catch { /* ignore */ }
    }

    if (gpsSamples.length < MIN_SAMPLES) {
      // PHASE 2.3: GeoIP fallback
      let ipCity = 'Unknown';
      try {
        const geoResp = await fetch('http://ip-api.com/json/');
        const geoData = await geoResp.json();
        ipCity = geoData.city || 'Unknown';
      } catch { /* ignore */ }

      // Try one last current position
      try {
          const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          gpsSamples.push({
              lat: current.coords.latitude,
              lng: current.coords.longitude,
              accuracy: current.coords.accuracy ?? FALLBACK_ACCURACY_METERS,
              isMock: !!(current as any).mocked,
              timestamp: current.timestamp,
          });
      } catch { /* ignore */ }

      if (gpsSamples.length < 1) {
          setError('Could not establish location. Please check your GPS settings.');
          setStatus('error');
          return;
      }
    }

    // Weighted average and drift
    let totalWeight = 0, weightedLat = 0, weightedLng = 0;
    for (const s of gpsSamples) {
      const w = 1 / Math.max(s.accuracy, MIN_ACCURACY_FOR_WEIGHT);
      totalWeight += w;
      weightedLat += s.lat * w;
      weightedLng += s.lng * w;
    }
    const avgLat = weightedLat / totalWeight;
    const avgLng = weightedLng / totalWeight;
    const avgAccuracy = gpsSamples.reduce((sum, s) => sum + s.accuracy, 0) / gpsSamples.length;

    // Calculate drift_avg (average distance from center mean)
    const drift_avg = gpsSamples.reduce((sum, s) => 
        sum + haversineDistanceMeters(s.lat, s.lng, avgLat, avgLng), 0) / gpsSamples.length;

    const anyExplicitMock = gpsSamples.some((s) => s.isMock);
    const suspiciousRepeat = [...suspiciousAccuracyCounts.values()].some((c) => c >= MOCK_ACCURACY_REPEAT_THRESHOLD);
    const mockGpsFlag = anyExplicitMock || suspiciousRepeat;

    const varX = accelCount > 1 ? accelM2X / accelCount : 0;
    const varY = accelCount > 1 ? accelM2Y / accelCount : 0;
    const varZ = accelCount > 1 ? accelM2Z / accelCount : 0;
    const movementVariance = (varX + varY + varZ) / 3;
    const suspiciouslyStill = movementVariance < STILL_VARIANCE_THRESHOLD;

    // Phase 2.3: GeoIP City
    let ipCity = 'Unknown';
    try {
      const geoResp = await fetch('http://ip-api.com/json/');
      const geoData = await geoResp.json();
      ipCity = geoData.city || 'Unknown';
    } catch { /* ignore */ }

    // Device Identifiers
    let visitorId: string | undefined;
    let deviceId: string | undefined;
    if (Platform.OS === 'android') {
      visitorId = Application.androidId || undefined;
      deviceId = Device.osInternalBuildId || undefined;
    } else if (Platform.OS === 'ios') {
      visitorId = await Application.getIosIdForVendorAsync() || undefined;
      deviceId = Device.modelName || undefined;
    }

    const payload = {
      samples: gpsSamples.map(s => ({
        latitude: s.lat,
        longitude: s.lng,
        accuracy: s.accuracy,
        timestamp: s.timestamp,
        isMock: s.isMock
      })),
      latitude: avgLat,
      longitude: avgLng,
      accuracy: avgAccuracy,
      drift_avg,
      sample_count: gpsSamples.length,
      visitorId,
      deviceId,
      motionDetected: !suspiciouslyStill,
      ipCity,
      movementVariance,
      gyroDelta: { x: gyroDeltaX, y: gyroDeltaY, z: gyroDeltaZ },
      networkType,
      ipAddress,
      appBackgrounded,
      backgroundDurationMs: totalBackgroundMs,
      locationExitCount,
      windowRestartCount,
      tapPatternSuspicious,
      timestamp: new Date().toISOString()
    };

    const confidenceResult = computeAttendanceConfidence({
        coordinates: { lat: avgLat, lng: avgLng, accuracyMeters: avgAccuracy },
        sampleCount: gpsSamples.length,
        mockGpsFlag,
        networkType,
        movementVariance,
        suspiciouslyStill,
        gyroDelta: { x: gyroDeltaX, y: gyroDeltaY, z: gyroDeltaZ },
        collectionDurationMs,
        timestamp: payload.timestamp
    }, sessionConfig);

    setConfidenceResult(confidenceResult);
    
    // Phase 1.4: Real API call
    try {
      const isOnline = (await Network.getNetworkStateAsync()).isConnected;
      if (!isOnline) {
          // Phase 2.4: Offline check-in queue
          const queue = await storage.getAttendanceQueue();
          queue.push({ ...payload, sessionCode: sessionConfig.sessionCode } as any);
          await storage.queueAttendance({ ...payload, sessionCode: sessionConfig.sessionCode } as any);
          setStatus('queued');
          return;
      }

      const response: any = await api.checkIn.mark(sessionConfig.sessionCode, payload, { 
          _noRetry: true // Phase 1.4: NOT retry on 4xx responses
      });
      
      if (!cancelledRef.current) {
        setStatus('submitted');
      }
    } catch (e: any) {
      if (cancelledRef.current) return;
      
      const isNetworkError = !e.response?.status;
      if (isNetworkError) {
          // Queue it if network failed
          await storage.queueAttendance({ ...payload, sessionCode: sessionConfig.sessionCode } as any);
          setStatus('queued');
      } else {
          setError(e.response?.data?.detail || e.response?.data?.message || 'Submission failed');
          setStatus('error');
      }
    }
  }, [sessionConfig, presenceWindowMs, status, runCleanup]);

  return {
    status,
    windowProgress,
    sampleCount,
    confidenceResult,
    behavioralFlags,
    error,
    startSession,
    cancelSession,
  };
}
