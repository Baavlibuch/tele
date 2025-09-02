const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  viewport: { width: 1200, height: 800 },
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
  console.log(`📸 Screenshot: ${screenshotPath}`);
  return screenshotPath;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    devtools: true,
    args: [`--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000); // 10 second timeout
    
    // Step 1: Go to home page
    console.log('\n=== Step 1: Loading Home Page ===');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    console.log('Title:', await page.title());
    await takeScreenshot(page, '01-home-page');
    
    // Step 2: Navigate to Nurse Login
    console.log('\n=== Step 2: Navigating to Nurse Login ===');
    await page.waitForSelector('a[href="/nurseLogin"]', { visible: true });
    console.log('Found Nurse link, clicking...');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('a[href="/nurseLogin"]')
    ]);
    
    console.log('Current URL:', page.url());
    await takeScreenshot(page, '02-nurse-login-page');
    
    // Step 3: Fill in login form
    console.log('\n=== Step 3: Filling in Login Form ===');
    
    // Wait for and fill in username (using placeholder as identifier)
    console.log('Filling in username...');
    await page.waitForSelector('input[placeholder="Username"]', { visible: true });
    await page.type('input[placeholder="Username"]', CONFIG.testCredentials.username);
    
    // Fill in password (using placeholder as identifier)
    console.log('Filling in password...');
    await page.type('input[placeholder="Password"]', CONFIG.testCredentials.password);
    
    await takeScreenshot(page, '03-filled-login-form');
    
    // Step 4: Submit the form
    console.log('\n=== Step 4: Submitting Form ===');
    
    // Find and click the login button (using button text)
    const loginButton = await page.$x('//button[contains(., "Login")]');
    if (loginButton.length > 0) {
      console.log('Found login button, clicking...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        loginButton[0].click()
      ]);
    } else {
      console.log('No login button found, trying to press Enter...');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000); // Wait for potential navigation
    }
    
    console.log('After login, URL:', page.url());
    await takeScreenshot(page, '04-after-login');
    
    // Check if login was successful
    if (page.url().includes('dashboard') || page.url().includes('patients')) {
      console.log('✅ Login successful!');
    } else {
      console.log('⚠️  Login may not have been successful. Check screenshots.');
    }
    
    console.log('\nTest complete. Browser will stay open for inspection.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('Check the browser for more details.');
    
    // Take a final screenshot on error
    if (page) {
      await takeScreenshot(page, 'error-screenshot');
    }
    
    process.exit(1);
  }
})();
