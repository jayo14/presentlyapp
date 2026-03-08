import * as Location from 'expo-location';

export interface LocationSample {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
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
    onProgress?: (message: string) => void;
  } = {}
): Promise<LocationSample> => {
  const {
    requiredSamples = 5,
    timeoutMs = 25000,
    accuracyThreshold = 50,
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

    const calculateAverage = (dataPoints: LocationSample[]): LocationSample => {
      if (dataPoints.length === 0) throw new Error('No GPS samples acquired');
      const sumLat = dataPoints.reduce((s, p) => s + p.latitude, 0);
      const sumLon = dataPoints.reduce((s, p) => s + p.longitude, 0);
      const avgAcc = dataPoints.reduce((s, p) => s + p.accuracy, 0) / dataPoints.length;
      
      return {
        latitude: sumLat / dataPoints.length,
        longitude: sumLon / dataPoints.length,
        accuracy: avgAcc,
        timestamp: dataPoints[dataPoints.length - 1].timestamp
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
            timestamp: location.timestamp
          };

          // Track best fallback
          if (!bestSingleSample || sample.accuracy < bestSingleSample.accuracy) {
            bestSingleSample = sample;
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

export const locationService = {
  getHighPrecisionLocation
};
