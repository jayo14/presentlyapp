/**
 * Warm-Up Monitoring & Debugging Utilities
 *
 * Optional utilities for monitoring, debugging, and manually controlling
 * the background warm-up service in development environments.
 *
 * Usage:
 *   import { createWarmUpMonitor } from '@/utils/warmup-monitor';
 *   const monitor = createWarmUpMonitor();
 *   monitor.getStatus();
 */

interface MonitorStatus {
  isActive: boolean;
  lastPingTime: Date | null;
  lastSuccessfulPingTime: Date | null;
  failureCount: number;
  nextRetryDelayMs: number;
  timeSinceLastSuccessfulPing: number | null; // milliseconds
}

/**
 * Creates a monitoring interface for the warm-up service
 * Allows you to inspect warm-up state and trigger manual actions
 */
export class WarmUpMonitor {
  private metrics = {
    totalPingsAttempted: 0,
    totalPingsSuccessful: 0,
    totalPingsFailed: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[],
  };

  /**
   * Record successful ping and calculate metrics
   */
  recordSuccess(responseTimeMs: number): void {
    this.metrics.totalPingsSuccessful += 1;
    this.metrics.responseTimes.push(responseTimeMs);

    // Keep only last 50 response times for average
    if (this.metrics.responseTimes.length > 50) {
      this.metrics.responseTimes.shift();
    }

    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageResponseTime = sum / this.metrics.responseTimes.length;
  }

  /**
   * Record failed ping
   */
  recordFailure(): void {
    this.metrics.totalPingsFailed += 1;
  }

  /**
   * Get formatted metrics for console logging
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalPingsAttempted > 0
        ? ((this.metrics.totalPingsSuccessful / this.metrics.totalPingsAttempted) * 100).toFixed(1) + '%'
        : 'N/A',
      averageResponseTime: this.metrics.averageResponseTime.toFixed(0) + 'ms',
    };
  }

  /**
   * Print a formatted status report
   */
  printReport(): void {
    console.table({
      'Total Pings Attempted': this.metrics.totalPingsAttempted,
      'Successful Pings': this.metrics.totalPingsSuccessful,
      'Failed Pings': this.metrics.totalPingsFailed,
      'Success Rate': this.metrics.totalPingsAttempted > 0
        ? ((this.metrics.totalPingsSuccessful / this.metrics.totalPingsAttempted) * 100).toFixed(1) + '%'
        : 'N/A',
      'Average Response Time': this.metrics.averageResponseTime.toFixed(0) + 'ms',
    });
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      totalPingsAttempted: 0,
      totalPingsSuccessful: 0,
      totalPingsFailed: 0,
      averageResponseTime: 0,
      responseTimes: [],
    };
  }
}

/**
 * Global instance for development
 */
let monitorInstance: WarmUpMonitor | null = null;

/**
 * Get or create the global warm-up monitor instance
 */
export function createWarmUpMonitor(): WarmUpMonitor {
  if (!monitorInstance) {
    monitorInstance = new WarmUpMonitor();
    // Expose to window in development for easy console access
    if (import.meta.env.MODE === 'development') {
      (window as any).__warmUpMonitor = monitorInstance;
      console.log(
        '[WarmUp] Monitor available as window.__warmUpMonitor. Call printReport() to see status.'
      );
    }
  }
  return monitorInstance;
}

/**
 * Development-only helper: Create a test function for manual warm-up triggering
 *
 * Usage in console:
 *   await window.__testWarmUp('https://presentlyapp.onrender.com/health')
 */
export async function createTestWarmUpFunction() {
  if (import.meta.env.MODE !== 'development') {
    console.warn('[WarmUp] Test function only available in development mode');
    return;
  }

  (window as any).__testWarmUp = async (url: string) => {
    try {
      console.log(`[WarmUp Test] Fetching ${url}...`);
      const start = performance.now();
      const response = await fetch(url, {
        cache: 'no-store',
      });
      const end = performance.now();

      const data = await response.json();
      const responseTime = end - start;

      console.log(`[WarmUp Test] Success! Response time: ${responseTime.toFixed(0)}ms`, data);

      createWarmUpMonitor().recordSuccess(responseTime);
      return { success: true, data, responseTime };
    } catch (error) {
      console.error('[WarmUp Test] Failed!', error);
      createWarmUpMonitor().recordFailure();
      throw error;
    }
  };

  console.log('[WarmUp] Test function available as window.__testWarmUp(url)');
}

/**
 * Print a visual timeline of warm-up events (for detailed debugging)
 *
 * Usage:
 *   import { createWarmUpTimeline } from '@/utils/warmup-monitor';
 */
export class WarmUpTimeline {
  private events: Array<{ timestamp: Date; message: string; data?: any }> = [];

  addEvent(message: string, data?: any): void {
    this.events.push({
      timestamp: new Date(),
      message,
      data,
    });
  }

  /**
   * Print timeline as formatted table
   */
  print(): void {
    const formatted = this.events.map((event, index) => ({
      '#': index + 1,
      'Time': event.timestamp.toLocaleTimeString(),
      'Event': event.message,
      'Details': event.data ? JSON.stringify(event.data) : '-',
    }));

    console.table(formatted);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get events as array
   */
  getEvents() {
    return [...this.events];
  }
}

/**
 * Global timeline instance
 */
let timelineInstance: WarmUpTimeline | null = null;

export function createWarmUpTimeline(): WarmUpTimeline {
  if (!timelineInstance) {
    timelineInstance = new WarmUpTimeline();
    if (import.meta.env.MODE === 'development') {
      (window as any).__warmUpTimeline = timelineInstance;
    }
  }
  return timelineInstance;
}

/**
 * DEVELOPMENT CONSOLE HELPERS:
 *
 * Once the app loads, you can use these in the browser console:
 *
 * 1. Check warm-up status:
 *    window.__warmUpMonitor.printReport()
 *
 * 2. Get detailed metrics:
 *    window.__warmUpMonitor.getMetrics()
 *
 * 3. Manually test a warm-up ping:
 *    await window.__testWarmUp('https://presentlyapp.onrender.com/health')
 *
 * 4. View warm-up timeline:
 *    window.__warmUpTimeline.print()
 *
 * 5. Reset metrics:
 *    window.__warmUpMonitor.reset()
 */
