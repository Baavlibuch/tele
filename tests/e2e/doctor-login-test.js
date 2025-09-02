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
  console.log('Starting doctor login page test...');
  
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
    console.log('\nTest 1: Load doctor login page');
    await page.goto(`${config.baseUrl}/doctor`, { 
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation
    });
    
    await takeScreenshot(page, '01-doctor-page');
    console.log('✓ Doctor page loaded');
    
    // Test 2: Check for login form elements
    console.log('\nTest 2: Check for login form elements');
    
    // Look for input fields
    const inputs = await page.$$eval('input', elements => 
      elements.map(el => ({
        type: el.type,
        placeholder: el.placeholder || 'N/A',
        id: el.id || 'N/A',
        name: el.name || 'N/A'
      }))
    );
    
    console.log('Found input fields:');
    inputs.forEach((input, i) => {
      console.log(`  [${i + 1}] type="${input.type}" ` +
                 `placeholder="${input.placeholder}" ` +
                 `id="${input.id}" name="${input.name}"`);
    });
    
    // Look for buttons
    const buttons = await page.$$eval('button', elements => 
      elements.map(el => ({
        text: el.textContent.trim().replace(/\s+/g, ' ') || 'N/A',
        id: el.id || 'N/A',
        type: el.type || 'button'
      }))
    );
    
    console.log('\nFound buttons:');
    buttons.forEach((btn, i) => {
      console.log(`  [${i + 1}] type="${btn.type}" ` +
                 `id="${btn.id}" text="${btn.text}"`);
    });
    
    // Test 3: Check for important sections
    console.log('\nTest 3: Check for important sections');
    const sections = ['header', 'main', 'footer', 'form'];
    const foundSections = [];
    
    for (const section of sections) {
      const element = await page.$(section);
      if (element) {
        foundSections.push(section);
      }
    }
    
    console.log(`Found sections: ${foundSections.join(', ') || 'None'}`);
    
    console.log('\nDoctor login page test completed!');
    
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
