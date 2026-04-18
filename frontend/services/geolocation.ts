import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import {
  haversineDistance,
  pointInPolygon as turfPointInPolygon,
  validateLocation,
  type ValidationResult,
} from './venueValidation';

/**
 * Geolocation and Anti-Cheat System for Presently
 * Designed by: Senior Geolocation & Anti-Cheat Engineer
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
  timestamp: number;
  isMock?: boolean;
}

export interface AntiCheatSignals {
  visitorId?: string;
  webglRenderer?: string;
  motionDetected?: boolean;
  ipCity?: string;
  ipLocation?: { latitude: number; longitude: number };
  sampleCount: number;
  isStaticGPS: boolean;
  isEmulator: boolean;
  isDesktop: boolean;
}

// Configuration Constants
// Web browsers handle GPS wake-up internally; 3s warmup is only needed for Capacitor native.
const WARMUP_DELAY = Capacitor.getPlatform() === 'web' ? 500 : 3000;
const SAMPLE_INTERVAL = 1000; // 1 second between samples
const MAX_SAMPLES = 5;
const MIN_SAMPLES = 3;
const MAX_ACCURACY_GATE = 150; // Hard rejection if > 150m (relaxed for indoor/city)
const IP_VALIDATION_THRESHOLD = 50000; // 50km
const IS_DEV = import.meta.env.DEV;

/**
 * STEP 1 — Permission Validation
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  // Web browser handles its own permission prompt via navigator.geolocation
  if (Capacitor.getPlatform() === 'web') return true;

  try {
    let status = await Geolocation.checkPermissions();
    const locStatus = status?.location;
    
    if (IS_DEV) console.log('[Auth] Permission check status:', locStatus);
    
    // If explicitly denied, we can't do much
    if (locStatus === 'denied') return false;
    
    // If granted, we're good
    if (locStatus === 'granted') return true;

    // If prompt, try to request (Native platforms)
    if (locStatus === 'prompt' || locStatus === 'prompt-with-rationale' || !locStatus) {
      status = await Geolocation.requestPermissions();
      return status?.location === 'granted' || status?.location === 'prompt'; 
    }
    
    return true; 
  } catch (err) {
    console.error('[Auth] Permission check/request failed:', err);
    return true; 
  }
};

/**
 * Main Stabilized Geolocation Pipeline
 * Covers STEP 2 through STEP 6
 */
export const getStabilizedPosition = async (): Promise<{
  position: GeolocationPosition;
  isStatic: boolean;
  samplesCollected: number;
}> => {
  // STEP 2 — GPS Warm-Up Phase
  if (IS_DEV) console.log('[GPS] Starting warm-up phase...');
  try {
    // Initial call to wake up GPS hardware
    await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, WARMUP_DELAY));
    if (IS_DEV) console.log('[GPS] Warm-up complete. Ignore first reading.');
  } catch (err) {
    if (IS_DEV) console.warn('[GPS] Warm-up failed (common indoors):', err);
  }

  // STEP 3 — Multi-Sample Stabilization
  return new Promise((resolve, reject) => {
    const validSamples: GeolocationPosition[] = [];
    let watchId: string | null = null;
    let sampleTimer: NodeJS.Timeout | null = null;
    let totalAttempts = 0;

    const cleanup = () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
      if (sampleTimer) clearInterval(sampleTimer);
    };

    const startWatching = async () => {
      // PRIVACY NOTE: GPS is ONLY collected while the attendance scanner modal is open.
      // watchPosition is cleared in stopCamera() which is called on modal close.
      // No background location tracking occurs. This is by design.
      watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        (position, err) => {
          if (err || !position) return;

          const current: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Filter: Discard if accuracy > 200m
          if (current.accuracy > 200) {
            if (IS_DEV) console.log(`[GPS] Discarding poor sample: ${current.accuracy.toFixed(1)}m`);
            return;
          }

          validSamples.push(current);
          if (IS_DEV) console.log(`[GPS] Sample ${validSamples.length}: ±${current.accuracy.toFixed(1)}m`);

          if (validSamples.length >= MAX_SAMPLES) {
            processResults();
          }
        }
      );
    };

    const processResults = () => {
      cleanup();

      if (validSamples.length < MIN_SAMPLES) {
        reject(new Error("We couldn't confirm your location. Please ensure you're at the venue and try again."));
        return;
      }

      // STEP 4 — Jitter Smoothing (Averaging)
      const avgLat = validSamples.reduce((s, p) => s + p.latitude, 0) / validSamples.length;
      const avgLng = validSamples.reduce((s, p) => s + p.longitude, 0) / validSamples.length;
      const avgAcc = validSamples.reduce((s, p) => s + p.accuracy, 0) / validSamples.length;

      const stabilized: GeolocationPosition = {
        ...validSamples[validSamples.length - 1],
        latitude: avgLat,
        longitude: avgLng,
        accuracy: avgAcc,
      };

      if (IS_DEV) {
        console.log('[GPS] Stabilized Position:', { lat: avgLat, lng: avgLng, acc: avgAcc });
      }

      // STEP 5 — Hard Accuracy Gate
      if (avgAcc > MAX_ACCURACY_GATE) {
        reject(new Error("Your location signal is not precise enough to verify your presence at the venue. Please move closer to the center of the hall."));
        return;
      }

      // STEP 6 — Static GPS Detection
      // Check if coordinates changed at all across samples (variance check)
      const first = validSamples[0];
      const isStatic = validSamples.every(
        (s) => s.latitude === first.latitude && s.longitude === first.longitude
      );

      if (isStatic) {
        if (IS_DEV) console.warn('[Anti-Cheat] STATIC GPS SIGNAL DETECTED');
        resolve({
          position: stabilized,
          isStatic: true,
          samplesCollected: validSamples.length,
        });
        return;
      }

      resolve({
        position: stabilized,
        isStatic: false,
        samplesCollected: validSamples.length,
      });
    };

    // Safety timeout after 25 seconds
    setTimeout(() => {
      if (validSamples.length >= MIN_SAMPLES) {
        processResults();
      } else {
        cleanup();
        reject(new Error("Check-in failed. We couldn't verify that you're in the lecture hall."));
      }
    }, 25000);

    startWatching();
  });
};

/**
 * Basic High-Accuracy Position (for Map UI)
 */
export const getCurrentPosition = async (timeout: number = 10000): Promise<GeolocationPosition> => {
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout,
    maximumAge: 0
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp
  };
};

/**
 * STEP 7 — Motion Verification
 */
export const detectMotion = async (durationMs: number = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    let moved = false;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      if (acc && (Math.abs(acc.x || 0) > 0.05 || Math.abs(acc.y || 0) > 0.05 || Math.abs(acc.z || 0) > 0.05)) {
        moved = true;
      }
    };

    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
      setTimeout(() => {
        window.removeEventListener('devicemotion', handleMotion);
        if (IS_DEV) console.log(`[Anti-Cheat] Motion detected: ${moved}`);
        resolve(moved);
      }, durationMs);
    } else {
      if (IS_DEV) console.warn('[Anti-Cheat] DeviceMotionEvent NOT supported');
      resolve(false);
    }
  });
};

/**
 * STEP 8 — IP Location Validation
 */
export const getIPLocation = async (): Promise<{ latitude: number; longitude: number; city: string } | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || 'Unknown'
      };
    }
    return null;
  } catch (e) {
    if (IS_DEV) console.error('[Anti-Cheat] IP Geolocation failed:', e);
    return null;
  }
};

/**
 * STEP 9 — Device Fingerprinting
 */
export const getVisitorId = async (): Promise<string | null> => {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (e) {
    return null;
  }
};

/**
 * STEP 10 — Device Environment Detection (WebGL + UserAgent)
 */
export const getDeviceEnvironment = (): { renderer: string; isEmulator: boolean; isDesktop: boolean } => {
  let renderer = 'Unknown';
  let isEmulator = false;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) { }

  // Detector logic for emulators and desktop
  const ua = navigator.userAgent.toLowerCase();
  const isDesktop = !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

  if (
    renderer.includes('SwiftShader') ||
    renderer.includes('ANGLE') ||
    renderer.includes('VirtualBox') ||
    renderer.includes('VMware')
  ) {
    isEmulator = true;
  }

  if (IS_DEV) console.log('[Anti-Cheat] HW Renderer:', renderer);
  return { renderer, isEmulator, isDesktop };
};

/**
 * FINAL PIPELINE ASSEMBLY (STEP 12)
 */
export const getAttendancePayload = async (): Promise<any> => {
  // Step 1: Permission Check
  if (!(await checkLocationPermission())) {
    throw new Error('Location permission denied. Please allow access to mark attendance.');
  }

  // Step 2-6: Stabilized Coordinates
  const { position, isStatic, samplesCollected } = await getStabilizedPosition();

  // Step 7: Motion
  const motionDetected = await detectMotion(3000);

  // Step 8: IP Cross-check
  const ipLoc = await getIPLocation();
  let ipDistance = 0;
  if (ipLoc) {
    ipDistance = haversineDistance(position.latitude, position.longitude, ipLoc.latitude, ipLoc.longitude);
    if (IS_DEV) console.log(`[Anti-Cheat] IP vs GPS Distance: ${ipDistance.toFixed(0)}m`);
  }

  // Step 9-10 & 14: HW detection
  const visitorId = await getVisitorId();
  const { renderer, isEmulator, isDesktop } = getDeviceEnvironment();

  // Step 14 - Laptop / Desktop / Emulator Detection
  if (isEmulator) {
    throw new Error('EMULATOR_DETECTED; Attendance must be marked using a physical mobile device.');
  }

  // Desktop users are flagged but not blocked — backend scoring handles the penalty
  const desktopPenalty = isDesktop && !motionDetected;
  if (IS_DEV && desktopPenalty) console.warn('[Anti-Cheat] Desktop user with no motion detected — flagged but allowed');

  // Final Payload Construction (Step 12)
  return {
    latitude: position.latitude,
    longitude: position.longitude,
    accuracy: position.accuracy,
    timestamp: position.timestamp,
    visitorId,
    webglRenderer: renderer,
    ipLocation: ipLoc ? { latitude: ipLoc.latitude, longitude: ipLoc.longitude } : undefined,
    ipCity: ipLoc?.city,
    motionDetected,
    sampleCount: samplesCollected,
    isStaticGPS: isStatic,
    isDesktop,
    ipDistance,
    // Indicators for backend scoring
    flags: {
      poorIPMatch: ipDistance > IP_VALIDATION_THRESHOLD,
      noMotion: !motionDetected,
      staticGPS: isStatic,
      desktopUser: isDesktop
    }
  };
};

/**
 * Export helpers for UI (Step 11 & Distance formatting)
 */
export const geolocationService = {
  getCurrentPosition,
  getAttendancePayload,
  formatDistance: (distanceMetres: number): string => {
    if (!Number.isFinite(distanceMetres)) return '–';
    if (distanceMetres < 1000) return `${Math.round(distanceMetres)} m`;
    return `${(distanceMetres / 1000).toFixed(2)} km`;
  },
  haversineDistance
};
