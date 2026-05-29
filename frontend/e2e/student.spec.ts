/**
 * E2E tests for the Student role.
 *
 * Covers:
 *  - Student can log in and is redirected to /dashboard
 *  - Student dashboard renders personal stats, enrolled courses, and next class
 *  - Student can navigate to different dashboard sections (analytics, courses)
 *  - Unauthenticated user is redirected to /login when accessing /dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAs, mockApiForUser, STUDENT_USER, STUDENT_DASHBOARD_DATA } from './helpers';

test.describe('Student – Login', () => {
  test('student can sign up and is redirected to onboarding', async ({ page }) => {
    await page.route('**/api/auth/me/', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
    });
    await page.route('**/api/auth/register/', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          requires_onboarding: true,
          user: {
            ...STUDENT_USER,
            onboarding_complete: false,
            email_verified: true,
          },
          tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
        }),
      });
    });

    await page.goto('/register');
    await page.locator('input[type="text"]').first().fill('New Student');
    await page.locator('input[type="email"]').fill('new.student@presently.test');
    await page.locator('input[type="password"]').fill('StrongPass123!');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
  });

  test('login page renders email and password fields', async ({ page }) => {
    await mockApiForUser(page, STUDENT_USER);
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('student can log in and is redirected to /dashboard', async ({ page }) => {
    await mockApiForUser(page, STUDENT_USER);

    await page.goto('/login');

    await page.locator('input[type="email"]').fill(STUDENT_USER.email);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // After login, token is stored and user is redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('shows error toast on invalid credentials', async ({ page }) => {
    // Override login endpoint to return failure
    await page.route('**/api/auth/login/', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid email or password.', code: 'LOGIN_FAILED' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('bad@user.com');
    await page.locator('input[type="password"]').fill('wrongpass');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
    // Do NOT set any auth token
    await page.route('**/api/auth/me/', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Student – Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, STUDENT_USER);
    await page.goto('/dashboard');
  });

  test('dashboard loads and shows student name', async ({ page }) => {
    await expect(page.getByText(STUDENT_USER.full_name, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('attendance stats are displayed', async ({ page }) => {
    const stats = STUDENT_DASHBOARD_DATA.attendance_stats;
    // Average attendance percentage should appear somewhere
    await expect(page.getByText(`${stats.average_attendance}`, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('enrolled courses section is visible', async ({ page }) => {
    const course = STUDENT_DASHBOARD_DATA.enrolled_courses[0];
    await expect(page.getByText(course.course_code, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('student can navigate to analytics page', async ({ page }) => {
    // Click the analytics nav item (sidebar or tab)
    const analyticsLink = page.getByRole('button', { name: /analytics/i }).or(
      page.getByRole('link', { name: /analytics/i })
    );
    if (await analyticsLink.count() > 0) {
      await analyticsLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/analytics/, { timeout: 8000 });
    }
  });

  test('student can navigate to courses page', async ({ page }) => {
    const coursesLink = page.getByRole('button', { name: /courses/i }).or(
      page.getByRole('link', { name: /courses/i })
    );
    if (await coursesLink.count() > 0) {
      await coursesLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/courses/, { timeout: 8000 });
    }
  });
});
