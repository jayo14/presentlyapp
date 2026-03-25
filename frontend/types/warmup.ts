/**
 * TypeScript Type Definitions for Warm-Up Service
 * Import these types for type-safe development and integrations
 */

/**
 * Response structure expected from the /health endpoint
 */
export interface HealthCheckResponse {
  /** Overall health status of the API */
  status: 'healthy' | 'degraded' | 'unhealthy' | string;

  /** Current server timestamp (Unix seconds) */
  timestamp?: number;

  /** Last externally-initiated ping timestamp (Unix seconds)
   * Used by the hook to coordinate with external uptime services
   */
  last_pinged?: number;

  /** API version (optional for tracking) */
  version?: string;

  /** Additional diagnostics (optional) */
  database?: boolean;
  cache?: boolean;
  queue?: boolean;

  /** Response time in milliseconds (optional) */
  response_time_ms?: number;

  /** Any additional metadata */
  [key: string]: any;
}

/**
 * Configuration options for the useWarmUp hook
 */
export interface WarmUpConfig {
  /** URL to the health check endpoint */
  apiUrl: string;

  /** Ping interval in milliseconds (default: 4 minutes) */
  initialInterval?: number;

  /** External ping threshold in milliseconds (default: 30 seconds)
   * If external service pinged within this window, hook delays next ping
   */
  externalPingThreshold?: number;
}

/**
 * Internal state of the warm-up hook
 * Exposed for advanced monitoring and debugging
 */
export interface WarmUpState {
  /** Timestamp of the most recent ping attempt */
  lastPingTimestamp: number | null;

  /** Timestamp of the most recent successful ping */
  lastSuccessfulPingTimestamp: number | null;

  /** Whether the warm-up is currently active */
  isActive: boolean;

  /** Number of consecutive failed pings */
  failureCount: number;

  /** Current retry delay in milliseconds (increases on failure) */
  nextRetryDelay: number;
}

/**
 * Status information for warm-up monitoring
 */
export interface WarmUpStatus {
  /** Whether warm-up is currently running */
  isActive: boolean;

  /** Time since last successful ping (milliseconds) */
  timeSinceLastSuccess: number | null;

  /** Number of failed pings in current backoff period */
  failureCount: number;

  /** Current retry delay (milliseconds) */
  nextRetryDelay: number;

  /** Success metrics */
  metrics?: {
    totalPings: number;
    successfulPings: number;
    failedPings: number;
    successRate: number;
    averageResponseTime: number;
  };
}

/**
 * Monitoring interface for warm-up service
 * Use for debugging and status tracking
 */
export interface IWarmUpMonitor {
  /** Record a successful ping with response time */
  recordSuccess(responseTimeMs: number): void;

  /** Record a failed ping */
  recordFailure(): void;

  /** Get current metrics */
  getMetrics(): Record<string, any>;

  /** Print formatted status report to console */
  printReport(): void;

  /** Reset all metrics */
  reset(): void;
}

/**
 * Timeline event for detailed debugging
 */
export interface WarmUpTimelineEvent {
  /** When the event occurred */
  timestamp: Date;

  /** Description of the event */
  message: string;

  /** Optional associated data */
  data?: Record<string, any>;
}

/**
 * Timeline interface for tracking events
 */
export interface IWarmUpTimeline {
  /** Add an event to the timeline */
  addEvent(message: string, data?: Record<string, any>): void;

  /** Print timeline as formatted table */
  print(): void;

  /** Clear all events */
  clear(): void;

  /** Get all events */
  getEvents(): WarmUpTimelineEvent[];
}

/**
 * Response from manual warm-up test
 */
export interface WarmUpTestResult {
  success: boolean;
  data?: HealthCheckResponse;
  responseTime?: number;
  error?: Error;
}

/**
 * Window augmentation for development helpers
 * Add this to your global types if needed
 */
declare global {
  interface Window {
    /** Development monitor for warm-up service */
    __warmUpMonitor?: IWarmUpMonitor;

    /** Development timeline for warm-up events */
    __warmUpTimeline?: IWarmUpTimeline;

    /** Manual test function for warm-up pings */
    __testWarmUp?: (url: string) => Promise<WarmUpTestResult>;
  }
}

/**
 * Export an empty object to make this a module
 */
export {};
