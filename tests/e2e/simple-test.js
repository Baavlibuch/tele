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

// Main test function
(async () => {
  console.log('Starting simple test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--window-size=${CONFIG.viewport.width},${CONFIG.viewport.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    defaultViewport: null,
    ignoreHTTPSErrors: true
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);
    
    // Test 1: Load the home page
    console.log('\n--- Test 1: Load Home Page ---');
    try {
      console.log(`Navigating to ${CONFIG.baseUrl}...`);
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '01-home-page');
      
      const pageTitle = await page.title();
      console.log(`Page title: ${pageTitle}`);
      
      const navBar = await page.$('.navbar');
      if (!navBar) {
        throw new Error('Navigation bar not found on home page');
      }
      console.log('✓ Home page loaded successfully');
    } catch (error) {
      console.error('❌ Home page test failed:', error);
      await takeScreenshot(page, '01-home-page-error');
      throw error;
    }
    
    // Test 2: Navigate to doctor section to find nurse login
    console.log('\n--- Test 2: Find Nurse Login ---');
    try {
      // Click on the doctor link to reveal the nurse login option
      console.log('Clicking on doctor link...');
      const doctorLink = await page.waitForSelector('a[href="/doctor"]', { visible: true, timeout: 5000 });
      await doctorLink.click();
      
      // Wait for the dropdown to appear and click on nurse login
      console.log('Looking for nurse login link...');
      const nurseLoginLink = await page.waitForSelector('a[href="/nurse/login"]', { visible: true, timeout: 5000 });
      
      if (nurseLoginLink) {
        console.log('Found nurse login link, clicking...');
        await nurseLoginLink.click();
        
        // Wait for navigation to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await takeScreenshot(page, '02-nurse-login-page');
        
        // Check for login form elements
        const usernameInput = await page.$('input[name="username"]');
        const passwordInput = await page.$('input[name="password"]');
        const loginButton = await page.$('button[type="submit"]');
        
        if (!usernameInput || !passwordInput || !loginButton) {
          throw new Error('Login form elements not found on nurse login page');
        }
        
        console.log('✓ Nurse login page loaded successfully');
        
        // Test 3: Attempt to log in
        console.log('\n--- Test 3: Attempt Login ---');
        try {
          const TEST_CREDENTIALS = {
            username: 'test_nurse',
            password: 'test_password'
          };
          
          console.log('Filling in login form...');
          await usernameInput.type(TEST_CREDENTIALS.username);
          await passwordInput.type(TEST_CREDENTIALS.password);
          
          // Take screenshot before login attempt
          await takeScreenshot(page, '03-before-login');
          
          console.log('Submitting login form...');
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            loginButton.click()
          ]);
          
          // Take screenshot after login attempt
          await takeScreenshot(page, '04-after-login');
          
          // Check if login was successful
          const currentUrl = page.url();
          if (currentUrl.includes('dashboard') || currentUrl.includes('patients')) {
            console.log('✓ Login successful!');
          } else {
            console.log('❌ Login may have failed. Current URL:', currentUrl);
          }
        } catch (loginError) {
          console.error('❌ Login attempt failed:', loginError);
          await takeScreenshot(page, '03-login-error');
          throw loginError;
        }
      } else {
        throw new Error('Nurse login link not found in dropdown');
      }
    } catch (error) {
      console.error('❌ Navigation to nurse login failed:', error);
    }
    console.log('\n--- All tests completed ---');
    console.log('Keeping browser open for inspection...');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await takeScreenshot(page, 'error-screenshot');
    process.exitCode = 1; // Indicate test failure
  } finally {
    // Close the browser after a delay to allow inspection
    if (process.env.CLOSE_BROWSER === 'true') {
      console.log('\nClosing browser...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before closing
      await browser.close();
    } else {
      console.log('\nBrowser will remain open. Set CLOSE_BROWSER=true to automatically close after tests.');
    }
  }
})();
