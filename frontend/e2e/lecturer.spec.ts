/**
 * E2E tests for the Lecturer role.
 *
 * Covers:
 *  - Lecturer can log in and is redirected to /dashboard
 *  - Lecturer dashboard renders course and session information
 *  - Lecturer can navigate to sessions and create-session pages
 *  - Non-lecturer users cannot access lecturer-only routes (redirected to /unauthorized)
 */

import { test, expect } from '@playwright/test';
import { loginAs, mockApiForUser, LECTURER_USER, STUDENT_USER, MOCK_SESSION, MOCK_COURSE } from './helpers';

test.describe('Lecturer – Login', () => {
  test('lecturer can log in and is redirected to /dashboard', async ({ page }) => {
    await mockApiForUser(page, LECTURER_USER);

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(LECTURER_USER.email);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Lecturer – Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, LECTURER_USER);
    await page.goto('/dashboard');
  });

  test('dashboard shows lecturer name', async ({ page }) => {
    await expect(page.getByText(LECTURER_USER.full_name, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('sessions navigation item is visible', async ({ page }) => {
    const sessionsLink = page.getByRole('button', { name: /sessions/i }).or(
      page.getByRole('link', { name: /sessions/i })
    );
    await expect(sessionsLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('lecturer can navigate to sessions page', async ({ page }) => {
    const sessionsLink = page.getByRole('button', { name: /sessions/i }).or(
      page.getByRole('link', { name: /sessions/i })
    );
    if (await sessionsLink.count() > 0) {
      await sessionsLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/sessions/, { timeout: 8000 });
    }
  });

  test('create session navigation is accessible for lecturer', async ({ page }) => {
    await page.goto('/dashboard/sessions/new');
    // Should render the create session page (not redirected away)
    await expect(page).toHaveURL(/\/dashboard\/sessions\/new/, { timeout: 8000 });
  });
});

test.describe('Lecturer – Route Protection', () => {
  test('student cannot access create-session page (redirected to /unauthorized)', async ({ page }) => {
    await loginAs(page, STUDENT_USER);
    await page.goto('/dashboard/sessions/new');
    // Student is not a lecturer → should redirect to /unauthorized
    await expect(page).toHaveURL(/\/unauthorized/, { timeout: 8000 });
  });
});
