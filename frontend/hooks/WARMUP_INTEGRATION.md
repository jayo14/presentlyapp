/**
 * Warm-Up Integration Example
 *
 * This file demonstrates how to integrate the useWarmUp hook into your application.
 * Place this in your root App component or main layout to start the background warm-up loop.
 */

import { useWarmUp } from '@/hooks/useWarmUp';

/**
 * Example 1: Basic integration in your App component
 *
 * Add this to your main App.tsx or root layout:
 */
export function AppWithWarmUp() {
  // Start the warm-up loop immediately when app mounts
  useWarmUp(
    'https://presentlyapp.onrender.com/health',
    4 * 60 * 1000, // 4 minute interval
    30 * 1000 // 30 second external ping threshold
  );

  // Rest of your app components...
  return <div>{/* Your app content */}</div>;
}

/**
 * Example 2: Integration with conditional logic
 *
 * Only enable warm-up when user is authenticated:
 */
import { useAuth } from '@/hooks/useAuth';

export function AppWithConditionalWarmUp() {
  const { user } = useAuth();

  // Only keep the API warm when user is authenticated
  // The hook will still manage page visibility and backoff internally
  if (user) {
    useWarmUp('https://presentlyapp.onrender.com/health');
  }

  return <div>{/* Your app content */}</div>;
}

/**
 * Example 3: Custom configuration for different environments
 */
const getWarmUpConfig = () => {
  const isProd = import.meta.env.PROD;

  return {
    apiUrl: 'https://presentlyapp.onrender.com/health',
    // Longer interval in production to reduce load
    initialInterval: isProd ? 5 * 60 * 1000 : 4 * 60 * 1000,
    // More lenient threshold in production
    externalPingThreshold: isProd ? 60 * 1000 : 30 * 1000,
  };
};

export function AppWithDynamicConfig() {
  const config = getWarmUpConfig();

  useWarmUp(config.apiUrl, config.initialInterval, config.externalPingThreshold);

  return <div>{/* Your app content */}</div>;
}

/**
 * INTEGRATION STEPS:
 *
 * 1. Pick your integration approach from the examples above
 *
 * 2. Add useWarmUp to your main App component or root layout:
 *    ```tsx
 *    import { useWarmUp } from '@/hooks/useWarmUp';
 *
 *    export default function App() {
 *      useWarmUp('https://presentlyapp.onrender.com/health');
 *
 *      return (
 *        <Router>
 *          {/* Your routing and components */}
 *        </Router>
 *      );
 *    }
 *    ```
 *
 * 3. Open your browser's DevTools and check the Console:
 *    - You should see "[WarmUp 2026-03-25T...] Warm-up hook initialized" messages
 *    - Every 4 minutes you'll see "[WarmUp ...] Ping successful" logs
 *    - Switching tabs will show visibility change messages
 *
 * 4. Monitor the logs to verify:
 *    - Pings are happening every ~4 minutes
 *    - External pings are being detected (if your API returns last_pinged)
 *    - Page visibility pauses are working correctly
 *    - No redundant pings occur when external service is active
 */

/**
 * MONITORING THE WARM-UP IN PRODUCTION:
 *
 * The hook logs ONLY in development mode. For production monitoring:
 *
 * 1. Check Render's actual API logs:
 *    - Navigate to your Render service dashboard
 *    - View the Logs tab to see all health check requests
 *
 * 2. Set up alerts on Render:
 *    - If you see >1 health checks per 4 minutes, you're duplicating effort
 *    - If you see no health checks in a 5-minute window, the warm-up may have stopped
 *
 * 3. Verify the API response includes last_pinged timestamp:
 *    - Test with: curl -I https://presentlyapp.onrender.com/health
 *    - Should see response headers with timing information
 */

/**
 * PERFORMANCE CHARACTERISTICS:
 *
 * - Memory: ~5KB per active hook (one refs object + one timeout)
 * - Network: 1 small GET request every 4 minutes when tab is visible
 * - CPU: Negligible (just scheduling and simple async operations)
 * - Page Visibility: Fully respects tab focus changes
 *
 * ESTIMATED COST ON RENDER FREE TIER:
 * - At 4-minute intervals with 5 concurrent users: ~450 requests/day
 * - This is well below rate limits and helps keep the dyno warm
 * - Combined with external ping, total is still minimal
 */
