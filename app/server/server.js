import { chromium } from 'playwright';
import puppeteer from 'puppeteer';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:1080' : 'https://blue.vermilion.place/';

// Browser Pool Configuration
const POOL_SIZE = 10; // Number of browser instances in the pool
const browserPool = {
  browsers: [],
  inUse: new Set(),
  initialized: false,
  
  async initialize() {
    if (this.initialized) return;
    
    console.log(`Initializing browser pool with ${POOL_SIZE} instances...`);
    for (let i = 0; i < POOL_SIZE; i++) {
      const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-dev-shm-usage'] 
      });
      this.browsers.push(browser);
    }
    this.initialized = true;
    console.log("Browser pool ready");
  },
  
  async getBrowser() {
    if (!this.initialized) await this.initialize();
    
    // Find an available browser
    for (const browser of this.browsers) {
      if (!this.inUse.has(browser)) {
        this.inUse.add(browser);
        return browser;
      }
    }
    
    // If all browsers are in use, wait for one to become available
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        for (const browser of this.browsers) {
          if (!this.inUse.has(browser)) {
            clearInterval(checkInterval);
            this.inUse.add(browser);
            resolve(browser);
            return;
          }
        }
      }, 100);
    });
  },
  
  releaseBrowser(browser) {
    this.inUse.delete(browser);
  },
  
  async closeAll() {
    console.log("Closing all browsers in pool...");
    for (const browser of this.browsers) {
      await browser.close();
    }
    this.browsers = [];
    this.inUse.clear();
    this.initialized = false;
    console.log("All pool browsers closed");
  }
};

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('Hello World!'),
    '/renderedContent/:id': async req => {
      let ss = await renderContentPuppeteer(apiBaseUrl + "/content/" + req.params.id);
      if (!ss) {
        return new Response('Error rendering content', { status: 404 });
      }
      return new Response(ss, {
        headers: { 'Content-Type': 'image/png' },
      });
    }
  }
});

async function renderContentPuppeteer(url) {
  let startTime = performance.now();
  
  // Get a browser from the pool
  const browser = await browserPool.getBrowser();
  let launchTime = performance.now();
  
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 600, height: 600 });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    await page.waitForNetworkIdle({ timeout: 10000 });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    console.log('Screenshot captured in memory.');
    let endTime = performance.now();
    console.log('Browser acquisition time:', launchTime - startTime);
    console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content:', error);
    return null;
  } finally {
    await page.close();
    // Release the browser back to the pool
    browserPool.releaseBrowser(browser);
  }
}

// Shutdown function to clean up everything
async function shutdown() {
  console.log("Shutting down...");
  // Stop Bun server
  server.stop();
  console.log("Bun server stopped");
  
  // Close all browsers in the pool
  await browserPool.closeAll();
  
  // Close Playwright browser
  if (playwrightBrowser) {
    await playwrightBrowser.close();
    console.log("Playwright browser closed");
  }
  process.exit(0);
}

// Close the browsers when the server is stopped
// Handle SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  await shutdown();
});

// Handle SIGTERM (termination signal)
process.on("SIGTERM", async () => {
  await shutdown();
});

// Initialize the browser pool on startup
browserPool.initialize().catch(err => {
  console.error("Failed to initialize browser pool:", err);
});