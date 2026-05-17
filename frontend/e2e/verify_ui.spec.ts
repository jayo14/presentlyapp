import { test, expect } from '@playwright/test';

test('verify student home mobile', async ({ page }) => {
  // Set viewport to mobile
  await page.setViewportSize({ width: 390, height: 844 });

  // Mock login and navigate to dashboard
  // (Assuming there's a way to bypass auth or use a test account)
  // For now, I'll just check if the components exist if I can get to the page.
  await page.goto('http://localhost:3001/dashboard');

  // Verify main elements of StudentHomeMobile
  await expect(page.locator('text=Happening Now')).toBeVisible();
  await expect(page.locator('text=Attendance Summary')).toBeVisible();
  await expect(page.locator('text=Recent Activity')).toBeVisible();

  await page.screenshot({ path: 'student-home-mobile.png' });
});

test('verify courses overview mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3001/dashboard/courses');

  await expect(page.locator('text=My Courses')).toBeVisible();
  await expect(page.locator('text=Data Structures')).toBeVisible();

  await page.screenshot({ path: 'courses-overview-mobile.png' });
});

test('verify course registration mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3001/dashboard/courses/register');

  await expect(page.locator('text=Register New Course')).toBeVisible();
  await expect(page.locator('text=Add via Code')).toBeVisible();
  await expect(page.locator('text=Browse Department')).toBeVisible();

  await page.screenshot({ path: 'course-registration-mobile.png' });
});

test('verify analytics mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3001/dashboard/analytics');

  await expect(page.locator('text=Attendance Analytics')).toBeVisible();
  await expect(page.locator('text=Weekly Trends')).toBeVisible();
  await expect(page.locator('text=Course Breakdown')).toBeVisible();

  await page.screenshot({ path: 'analytics-mobile.png' });
});
