describe('Nurse Login Flow', () => {
  beforeAll(async () => {
    // Set a longer default timeout for all tests
    jest.setTimeout(30000);
  });

  it('should log in to the nurse dashboard', async () => {
    // Navigate to the nurse login page
    await page.goto('http://localhost:3005/nurseLogin', { 
      waitUntil: 'networkidle2' 
    });

    console.log('Page URL:', page.url());
    console.log('Page Title:', await page.title());
    
    // Wait for and fill in the login form
    await expect(page).toFill('input[placeholder="Username"]', 'test_nurse');
    await expect(page).toFill('input[placeholder="Password"]', 'test_password');
    
    // Take a screenshot before submitting
    await page.screenshot({ path: 'screenshots/before-login.png' });
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    
    // Take a screenshot after login attempt
    await page.screenshot({ path: 'screenshots/after-login.png' });
    
    // Verify successful login by checking URL or a dashboard element
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/dashboard|patients|nurse/);
    
    // Additional verification - check for a dashboard element
    await expect(page).toMatchElement('h1, h2, h3', { 
      text: /dashboard|patients|welcome/i,
      timeout: 5000 
    });
  });
});
