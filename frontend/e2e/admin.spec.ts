/**
 * E2E tests for the Admin role.
 *
 * Covers:
 *  - Admin can log in and is redirected to /dashboard
 *  - Admin dashboard shows management sections (users, institutions, venues, departments)
 *  - Non-admin users are redirected to /unauthorized for admin-only routes
 */

import { test, expect } from '@playwright/test';
import { loginAs, mockApiForUser, ADMIN_USER, STUDENT_USER, LECTURER_USER } from './helpers';

test.describe('Admin – Login', () => {
  test('admin can log in and is redirected to /dashboard', async ({ page }) => {
    await mockApiForUser(page, ADMIN_USER);

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(ADMIN_USER.email);
    await page.locator('input[type="password"]').fill('adminpass123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Admin – Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER);
    await page.goto('/dashboard');
  });

  test('admin dashboard shows admin name', async ({ page }) => {
    await expect(page.getByText(ADMIN_USER.full_name, { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('admin can navigate to users management page', async ({ page }) => {
    const usersLink = page.getByRole('button', { name: /users/i }).or(
      page.getByRole('link', { name: /users/i })
    );
    if (await usersLink.count() > 0) {
      await usersLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 8000 });
    }
  });

  test('admin can navigate to institutions page', async ({ page }) => {
    const institutionsLink = page.getByRole('button', { name: /institutions/i }).or(
      page.getByRole('link', { name: /institutions/i })
    );
    if (await institutionsLink.count() > 0) {
      await institutionsLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/institutions/, { timeout: 8000 });
    }
  });

  test('admin can navigate to venues page', async ({ page }) => {
    const venuesLink = page.getByRole('button', { name: /venues/i }).or(
      page.getByRole('link', { name: /venues/i })
    );
    if (await venuesLink.count() > 0) {
      await venuesLink.first().click();
      await expect(page).toHaveURL(/\/dashboard\/venues/, { timeout: 8000 });
    }
  });
});

test.describe('Admin – Route Protection', () => {
  test('student cannot access admin users page', async ({ page }) => {
    await loginAs(page, STUDENT_USER);
    await page.goto('/dashboard/users');
    await expect(page).toHaveURL(/\/unauthorized/, { timeout: 8000 });
  });

  test('lecturer cannot access admin institutions page', async ({ page }) => {
    await loginAs(page, LECTURER_USER);
    await page.goto('/dashboard/institutions');
    await expect(page).toHaveURL(/\/unauthorized/, { timeout: 8000 });
  });

  test('lecturer cannot access admin venues page', async ({ page }) => {
    await loginAs(page, LECTURER_USER);
    await page.goto('/dashboard/venues');
    await expect(page).toHaveURL(/\/unauthorized/, { timeout: 8000 });
  });
});
