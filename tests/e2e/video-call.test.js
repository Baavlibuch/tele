const testUtils = require('./helpers/test-utils');

describe('Video Call Functionality', () => {
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
    
    // Start consultation flow
    await patientPage.goto('http://localhost:3000/patient/consultation');
    await patientPage.click('#start-consultation');
    
    // Doctor accepts consultation
    await doctorPage.goto('http://localhost:3000/doctor/dashboard');
    await doctorPage.waitForSelector('.accept-consultation');
    await doctorPage.click('.accept-consultation');
    
    // Wait for video to be ready on both ends
    await testUtils.waitForVideo(doctorPage, '#doctor-video');
    await testUtils.waitForVideo(patientPage, '#patient-video');
  });

  afterAll(async () => {
    await doctorPage.close();
    await patientPage.close();
  });

  test('should establish video connection between doctor and patient', async () => {
    console.log('Starting test: Video call connection');
    
    // Verify video is playing on doctor's side
    const isDoctorVideoPlaying = await doctorPage.evaluate(() => {
      const video = document.querySelector('#patient-video');
      return video.readyState === 4 && video.videoWidth > 0;
    });
    expect(isDoctorVideoPlaying).toBe(true);
    
    // Verify video is playing on patient's side
    const isPatientVideoPlaying = await patientPage.evaluate(() => {
      const video = document.querySelector('#doctor-video');
      return video.readyState === 4 && video.videoWidth > 0;
    });
    expect(isPatientVideoPlaying).toBe(true);
    
    // Take screenshots
    await testUtils.takeScreenshot(doctorPage, 'doctor-video-call');
    await testUtils.takeScreenshot(patientPage, 'patient-video-call');
    
    console.log('Test completed: Video call established successfully');
  });

  test('should allow muting/unmuting audio', async () => {
    console.log('Starting test: Audio controls');
    
    // Test mute button on doctor's side
    const muteButton = await doctorPage.$('.mute-button');
    await muteButton.click();
    
    // Verify mute state
    const isMuted = await doctorPage.evaluate(() => {
      const video = document.querySelector('#doctor-video');
      return video.muted;
    });
    expect(isMuted).toBe(true);
    
    // Unmute
    await muteButton.click();
    
    console.log('Test completed: Audio controls working');
  });

  test('should allow turning video on/off', async () => {
    console.log('Starting test: Video controls');
    
    // Test video toggle on patient's side
    const videoButton = await patientPage.$('.video-button');
    await videoButton.click();
    
    // Verify video is off
    const isVideoOff = await patientPage.evaluate(() => {
      const video = document.querySelector('#patient-video');
      return video.srcObject === null;
    });
    expect(isVideoOff).toBe(true);
    
    // Turn video back on
    await videoButton.click();
    
    console.log('Test completed: Video controls working');
  });
});
