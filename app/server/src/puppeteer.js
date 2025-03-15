import puppeteer from 'puppeteer';
import { Jimp, diff } from 'jimp';
import { readableStreamToText } from 'bun';

// Browser Pool Configuration
const isProd = process.env.NODE_ENV === 'production';
const POOL_SIZE = isProd ? 20 : 5;// Number of browser instances in the pool
const browserPool = {
  browsers: [],
  inUse: new Set(),
  initialized: false,
  
  async initialize() {
    if (this.initialized) return;    
    this.initialized = true;
    
    console.log(`Initializing browser pool with ${POOL_SIZE} instances... cleaning up any existing Chrome processes`);
    const cleanup = Bun.spawn(['pkill', '-f', 'chrome'], {
      stdout: 'inherit', // Log output to console
      stderr: 'inherit', // Log errors to console
    });
    let exitCode = await cleanup.exited;
    if (exitCode === 1) console.log("No Chrome processes found");
    if (exitCode === 0) console.log("Chrome processes killed");
    try {
      for (let i = 0; i < POOL_SIZE; i++) {
        const browser = await puppeteer.launch({ 
          headless: true,
          protocolTimeout: 5000,
          handleSIGINT: false,
          handleSIGTERM: false,
          handleSIGHUP: false,
          args: ['--disable-dev-shm-usage']
          // args: ['--no-sandbox', '--disable-dev-shm-usage'] 
        });
        this.browsers.push(browser);
      }
      console.log("Browser pool ready");
    } catch (err) {
      await this.closeAll();
      throw new Error("Error initializing browser pool", { cause: err });
    }
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

async function renderContentWrapper(url) {
  let startTime = performance.now();
  
  // Get a browser from the pool
  const browser = await browserPool.getBrowser();
  let launchTime = performance.now();
  
  const page = await browser.newPage();
  try {
    const screenshotBuffer = await captureStableScreenshot(page, url);
    let endTime = performance.now();
    console.log('Browser acquisition time:', launchTime - startTime);
    console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    throw new Error(`Error rendering content for: ${url} `, { cause: error });
  } finally {
    await page.close();
    // Release the browser back to the pool
    browserPool.releaseBrowser(browser);
  }
}

async function renderContent(url, retryCount = 0, fullPage = true) {
  let startTime = performance.now();
  let buffer;
  let renderStatus;
  // Get a browser from the pool
  const browser = await browserPool.getBrowser();
  let launchTime = performance.now();
  let page = await browser.newPage();
  try {
    const threshold = 0.1; // Similarity threshold
    const interval = 100; // Check every 100 ms
    let activeRequests = 0;

    page.on('request', () => {
      activeRequests++
    });
    page.on('response', () => {
      //activeRequests--
    });
    page.on('requestfailed', () => {
      activeRequests--
    });
    page.on('requestfinished', () => {
      activeRequests--
    });
    page.on('dialog', async dialog => { // handle dialogs that block navigation (.goto)
      await dialog.accept(); // Auto-accept (OK) for alert/confirm/prompt
      // OR await dialog.dismiss(); // Cancel for confirm/prompt
    });

    let activeRequestArr = [];
    let diffArr = [];
    let imageArr = [];

    // Capture initial (empty) screenshot
    let count = 0;
    await page.setViewport({ width: 600, height: 600 });
    let file = Bun.file("default_screenshot.png");
    buffer = Buffer.from(await file.arrayBuffer());
    imageArr.push(await Jimp.read(buffer));

    // capture screenshot after load
    count++;
    let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response && response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    activeRequestArr.push(activeRequests);
    buffer = Buffer.from(await page.screenshot({ fullPage: fullPage, }));
    imageArr.push(await Jimp.read(buffer));

    while (count <= 10) {
      count++;
      await Bun.sleep(interval);
      activeRequestArr.push(activeRequests);
      buffer = Buffer.from(await page.screenshot({ fullPage: fullPage }));
      //Bun.file(`ss_${count}.png`).write(buffer);
      imageArr.push(await Jimp.read(buffer));
      const originalDiff = diff(imageArr[imageArr.length-1], imageArr[0], 0.1).percent;
      const recentDiff = diff(imageArr[imageArr.length-1], imageArr[imageArr.length - 2], 0.1).percent;
      diffArr.push({original: originalDiff, recent: recentDiff});

      // check that screenshot is not similar to orginal, but similar to previous
      // also check that there were no active requests for current and previous screenshot
      if (originalDiff > threshold && recentDiff < threshold && activeRequestArr[activeRequestArr.length-1] <= 0 && activeRequestArr[activeRequestArr.length-2] <= 0) {
        //console.log(diffArr);
        renderStatus = "OK_STABLE";
        break; // Stable enough
      }
      if (count === 10) {
        console.log('Failed to stabilize screenshot after 10 attempts for:', url);
        if (activeRequestArr[activeRequestArr.length-1] > 0 || activeRequestArr[activeRequestArr.length-2] > 0) {
          renderStatus = "OK_UNSTABLE_NETWORK";
        } else if (originalDiff < threshold) {
          renderStatus = "OK_UNSTABLE_SIMILAR_ORIGINAL";
        } else if (recentDiff > threshold) {
          renderStatus = "OK_UNSTABLE_DIFFERENT_RECENT";
        } else {
          renderStatus = "OK_UNSTABLE_UNKNOWN";
        }
      }
    }
    
    await page.close();
    browserPool.releaseBrowser(browser);

  } catch (error) {
    await page.close();
    browserPool.releaseBrowser(browser);

    if (error.message.includes('Navigation timeout')) {
      if (retryCount > 2) {
        console.log(`Navigation timeout after 3 retries`);
        return {buffer, renderStatus: "NAVIGATION_TIMEOUT"};
      };
      console.log('Network error, trying again: ', url);
      return renderContent(url, retryCount + 1);

    } else if (error.message.includes('age is too large')) {
      if (retryCount > 1) {
        console.log(`Size timeout after 2 retries`);
        return {buffer, renderStatus: "SIZE_TIMEOUT"};
      };
      console.log('Size error, trying again: ', url);
      return renderContent(url, retryCount + 1, false);

    } else if (error.message.includes('Cannot take screenshot with 0 width')) {
      if (retryCount > 1) {
        console.log(`Width timeout after 2 retries`);
        return {buffer, renderStatus: "WIDTH_TIMEOUT"};
      };
      console.log('Width error, trying again: ', url);
      return renderContent(url, retryCount + 1, false);

    } else if (error.message.includes('Page.captureScreenshot timed out')) {
      if (retryCount > 1) {
        console.log(`Screenshot timeout after 2 retries`);
        return {buffer, renderStatus: "SCREENSHOT_TIMEOUT"};
      };
      console.log('Screenshot error, trying again: ', url);
      return renderContent(url, retryCount + 1, false);

    } else {
      throw new Error(`Unhandled puppeteer error: ${url}`, { cause: error });
    }
  }

  let endTime = performance.now();
  console.log('Browser acquisition time:', launchTime - startTime);
  console.log(`${url} Render time:`, endTime - launchTime);
  return {buffer, renderStatus};
}

// Create a standalone closeAll function that uses the browserPool

export { renderContent, browserPool };