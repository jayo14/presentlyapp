import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})

        try:
            await page.goto('http://localhost:3000', timeout=60000)
            await page.wait_for_timeout(3000)  # Wait for animations

            # Hero
            await page.screenshot(path='/home/jules/verification/landing_v5_hero.png')
            print("Captured Hero")

            # Bento
            await page.evaluate("window.scrollTo(0, 1000)")
            await page.wait_for_timeout(2000)
            await page.screenshot(path='/home/jules/verification/landing_v5_bento.png')
            print("Captured Bento")

            # Full Page
            await page.evaluate("window.scrollTo(0, 0)")
            await page.screenshot(path='/home/jules/verification/landing_v5_full.png', full_page=True)
            print("Captured Full Page")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
