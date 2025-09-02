const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  viewport: { width: 1280, height: 800 },
  screenshotsDir: path.join(__dirname, 'screenshots'),
  testCredentials: {
    username: 'test_nurse',
    password: 'test_password'
  }
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

// Utility function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(CONFIG.screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
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
    page.setDefaultTimeout(10000); // 10 second timeout for all actions

    // Step 1: Navigate to the home page
    console.log(`\n[1/4] Navigating to ${CONFIG.baseUrl}...`);
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-home-page');
    console.log(`✓ Loaded: ${await page.title()}`);

    // Step 2: Click on the Nurse link
    console.log('\n[2/4] Clicking on Nurse link...');
    try {
      // First try to find and click the Nurse link in the navigation
      await page.click('a[href="/nurseLogin"]');
      console.log('✓ Clicked Nurse link');
    } catch (error) {
      console.log('Could not find Nurse link, trying to find it in the page...');
      // If the link is not found, try to find any element with "Nurse" text
      const nurseLinks = await page.$$x('//a[contains(translate(., \"NURSE\", \"nurse\"), \"nurse\")]');
      if (nurseLinks.length > 0) {
        await nurseLinks[0].click();
        console.log('✓ Found and clicked Nurse link using text search');
      } else {
        throw new Error('Could not find Nurse login link');
      }
    }

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, '02-nurse-login-page');
    console.log(`✓ Navigated to: ${page.url()}`);

    // Step 3: Fill in login form
    console.log('\n[3/4] Filling in login form...');
    try {
      // Wait for form elements
      await page.waitForSelector('input[name="username"]', { visible: true });
      await page.waitForSelector('input[name="password"]', { visible: true });
      
      // Fill in credentials
      await page.type('input[name="username"]', CONFIG.testCredentials.username);
      await page.type('input[name="password"]', CONFIG.testCredentials.password);
      
      await takeScreenshot(page, '03-filled-login-form');
      console.log('✓ Filled in login form');
      
      // Submit the form
      console.log('Submitting login form...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"], input[type="submit"]')
      ]);
      
      await takeScreenshot(page, '04-after-login');
      console.log(`✓ Form submitted, current URL: ${page.url()}`);
      
      // Check if login was successful
      if (page.url().includes('dashboard') || page.url().includes('patients')) {
        console.log('\n✅ Login successful!');
      } else {
        console.log('\n⚠️  Login may not have been successful. Check screenshots for details.');
      }
      
    } catch (error) {
      console.error('\n❌ Error during login:', error.message);
      await takeScreenshot(page, 'error-during-login');
      throw error;
    }

    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Keep browser open for inspection
    console.log('\nBrowser will remain open. Close it manually when done.');
  }
})();
