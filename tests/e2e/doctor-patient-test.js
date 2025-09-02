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
  console.log('Starting basic functionality test...');
  
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
    
    // Test 1: Load home page
    console.log('\nTest 1: Load home page');
    await page.goto(config.baseUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation
    });
    
    await takeScreenshot(page, '01-home-page');
    console.log('✓ Home page loaded');
    
    // Test 2: Check for navigation elements
    console.log('\nTest 2: Check navigation elements');
    const navLinks = await page.$$eval('a, button', elements => 
      elements
        .filter(el => el.offsetParent !== null) // Only visible elements
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
          href: el.href || 'N/A'
        }))
    );
    
    console.log('Found navigation elements:');
    navLinks.slice(0, 10).forEach((link, i) => {
      console.log(`[${i + 1}] <${link.tag}> ${link.text} (${link.href})`);
    });
    
    if (navLinks.length > 0) {
      console.log('✓ Navigation elements found');
    } else {
      console.warn('No navigation elements found');
    }
    
    // Test 3: Check for doctor and patient sections
    console.log('\nTest 3: Check for doctor and patient sections');
    const doctorLink = navLinks.find(link => 
      link.text.toLowerCase().includes('doctor') || 
      link.href.toLowerCase().includes('doctor')
    );
    
    const patientLink = navLinks.find(link => 
      link.text.toLowerCase().includes('patient') ||
      link.href.toLowerCase().includes('patient')
    );
    
    if (doctorLink) {
      console.log(`✓ Doctor section found: ${doctorLink.href}`);
    } else {
      console.warn('Doctor section not found');
    }
    
    if (patientLink) {
      console.log(`✓ Patient section found: ${patientLink.href}`);
    } else {
      console.warn('Patient section not found');
    }
    
    console.log('\nBasic functionality test completed!');
    
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
