const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  viewport: { width: 1280, height: 800 },
  screenshotsDir: path.join(__dirname, 'screenshots')
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

// Utility function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(CONFIG.screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);
  return screenshotPath;
}

// Main test
(async () => {
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: [
      '--window-size=1280,800',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    // Navigate to the home page
    console.log(`Navigating to ${CONFIG.baseUrl}...`);
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-home-page');

    // Log page title and URL
    console.log(`Title: ${await page.title()}`);
    console.log(`URL: ${page.url()}`);

    // List all interactive elements
    console.log('\nInteractive elements found:');
    const elements = await page.$$('a, button, [role="button"], [onclick]');
    
    for (let i = 0; i < Math.min(10, elements.length); i++) {
      try {
        const text = await page.evaluate(el => el.textContent || el.innerText || '', elements[i]);
        const tag = await page.evaluate(el => el.tagName.toLowerCase(), elements[i]);
        const href = await page.evaluate(el => el.href || '', elements[i]);
        console.log(`[${i + 1}] <${tag}> ${text.trim() || '[no text]'} ${href ? `(${href})` : ''}`);
      } catch (e) {
        console.log(`[${i + 1}] Could not get element info`);
      }
    }

    console.log('\nTest completed. Keeping browser open for inspection.');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    // Keep browser open for inspection
    console.log('Browser will remain open. Close it manually when done.');
  }
})();
