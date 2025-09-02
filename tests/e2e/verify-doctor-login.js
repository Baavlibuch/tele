const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  slowMo: 50,
  viewport: { width: 1200, height: 800 },
  credentials: {
    username: 'test_doctor',
    password: 'test_password'
  },
  timeouts: {
    navigation: 10000,
    element: 5000
  }
};

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Utility function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Main test function
async function runTest() {
  console.log('Starting doctor login verification test...');
  
  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    defaultViewport: config.viewport,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(config.timeouts.element);
    
    // Test 1: Navigate to doctor login page
    console.log('\nStep 1: Navigate to doctor login page');
    await page.goto(`${config.baseUrl}/doctor`, { 
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation
    });
    
    await takeScreenshot(page, '01-doctor-login-page');
    console.log('✓ Doctor login page loaded');
    
    // Test 2: Fill in login form
    console.log('\nStep 2: Fill in login form');
    
    // Wait for and fill in username
    console.log('  - Filling in username...');
    await page.waitForSelector('#username', { visible: true });
    await page.type('#username', config.credentials.username, { delay: 30 });
    
    // Fill in password
    console.log('  - Filling in password...');
    await page.type('#password', config.credentials.password, { delay: 30 });
    
    await takeScreenshot(page, '02-filled-login-form');
    
    // Test 3: Submit the form
    console.log('\nStep 3: Submit login form');
    
    // Click the login button
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log('  - Found submit button, clicking...');
      
      // Start navigation wait before clicking
      const navigationPromise = page.waitForNavigation({ 
        waitUntil: 'networkidle0', 
        timeout: 10000 
      }).catch(() => {
        console.log('  - Navigation timeout, checking if already on dashboard...');
        return null;
      });
      
      await loginButton.click();
      
      // Wait for navigation or timeout
      await navigationPromise;
    } else {
      console.log('  - No submit button found, pressing Enter...');
      await page.keyboard.press('Enter');
    }
    
    // Wait a moment for any redirects
    await page.waitForTimeout(2000);
    
    // Take a screenshot after login attempt
    await takeScreenshot(page, '03-after-login');
    
    // Test 4: Check if login was successful
    console.log('\nStep 4: Verify login status');
    
    const currentUrl = page.url();
    console.log(`  - Current URL: ${currentUrl}`);
    
    // Check for common dashboard elements
    const dashboardElements = await page.evaluate(() => {
      const elements = [];
      const selectors = [
        '.dashboard', '.patients', '.appointments', 
        '.profile', '.sidebar', '.header', '.menu'
      ];
      
      selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          elements.push({
            selector,
            visible: true,
            text: element.textContent.trim().substring(0, 50) + (element.textContent.trim().length > 50 ? '...' : '')
          });
        }
      });
      
      return elements;
    });
    
    if (dashboardElements.length > 0 || currentUrl.includes('dashboard')) {
      console.log('✅ Login successful!');
      console.log('Found dashboard elements:', dashboardElements.map(e => e.selector).join(', '));
    } else {
      console.log('⚠️  Login may not have been successful. Checking for error messages...');
      
      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const errorEl = document.querySelector('.error, .alert, [role="alert"]');
        return errorEl ? errorEl.textContent.trim() : null;
      });
      
      if (errorMessage) {
        console.log(`  - Error message: ${errorMessage}`);
      } else {
        console.log('  - No error messages found');
      }
    }
    
    console.log('\nDoctor login verification test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'error-screenshot');
    throw error;
  } finally {
    console.log('\nTest completed. Browser will remain open for inspection.');
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
