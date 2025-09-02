const testUtils = require('./helpers/test-utils');

describe('Doctor Queue Management', () => {
  let doctorPage;
  let patientPage;
  
  beforeAll(async () => {
    // Create two browser instances
    const browser = await global.__BROWSER__.createIncognitoBrowserContext();
    doctorPage = await browser.newPage();
    patientPage = await browser.newPage();
    
    // Log in as doctor and patient
    await testUtils.loginAsDoctor(doctorPage);
    await testUtils.loginAsPatient(patientPage);
  });

  afterAll(async () => {
    await doctorPage.close();
    await patientPage.close();
  });

  test('should show patient in doctor\'s queue when patient starts consultation', async () => {
    console.log('Starting test: Doctor queue management');
    
    // Patient starts consultation
    await patientPage.goto('http://localhost:3000/patient/consultation');
    await patientPage.click('#start-consultation');
    
    // Doctor checks queue
    await doctorPage.goto('http://localhost:3000/doctor/dashboard');
    
    // Wait for patient to appear in queue
    await doctorPage.waitForSelector('.patient-queue-item', { timeout: 10000 });
    
    // Verify patient details in queue
    const queueItem = await doctorPage.$('.patient-queue-item');
    expect(queueItem).not.toBeNull();
    
    const patientName = await doctorPage.$eval(
      '.patient-queue-item .patient-name',
      el => el.textContent.trim()
    );
    
    expect(patientName).toBe('Test Patient');
    
    // Take screenshot
    await testUtils.takeScreenshot(doctorPage, 'doctor-queue-with-patient');
    
    console.log('Test completed: Doctor can see patient in queue');
  });

  test('should allow doctor to accept consultation', async () => {
    console.log('Starting test: Doctor accepts consultation');
    
    // Doctor accepts consultation
    const acceptButton = await doctorPage.waitForSelector('.accept-consultation', { visible: true });
    await acceptButton.click();
    
    // Verify video call starts
    await testUtils.waitForVideo(doctorPage, '#doctor-video');
    await testUtils.waitForVideo(doctorPage, '#patient-video');
    
    // Verify call controls are visible
    const callControls = await doctorPage.$('.call-controls');
    expect(callControls).not.toBeNull();
    
    // Take screenshot
    await testUtils.takeScreenshot(doctorPage, 'doctor-accepted-consultation');
    
    console.log('Test completed: Doctor successfully accepted consultation');
  });
});
