import { useEffect, useRef, useCallback } from 'react';

/**
 * Warm-Up state tracking for coordinating pings with external uptime service
 */
interface WarmUpState {
  lastPingTimestamp: number | null;
  lastSuccessfulPingTimestamp: number | null;
  isActive: boolean;
  failureCount: number;
  nextRetryDelay: number; // in milliseconds
}

/**
 * Health endpoint response structure
 */
interface HealthResponse {
  status: string;
  timestamp?: number;
  last_pinged?: number;
  [key: string]: any;
}

/**
 * Senior-level React hook for managing background API warm-up pings
 * Coordinates with external uptime services to prevent redundant pings
 * and optimizes for efficiency using the Page Visibility API.
 *
 * @param apiUrl - The health endpoint URL (e.g., 'https://presentlyapp.onrender.com/health')
 * @param initialInterval - Initial ping interval in milliseconds (default: 4 minutes)
 * @param externalPingThreshold - Time window to consider external ping overlap (default: 30 seconds)
 *
 * @example
 * useWarmUp('https://presentlyapp.onrender.com/health', 4 * 60 * 1000);
 */
export const useWarmUp = (
  apiUrl: string,
  initialInterval: number = 4 * 60 * 1000, // 4 minutes
  externalPingThreshold: number = 30 * 1000 // 30 seconds
): void => {
  const isDevelopment = import.meta.env.MODE === 'development';

  // Use refs for mutable state that shouldn't trigger re-renders
  const stateRef = useRef<WarmUpState>({
    lastPingTimestamp: null,
    lastSuccessfulPingTimestamp: null,
    isActive: true,
    failureCount: 0,
    nextRetryDelay: 30 * 1000, // Start with 30 second backoff
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Calculate exponential backoff delay
   * Prevents spamming server: 30s → 1m → 2m
   */
  const calculateBackoffDelay = useCallback((failureCount: number): number => {
    const baseDelay = 30 * 1000; // 30 seconds
    const maxDelay = 2 * 60 * 1000; // 2 minutes
    const delay = baseDelay * Math.pow(2, failureCount);
    return Math.min(delay, maxDelay);
  }, []);

  /**
   * Log warm-up events (development mode only)
   */
  const logWarmUp = useCallback(
    (message: string, data?: Record<string, any>) => {
      if (isDevelopment) {
        const timestamp = new Date().toISOString();
        console.log(
          `[WarmUp ${timestamp}] ${message}`,
          data ? JSON.stringify(data, null, 2) : ''
        );
      }
    },
    [isDevelopment]
  );

  /**
   * Calculate next ping interval based on external ping awareness
   * If external service recently pinged, increase interval to avoid redundancy
   */
  const calculateNextInterval = useCallback(
    (lastExternalPing?: number): number => {
      if (!lastExternalPing) {
        return initialInterval;
      }

      const timeSinceExternalPing = Date.now() - lastExternalPing;

      // If external ping just happened, wait longer
      if (timeSinceExternalPing < externalPingThreshold) {
        const delayedInterval = initialInterval + (externalPingThreshold - timeSinceExternalPing);
        logWarmUp('External ping detected, delaying next interval', {
          delayedInterval: `${Math.round(delayedInterval / 1000)}s`,
          externalPingAge: `${Math.round(timeSinceExternalPing / 1000)}s`,
        });
        return delayedInterval;
      }

      return initialInterval;
    },
    [initialInterval, externalPingThreshold, logWarmUp]
  );

  /**
   * Reset failure count and schedule next ping
   */
  const scheduleNextPing = useCallback(
    (interval: number) => {
      const state = stateRef.current;
      state.failureCount = 0;
      state.nextRetryDelay = 30 * 1000; // Reset to initial backoff

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        performPing();
      }, interval);

      logWarmUp('Next ping scheduled', { interval: `${Math.round(interval / 1000)}s` });
    },
    [logWarmUp]
  );

  /**
   * Perform the actual API ping with error handling
   */
  const performPing = useCallback(async (): Promise<void> => {
    const state = stateRef.current;

    // Skip if page is hidden
    if (document.hidden) {
      logWarmUp('Tab hidden, skipping ping');
      scheduleNextPing(initialInterval);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    state.lastPingTimestamp = Date.now();

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        // Don't cache health check responses
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }

      const data: HealthResponse = await response.json();
      state.lastSuccessfulPingTimestamp = Date.now();

      // Extract external ping timestamp from response
      const lastExternalPing = data.last_pinged ? data.last_pinged * 1000 : undefined;

      logWarmUp('Ping successful', {
        status: data.status,
        timeSinceLastSuccess: state.lastSuccessfulPingTimestamp
          ? `${Math.round((state.lastSuccessfulPingTimestamp - state.lastPingTimestamp!) / 1000)}s`
          : 'first ping',
        externalPingTimestamp: lastExternalPing
          ? new Date(lastExternalPing).toISOString()
          : 'not provided',
      });

      // Calculate next interval considering external ping
      const nextInterval = calculateNextInterval(lastExternalPing);
      scheduleNextPing(nextInterval);
    } catch (error) {
      // Don't log abort errors (user switched tabs or we're cleaning up)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      state.failureCount += 1;
      const backoffDelay = calculateBackoffDelay(state.failureCount);
      state.nextRetryDelay = backoffDelay;

      logWarmUp('Ping failed, applying exponential backoff', {
        error: error instanceof Error ? error.message : String(error),
        failureCount: state.failureCount,
        nextRetryDelay: `${Math.round(backoffDelay / 1000)}s`,
      });

      // Retry with exponential backoff
      scheduleNextPing(backoffDelay);
    }
  }, [apiUrl, initialInterval, calculateNextInterval, scheduleNextPing, logWarmUp]);

  /**
   * Handle page visibility changes
   * Pause when tab is hidden, refresh if > 10 minutes since last successful ping
   */
  const handleVisibilityChange = useCallback(() => {
    const state = stateRef.current;

    if (document.hidden) {
      logWarmUp('Page hidden, pausing warm-up');
      state.isActive = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      logWarmUp('Page visible, resuming warm-up');
      state.isActive = true;

      // If more than 10 minutes since last successful ping, do immediate refresh
      const timeSinceLastSuccess = state.lastSuccessfulPingTimestamp
        ? Date.now() - state.lastSuccessfulPingTimestamp
        : Infinity;

      if (timeSinceLastSuccess > 10 * 60 * 1000) {
        logWarmUp('More than 10 minutes since last successful ping, triggering refresh', {
          timeSinceLastSuccess: `${Math.round(timeSinceLastSuccess / 1000)}s`,
        });
        performPing();
      } else {
        // Resume normal schedule
        scheduleNextPing(initialInterval);
      }
    }
  }, [initialInterval, performPing, scheduleNextPing, logWarmUp]);

  /**
   * Initialize hook and set up event listeners
   */
  useEffect(() => {
    const state = stateRef.current;
    state.isActive = true;

    logWarmUp('Warm-up hook initialized', {
      apiUrl,
      initialInterval: `${Math.round(initialInterval / 1000)}s`,
      externalPingThreshold: `${Math.round(externalPingThreshold / 1000)}s`,
    });

    // Perform first ping immediately
    performPing();

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      logWarmUp('Warm-up hook unmounted');
    };
  }, [apiUrl, initialInterval, externalPingThreshold, performPing, handleVisibilityChange, logWarmUp]);

  // Note: We intentionally don't return anything because this is a fire-and-forget effect hook
  return undefined;
};

export default useWarmUp;
