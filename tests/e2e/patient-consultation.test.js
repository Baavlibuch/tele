const puppeteer = require('puppeteer');
const path = require('path');

// Utility function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  // Create screenshots directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const screenshotPath = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);
  return screenshotPath;
}

// Main test
describe('Telemedicine App E2E Tests', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3005';
  const NURSE_USERNAME = 'test_nurse';
  const NURSE_PASSWORD = 'test_password';

  beforeAll(async () => {
    try {
      // Launch browser with test flags
      browser = await puppeteer.launch({
        headless: false,
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--window-size=1280,800',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        defaultViewport: null,
        ignoreHTTPSErrors: true
      });
      
      // Create new page
      page = await browser.newPage();
      
      // Set default timeout
      page.setDefaultTimeout(30000);
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the application
      console.log('Navigating to application...');
      await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      
      // Take initial screenshot
      await takeScreenshot(page, 'initial-page');
      
      console.log('Page loaded successfully');
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  });

  test('should load the home page', async () => {
    console.log('Testing home page load...');
    
    // Check if the page has loaded by looking for a specific element
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Take screenshot of the home page
    await takeScreenshot(page, 'home-page');
    
    // Verify some key elements are present
    const navBar = await page.$('.navbar');
    expect(navBar).not.toBeNull();
    
    console.log('Home page test completed');
  }, 30000);

  test('should navigate to nurse login page', async () => {
    console.log('Testing nurse login navigation...');
    
    try {
      // Click on the doctor/nashboard link to reveal the nurse login option
      const doctorLink = await page.waitForSelector('a[href="/doctor"]', { visible: true });
      await doctorLink.click();
      
      // Wait for the dropdown to appear and click on nurse login
      const nurseLoginLink = await page.waitForSelector('a[href="/nurse/login"]', { visible: true });
      await nurseLoginLink.click();
      
      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Take screenshot of the login page
      await takeScreenshot(page, 'nurse-login-page');
      
      // Verify we're on the login page
      const loginTitle = await page.title();
      console.log('Login page title:', loginTitle);
      
      // Check for login form elements
      const usernameInput = await page.$('input[name="username"]');
      const passwordInput = await page.$('input[name="password"]');
      const loginButton = await page.$('button[type="submit"]');
      
      expect(usernameInput).not.toBeNull();
      expect(passwordInput).not.toBeNull();
      expect(loginButton).not.toBeNull();
      
      console.log('Nurse login navigation test completed');
    } catch (error) {
      console.error('Error in nurse login navigation test:', error);
      await takeScreenshot(page, 'nurse-login-error');
      throw error;
    }
  }, 60000);
  
  test('should log in as nurse and access patient list', async () => {
    console.log('Testing nurse login...');
    
    try {
      // Fill in login form
      await page.type('input[name="username"]', NURSE_USERNAME);
      await page.type('input[name="password"]', NURSE_PASSWORD);
      
      // Take screenshot before login
      await takeScreenshot(page, 'before-login');
      
      // Click login button and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]')
      ]);
      
      // Take screenshot after login
      await takeScreenshot(page, 'after-login');
      
      // Verify successful login by checking for elements on the dashboard
      const patientTable = await page.$('.patient-table');
      expect(patientTable).not.toBeNull();
      
      console.log('Nurse login test completed');
    } catch (error) {
      console.error('Error in nurse login test:', error);
      await takeScreenshot(page, 'login-error');
      throw error;
    }
  }, 60000);
  
  // Add more test cases for patient consultation flow here
});
