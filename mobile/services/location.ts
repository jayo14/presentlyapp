import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface LocationSample {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isMock?: boolean;
  /** Standard deviation (in meters) of accepted samples from the weighted center. */
  sampleSpread?: number;
  /** Number of outlier samples rejected before averaging. */
  rejectedOutlierCount?: number;
}

export interface AntiCheatSignals {
  visitorId?: string;
  deviceId?: string;
  webglRenderer?: string;
  isEmulator?: boolean;
  motionDetected?: boolean;
  ipAddress?: string;
}

/**
 * Get a high-precision, smoothed location by collecting and averaging multiple GPS samples.
 * Filters out jitter and low-accuracy readings (>= 50m).
 */
export const getHighPrecisionLocation = async (
  options: {
    requiredSamples?: number;
    timeoutMs?: number;
    accuracyThreshold?: number;
    outlierThresholdMeters?: number;
    onProgress?: (message: string) => void;
  } = {}
): Promise<LocationSample> => {
  const {
    requiredSamples = 5,
    timeoutMs = 25000,
    accuracyThreshold = 50,
    outlierThresholdMeters = 30,
    onProgress
  } = options;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const samples: LocationSample[] = [];
  let bestSingleSample: LocationSample | null = null;
  
  return new Promise(async (resolve, reject) => {
    let watchSubscription: Location.LocationSubscription | null = null;
    let timeoutId: any = null;
    let resolved = false;

    const cleanup = () => {
      if (watchSubscription) {
        watchSubscription.remove();
        watchSubscription = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const finish = (result: LocationSample) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

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

    // ------------------------------------------------------------------
    // Weighted average with outlier rejection
    // ------------------------------------------------------------------
    // Weights are 1 / accuracy^2 because GPS error is approximately Gaussian
    // and the reported `accuracy` value represents roughly one standard deviation.
    // Squared-inverse weighting therefore gives higher weight to more precise
    // readings and naturally down-weights noisy samples.
    const calculateAverage = (dataPoints: LocationSample[]): LocationSample => {
      if (dataPoints.length === 0) throw new Error('No GPS samples acquired');

      // Phase 1: outlier rejection (requires >= 3 samples to compute a median)
      let accepted = dataPoints;
      let rejectedOutlierCount = 0;

      if (accepted.length >= 3) {
        const lats = accepted.map(s => s.latitude).sort((a, b) => a - b);
        const lngs = accepted.map(s => s.longitude).sort((a, b) => a - b);
        const medianLat = lats[Math.floor(lats.length / 2)];
        const medianLng = lngs[Math.floor(lngs.length / 2)];

        const before = accepted.length;
        accepted = accepted.filter(s => {
          const dist = haversineDistanceMeters(s.latitude, s.longitude, medianLat, medianLng);
          if (dist > outlierThresholdMeters) {
            onProgress?.(`Rejecting outlier (${Math.round(dist)}m from median)`);
            return false;
          }
          return true;
        });
        rejectedOutlierCount = before - accepted.length;

        if (accepted.length === 0) {
          accepted = dataPoints;
          rejectedOutlierCount = 0;
        }
      }

      // Phase 2: accuracy-weighted average (weight = 1 / accuracy^2)
      let totalWeight = 0;
      let weightedLat = 0;
      let weightedLng = 0;

      for (const s of accepted) {
        const w = 1 / Math.max(s.accuracy, 0.001) ** 2;
        totalWeight += w;
        weightedLat += s.latitude * w;
        weightedLng += s.longitude * w;
      }

      const avgLat = weightedLat / totalWeight;
      const avgLng = weightedLng / totalWeight;
      const avgAcc = accepted.reduce((sum, s) => sum + s.accuracy, 0) / accepted.length;

      // Phase 3: compute sample spread = std dev (in meters) from weighted center
      let spreadSumSq = 0;
      for (const s of accepted) {
        const d = haversineDistanceMeters(s.latitude, s.longitude, avgLat, avgLng);
        spreadSumSq += d * d;
      }
      const sampleSpread = Math.sqrt(spreadSumSq / accepted.length);

      return {
        latitude: avgLat,
        longitude: avgLng,
        accuracy: avgAcc,
        timestamp: accepted[accepted.length - 1].timestamp,
        sampleSpread,
        rejectedOutlierCount,
      };
    };

    timeoutId = setTimeout(() => {
      if (samples.length > 0) {
        finish(calculateAverage(samples));
      } else if (bestSingleSample) {
        finish(bestSingleSample);
      } else {
        cleanup();
        reject(new Error('GPS timeout: Signal too weak. Please ensure you are outdoors.'));
      }
    }, timeoutMs);

    try {
      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        (location) => {
          const sample: LocationSample = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? 999,
            timestamp: location.timestamp,
            isMock: (location as any).mocked || false
          };

          // Track best fallback
          if (!bestSingleSample || sample.accuracy < bestSingleSample.accuracy) {
            bestSingleSample = sample;
          }

          // Force rejection if mock detected
          if (sample.isMock) {
            onProgress?.(`Security Alert: Mock location detected`);
            // We still collect it to let the backend decide, but we flag it
          }

          // FILTER: Reject bad signals
          if (sample.accuracy > accuracyThreshold) {
            onProgress?.(`Filtering noise... (±${Math.round(sample.accuracy)}m)`);
            return;
          }

          samples.push(sample);
          onProgress?.(`Refining... (${samples.length}/${requiredSamples})`);

          if (samples.length >= requiredSamples) {
            finish(calculateAverage(samples));
          }
        }
      );
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
};

/**
 * Collect anti-cheat signals for mobile devices.
 */
export const getAntiCheatSignals = async (): Promise<AntiCheatSignals> => {
  const signals: AntiCheatSignals = {
    isEmulator: !Device.isDevice,
  };

  // 1. Detect motion (check for 2 seconds)
  const motionPromise = new Promise<boolean>((resolve) => {
    let moved = false;
    const subscription = Accelerometer.addListener(data => {
      const totalAcc = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      // If deviation from gravity (1.0) is > 0.1, we count it as movement
      if (Math.abs(totalAcc - 1.0) > 0.1) {
        moved = true;
      }
    });
    setTimeout(() => {
      subscription.remove();
      resolve(moved);
    }, 2000);
  });

  try {
    const [moved, ip] = await Promise.all([
      motionPromise,
      Network.getIpAddressAsync().catch(() => undefined)
    ]);
    
    signals.motionDetected = moved;
    signals.ipAddress = ip;

    if (Platform.OS === 'android') {
      signals.visitorId = Application.getAndroidId() || undefined;
      signals.deviceId = Device.osInternalBuildId || undefined;
    } else if (Platform.OS === 'ios') {
      signals.visitorId = await Application.getIosIdForVendorAsync() || undefined;
      signals.deviceId = Device.modelName || undefined;
    }
  } catch (e) {
    console.warn('Error collecting mobile anti-cheat signals:', e);
  }

  return signals;
};

export const locationService = {
  getHighPrecisionLocation,
  getAntiCheatSignals
};
