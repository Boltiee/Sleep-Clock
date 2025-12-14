import { chromium, Browser, Page } from 'playwright';

async function recordDemo() {
  console.log('🎬 Starting demo recording...');
  
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser with video recording
    browser = await chromium.launch({
      headless: false, // Show browser for visual feedback
    });

    const context = await browser.newContext({
      recordVideo: {
        dir: 'demos/',
        size: { width: 1280, height: 720 }
      },
      viewport: { width: 1280, height: 720 }
    });

    page = await context.newPage();
    
    console.log('✅ Browser launched with recording enabled');

    // Add visual click indicator CSS and JavaScript
    await page.addInitScript(() => {
      // Add click indicator styles
      const style = document.createElement('style');
      style.textContent = `
        .click-indicator {
          position: fixed;
          width: 40px;
          height: 40px;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          animation: clickPulse 0.6s ease-out;
          transform: translate(-50%, -50%);
        }
        .click-indicator::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        @keyframes clickPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
            border-color: #60a5fa;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
            border-color: #3b82f6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
            border-color: #1e40af;
          }
        }
      `;
      document.head.appendChild(style);

      // Add click event listener to show indicator
      document.addEventListener('click', (e) => {
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.style.left = e.clientX + 'px';
        indicator.style.top = e.clientY + 'px';
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 600);
      }, true);

      // Also show indicators for programmatic clicks
      const originalClick = HTMLElement.prototype.click;
      HTMLElement.prototype.click = function() {
        const rect = this.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 600);
        
        return originalClick.apply(this, arguments);
      };
    });

    // Clear storage for fresh start
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    });
    console.log('✅ Click indicators enabled');
    console.log('🗑️  Cleared browser storage');
    await page.waitForTimeout(1000);

    // ====================
    // SECTION 1: ONBOARDING FLOW (15-20 seconds)
    // ====================
    console.log('\n📝 Section 1: Onboarding Flow');
    
    // Reload to trigger redirect to setup
    await page.reload();
    await page.waitForTimeout(2000);

    // Should redirect to /setup
    await page.waitForURL('**/setup', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // Select Local Mode
    console.log('  - Clicking Local Mode');
    await page.click('text=Local Mode (This device only)');
    await page.waitForTimeout(2000);

    // Enter child name
    console.log('  - Entering child name');
    const nameInput = page.locator('input[placeholder*="Child\'s name"]');
    await nameInput.fill('Emma');
    await page.waitForTimeout(1000);

    // Click Create Profile
    console.log('  - Creating profile');
    await page.click('text=Create Profile');
    
    // Wait for either success (PIN step) or error message
    try {
      await Promise.race([
        page.waitForSelector('input[placeholder*="PIN"]', { timeout: 8000 }),
        page.waitForSelector('text=Failed to create profile', { timeout: 8000 })
      ]);
    } catch (e) {
      console.log('  - Waiting for profile creation...');
    }
    
    await page.waitForTimeout(2000);

    // Check if there's an error
    const errorVisible = await page.locator('text=Failed to create profile').isVisible().catch(() => false);
    if (errorVisible) {
      console.log('  - Profile creation failed, retrying...');
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Go through flow again
      await page.click('text=Local Mode (This device only)');
      await page.waitForTimeout(2000);
      const retryNameInput = page.locator('input[placeholder*="Child\'s name"]');
      await retryNameInput.fill('Emma');
      await page.waitForTimeout(1000);
      await page.click('text=Create Profile');
      await page.waitForTimeout(5000);
    }

    // Wait for PIN step - check if we're still on profile step
    const currentUrl = page.url();
    console.log(`  - Current URL: ${currentUrl}`);

    // Enter PIN
    console.log('  - Setting up PIN');
    try {
      await page.waitForSelector('input[placeholder*="PIN"]', { timeout: 10000 });
      const pinInputs = page.locator('input[placeholder*="PIN"]');
      const pinCount = await pinInputs.count();
      console.log(`  - Found ${pinCount} PIN inputs`);
      
      await pinInputs.nth(0).click();
      await pinInputs.nth(0).fill('1234');
      await page.waitForTimeout(1000);
      await pinInputs.nth(1).click();
      await pinInputs.nth(1).fill('1234');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('  - Error with PIN inputs:', e.message);
      await page.screenshot({ path: 'demos/debug-screenshot.png' });
      throw e;
    }

    // Complete setup
    console.log('  - Completing setup');
    await page.click('text=Complete Setup');
    await page.waitForTimeout(2000);

    // Should redirect to main page
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });

    // Handle audio prompt if it appears
    console.log('  - Checking for audio prompt');
    try {
      const audioButton = page.locator('text=Enable Sounds');
      const isAudioVisible = await audioButton.isVisible({ timeout: 3000 });
      if (isAudioVisible) {
        console.log('  - Clicking Enable Sounds');
        await audioButton.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('  - No audio prompt shown');
      }
    } catch (e) {
      console.log('  - Audio prompt handling failed, trying Skip');
      try {
        await page.click('text=Skip');
        await page.waitForTimeout(1500);
      } catch (e2) {
        console.log('  - No Skip button either, continuing');
      }
    }

    // ====================
    // SECTION 2: MAIN APP SCREEN
    // ====================
    console.log('\n🏠 Section 2: Main App Screen');
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    console.log('  - Showing current mode display');
    await page.waitForTimeout(2000);

    // ====================
    // SECTION 3: SETTINGS PANEL (15-20 seconds)
    // ====================
    console.log('\n⚙️ Section 3: Settings Panel');
    
    await page.waitForTimeout(2000);

    // Click settings button (top-right corner)
    console.log('  - Opening settings');
    const settingsButton = page.locator('button[aria-label="Open Settings"]');
    await settingsButton.click();
    await page.waitForTimeout(2000);

    // Navigate through tabs
    const tabs = ['Schedule', 'Colors', 'Chores', 'Sounds'];
    
    for (const tab of tabs) {
      console.log(`  - Showing ${tab} tab`);
      await page.click(`text=${tab}`);
      await page.waitForTimeout(2000);
    }

    // Show a quick edit in Colors tab
    console.log('  - Demonstrating color picker');
    await page.click('text=Colors');
    await page.waitForTimeout(1500);

    // Close settings without saving
    console.log('  - Closing settings');
    await page.click('text=Cancel');
    await page.waitForTimeout(2000);

    // Show the final state briefly
    await page.waitForTimeout(2000);

    // ====================
    // FINAL: Wrap up
    // ====================
    console.log('\n✨ Demo recording complete!');
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('❌ Error during demo recording:', error);
    throw error;
  } finally {
    // Close and save video
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
    console.log('\n📹 Video saved to demos/ folder');
  }
}

// Run the demo
recordDemo().catch(console.error);
