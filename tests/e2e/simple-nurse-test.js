const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Configuration
const config = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  slowMo: 50, // Slow down by 50ms
  viewport: { width: 1200, height: 800 },
  credentials: {
    username: 'test_nurse',
    password: 'test_password'
  }
};

// Utility function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

// Main test function
async function runTest() {
  console.log('Starting test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    defaultViewport: config.viewport,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    // Set a longer default timeout
    page.setDefaultTimeout(30000);
    
    // Step 1: Navigate to the nurse login page
    console.log('\nStep 1: Navigating to nurse login page...');
    await page.goto(`${config.baseUrl}/nurseLogin`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log(`Page URL: ${page.url()}`);
    console.log(`Page Title: ${await page.title()}`);
    await takeScreenshot(page, '01-nurse-login-page');
    
    // Step 2: Fill in login form
    console.log('\nStep 2: Filling in login form...');
    
    // Wait for and fill in username
    console.log('Filling in username...');
    await page.waitForSelector('input[placeholder="Username"]', { visible: true });
    await page.type('input[placeholder="Username"]', config.credentials.username, { delay: 50 });
    
    // Fill in password
    console.log('Filling in password...');
    await page.type('input[placeholder="Password"]', config.credentials.password, { delay: 50 });
    
    await takeScreenshot(page, '02-filled-login-form');
    
    // Step 3: Submit the form
    console.log('\nStep 3: Submitting login form...');
    
    // Try to find and click the login button
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log('Found submit button, clicking...');
      await loginButton.click();
    } else {
      console.log('No submit button found, pressing Enter...');
      await page.keyboard.press('Enter');
    }
    
    // Wait for navigation or some element that indicates login success/failure
    console.log('Waiting for navigation or dashboard element...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {
      console.log('Navigation timeout, checking if already on dashboard...');
    });
    
    // Take a screenshot after login attempt
    await takeScreenshot(page, '03-after-login');
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log(`Current URL after login attempt: ${currentUrl}`);
    
    if (currentUrl.includes('dashboard') || currentUrl.includes('patients')) {
      console.log('✅ Login successful!');
    } else {
      console.log('⚠️  Login may not have been successful. Check screenshots.');
      
      // Try to get any error message on the page
      const errorMessage = await page.evaluate(() => {
        const errorEl = document.querySelector('.error, .alert, [role="alert"]');
        return errorEl ? errorEl.textContent.trim() : null;
      });
      
      if (errorMessage) {
        console.log(`Error message: ${errorMessage}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'error-screenshot');
    throw error;
    
  } finally {
    // Keep the browser open for inspection
    console.log('\nTest completed. Browser will remain open for inspection.');
    console.log('Close the browser window when done.');
    
    // Uncomment the following line to automatically close the browser after a delay
    // setTimeout(async () => { await browser.close(); }, 30000);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
