/**
 * Web Vitals monitoring for performance tracking
 * Tracks Core Web Vitals: LCP, FID, CLS, FCP, TTFB
 */

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance thresholds based on Google's recommendations
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // In production, send to your analytics service
  if (import.meta.env.DEV) {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }
  
  // Example: Send to Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.value),
  //     metric_rating: metric.rating,
  //     metric_id: metric.id,
  //     metric_delta: Math.round(metric.delta),
  //   });
  // }
}

export function reportWebVitals(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Use web-vitals library if available
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => {
        const vitalsMetric: WebVitalsMetric = {
          name: 'CLS',
          value: metric.value,
          rating: getRating('CLS', metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        onPerfEntry(vitalsMetric);
        sendToAnalytics(vitalsMetric);
      });
      
      onFID((metric) => {
        const vitalsMetric: WebVitalsMetric = {
          name: 'FID',
          value: metric.value,
          rating: getRating('FID', metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        onPerfEntry(vitalsMetric);
        sendToAnalytics(vitalsMetric);
      });
      
      onFCP((metric) => {
        const vitalsMetric: WebVitalsMetric = {
          name: 'FCP',
          value: metric.value,
          rating: getRating('FCP', metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        onPerfEntry(vitalsMetric);
        sendToAnalytics(vitalsMetric);
      });
      
      onLCP((metric) => {
        const vitalsMetric: WebVitalsMetric = {
          name: 'LCP',
          value: metric.value,
          rating: getRating('LCP', metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        onPerfEntry(vitalsMetric);
        sendToAnalytics(vitalsMetric);
      });
      
      onTTFB((metric) => {
        const vitalsMetric: WebVitalsMetric = {
          name: 'TTFB',
          value: metric.value,
          rating: getRating('TTFB', metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        onPerfEntry(vitalsMetric);
        sendToAnalytics(vitalsMetric);
      });
    }).catch(err => {
      console.warn('Web Vitals library not available:', err);
    });
  }
}
