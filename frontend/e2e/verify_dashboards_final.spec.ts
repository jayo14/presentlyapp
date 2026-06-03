import { test, expect } from '@playwright/test';

test('Verify All Dashboards', async ({ page }) => {
  // Mock Auth
  await page.addInitScript(() => {
    localStorage.setItem('sb-hpxzmjvunmzvzvzvzvzv-auth-token', JSON.stringify({
      access_token: 'mock-token',
      user: { id: '123', email: 'alice@example.com', user_metadata: { full_name: 'Alice Student' } }
    }));
  });

  // Mock API
  await page.route('**/api/dashboard/student/', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: { attendance_rate: 85, active_courses: 3 },
        upcoming_classes: []
      })
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');

  await page.screenshot({ path: 'student_dashboard_final_mobile.png' });

  // Test Class Rep View if possible (manual nav)
  await page.goto('/dashboard?role=class-rep&view=timetable');
  await page.screenshot({ path: 'classrep_timetable_mobile.png' });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/dashboard?role=admin');
  await page.screenshot({ path: 'admin_dashboard_final_desktop.png' });
});
