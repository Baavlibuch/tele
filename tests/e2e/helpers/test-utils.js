const fs = require('fs');
const path = require('path');

class TestUtils {
  constructor() {
    this.testDataDir = path.join(__dirname, 'test-data');
    this.ensureTestDataDir();
  }

  ensureTestDataDir() {
    if (!fs.existsSync(this.testDataDir)) {
      fs.mkdirSync(this.testDataDir, { recursive: true });
    }
  }

  async takeScreenshot(page, name) {
    const screenshotsDir = path.join(this.testDataDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotsDir, `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);
  }

  async loginAsPatient(page) {
    await page.goto('http://localhost:3000/patient/login');
    await page.type('#username', 'test_patient');
    await page.type('#password', 'Test@123');
    await page.click('#login-button');
    await page.waitForNavigation();
  }

  async loginAsDoctor(page) {
    await page.goto('http://localhost:3000/doctor/login');
    await page.type('#username', 'test_doctor');
    await page.type('#password', 'Doctor@123');
    await page.click('#login-button');
    await page.waitForNavigation();
  }

  async waitForVideo(page, selector, timeout = 10000) {
    await page.waitForFunction(
      (selector) => {
        const video = document.querySelector(selector);
        return video && video.readyState === 4;
      },
      { timeout },
      selector
    );
  }
}

module.exports = new TestUtils();
