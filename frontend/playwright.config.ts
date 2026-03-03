import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Presently E2E tests.
 *
 * The tests mock the backend API using Playwright route interception so they
 * can run without a live backend.  All routes under /api/** are intercepted
 * and stub responses are returned.
 *
 * To run against a real backend, remove the `use.baseURL` setting and set the
 * PLAYWRIGHT_BASE_URL env variable to the backend URL.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Run local dev server before tests if not running against a real backend
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
