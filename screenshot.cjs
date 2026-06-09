const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 8000 }); // Very tall for the whole page
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Animation time
    await page.screenshot({ path: '/home/jules/verification/final_refined_landing.png', fullPage: true });
    console.log('Screenshot saved');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
