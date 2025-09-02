const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  baseUrl: 'http://localhost:3005',
  headless: false,
  slowMo: 50,
  viewport: { width: 1200, height: 800 },
  timeouts: {
    navigation: 30000,
    element: 10000
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
  console.log('Starting doctor dashboard test...');
  
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
    
    // Test 1: Navigate to doctor section
    console.log('\nTest 1: Navigate to doctor section');
    await page.goto(`${config.baseUrl}/doctor`, { 
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation
    });
    
    await takeScreenshot(page, '01-doctor-landing');
    console.log('✓ Doctor landing page loaded');
    
    // Check for login form or dashboard
    const isLoginPage = await page.$('input[type="text"], input[type="password"]') !== null;
    
    if (isLoginPage) {
      console.log('  - Login form detected');
      
      // Test 2: Try to log in (if login form exists)
      console.log('\nTest 2: Attempt doctor login');
      
      // Check if we have test credentials
      const testUsername = process.env.DOCTOR_USERNAME || 'test_doctor';
      const testPassword = process.env.DOCTOR_PASSWORD || 'test_password';
      
      console.log(`  - Using test credentials: ${testUsername}/${'*'.repeat(testPassword.length)}`);
      
      await page.type('input[type="text"]', testUsername);
      await page.type('input[type="password"]', testPassword);
      
      await takeScreenshot(page, '02-filled-login');
      
      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]')
      ]);
      
      await takeScreenshot(page, '03-post-login');
      console.log('✓ Login form submitted');
    } else {
      console.log('  - Already logged in or different page layout');
    }
    
    // Test 3: Check dashboard elements
    console.log('\nTest 3: Check dashboard elements');
    
    // Look for common dashboard elements
    const dashboardElements = await page.evaluate(() => {
      const elements = [];
      // Check for common dashboard sections
      const sections = [
        'patients', 'appointments', 'schedule', 'profile',
        'messages', 'notifications', 'reports'
      ];
      
      sections.forEach(section => {
        const selector = `[class*="${section}" i], [id*="${section}" i], [data-test*="${section}" i]`;
        const items = Array.from(document.querySelectorAll(selector))
          .filter(el => el.offsetParent !== null) // Only visible elements
          .map(el => ({
            tag: el.tagName.toLowerCase(),
            id: el.id || 'N/A',
            class: el.className || 'N/A',
            text: el.textContent.trim().substring(0, 50) + (el.textContent.trim().length > 50 ? '...' : '')
          }));
        
        if (items.length > 0) {
          elements.push({
            section,
            count: items.length,
            example: items[0]
          });
        }
      });
      
      return elements;
    });
    
    console.log('\nFound dashboard sections:');
    if (dashboardElements.length > 0) {
      dashboardElements.forEach((item, index) => {
        console.log(`[${index + 1}] ${item.section}: ${item.count} elements`);
        console.log(`    Example: <${item.example.tag} id="${item.example.id}" class="${item.example.class}">`);
        console.log(`    Text: "${item.example.text}"`);
      });
      console.log('✓ Dashboard elements found');
    } else {
      console.warn('No dashboard sections found');
    }
    
    console.log('\nDoctor dashboard test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
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
