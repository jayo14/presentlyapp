import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  const logs = [];
  page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'a@b.com');
  await page.fill('input[type="password"]', 'admin12345');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto(`${BASE}/dashboard/venues`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: '/tmp/kilo/maptest.png', fullPage: false });

  console.log('=== RELEVANT LOGS ===');
  console.log(logs.filter(l => l.includes('[VenueMap]') || /error/i.test(l)).join('\n'));

  await browser.close();
})();
