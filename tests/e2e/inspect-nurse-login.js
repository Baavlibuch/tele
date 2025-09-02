const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate directly to the nurse login page
    console.log('Navigating to nurse login page...');
    await page.goto('http://localhost:3005/nurseLogin', { waitUntil: 'networkidle2' });
    
    console.log('\n=== Page Information ===');
    console.log('Title:', await page.title());
    console.log('URL:', page.url());
    
    // Get all form elements
    console.log('\n=== Form Elements ===');
    const formElements = await page.$$eval('input, button, form', elements => 
      elements.map(el => ({
        tag: el.tagName,
        type: el.type || 'N/A',
        name: el.name || 'N/A',
        id: el.id || 'N/A',
        class: el.className || 'N/A',
        placeholder: el.placeholder || 'N/A',
        value: el.value || 'N/A',
        text: el.innerText ? el.innerText.trim() : 'N/A',
        visible: el.offsetParent !== null
      }))
    );
    
    console.log('Found form elements:');
    formElements.forEach((el, i) => {
      console.log(`[${i + 1}] <${el.tag} type="${el.type}" name="${el.name}" id="${el.id}" class="${el.class}" placeholder="${el.placeholder}" value="${el.value}" visible="${el.visible}"> ${el.text}`);
    });
    
    // Get all links
    const links = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.innerText.trim(),
        href: link.href,
        visible: link.offsetParent !== null
      }))
    );
    
    console.log('\n=== Links ===');
    links.filter(link => link.visible && link.text).forEach((link, i) => {
      console.log(`[${i + 1}] ${link.text} -> ${link.href}`);
    });
    
    // Get all buttons
    const buttons = await page.$$eval('button, [role="button"]', buttons => 
      buttons.map(btn => ({
        text: btn.innerText.trim(),
        type: btn.type || 'button',
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }))
    );
    
    console.log('\n=== Buttons ===');
    buttons.filter(btn => btn.visible).forEach((btn, i) => {
      console.log(`[${i + 1}] <${btn.type}> ${btn.text} ${btn.disabled ? '(disabled)' : ''}`);
    });
    
    console.log('\nInspection complete. Browser will stay open for manual inspection.');
    
  } catch (error) {
    console.error('Inspection failed:', error);
    process.exit(1);
  }
})();
