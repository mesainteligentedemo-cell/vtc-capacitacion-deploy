const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Screenshots directory
  const screenshotDir = path.join(__dirname, 'screenshots');

  try {
    // 1. Landing Page
    console.log('📸 Capturing Landing Page...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '1-landing.png'), fullPage: true });

    // 2. Login Page
    console.log('📸 Capturing Login Page...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '2-login.png') });

    // 3. Signup Page
    console.log('📸 Capturing Signup Page...');
    await page.goto('http://localhost:3000/auth/signup', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '3-signup.png') });

    // 4. Dashboard
    console.log('📸 Capturing Dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '4-dashboard.png'), fullPage: true });

    // 5. CRM Page
    console.log('📸 Capturing CRM Kanban...');
    await page.goto('http://localhost:3000/dashboard/crm', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '5-crm-kanban.png'), fullPage: true });

    console.log('✅ All screenshots captured!');
    console.log(`📁 Location: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error.message);
  } finally {
    await browser.close();
  }
})();
