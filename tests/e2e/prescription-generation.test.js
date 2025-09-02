const testUtils = require('./helpers/test-utils');
const fs = require('fs');
const path = require('path');

describe('Automated Prescription Generation', () => {
  let doctorPage;
  let patientPage;
  
  beforeAll(async () => {
    // Create two browser instances
    const browser = await global.__BROWSER__.createIncognitoBrowserContext();
    doctorPage = await browser.newPage();
    patientPage = await browser.newPage();
    
    // Log in as both users
    await testUtils.loginAsDoctor(doctorPage);
    await testUtils.loginAsPatient(patientPage);
    
    // Start and accept consultation
    await patientPage.goto('http://localhost:3000/patient/consultation');
    await patientPage.click('#start-consultation');
    await doctorPage.goto('http://localhost:3000/doctor/dashboard');
    await doctorPage.waitForSelector('.accept-consultation');
    await doctorPage.click('.accept-consultation');
    
    // Wait for video call to be established
    await testUtils.waitForVideo(doctorPage, '#doctor-video');
  });

  afterAll(async () => {
    await doctorPage.close();
    await patientPage.close();
  });

  test('should generate prescription after consultation', async () => {
    console.log('Starting test: Prescription generation');
    
    // Doctor adds diagnosis and prescription notes
    await doctorPage.type('#diagnosis-input', 'Mild fever and cough');
    await doctorPage.type('#prescription-notes', 'Take rest and stay hydrated');
    
    // Add medications
    await doctorPage.click('#add-medication');
    await doctorPage.type('.medication-name', 'Paracetamol');
    await doctorPage.type('.medication-dosage', '500mg');
    await doctorPage.type('.medication-frequency', 'Every 6 hours');
    await doctorPage.type('.medication-duration', '3 days');
    
    // End consultation
    await doctorPage.click('#end-consultation');
    
    // Wait for prescription to generate
    await doctorPage.waitForSelector('.prescription-preview', { timeout: 10000 });
    
    // Verify prescription content
    const prescriptionText = await doctorPage.$eval(
      '.prescription-content',
      el => el.textContent
    );
    
    expect(prescriptionText).toContain('PRESCRIPTION');
    expect(prescriptionText).toContain('Test Patient');
    expect(prescriptionText).toContain('Paracetamol');
    expect(prescriptionText).toContain('Mild fever and cough');
    
    // Test PDF download
    const [download] = await Promise.all([
      doctorPage.waitForEvent('download'),
      doctorPage.click('#download-prescription')
    ]);
    
    const downloadPath = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }
    
    const fileName = await download.suggestedFilename();
    const filePath = path.join(downloadPath, fileName);
    await download.saveAs(filePath);
    
    // Verify file exists
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
    
    // Clean up
    if (fileExists) {
      fs.unlinkSync(filePath);
    }
    
    console.log('Test completed: Prescription generated and downloaded successfully');
  });
});
