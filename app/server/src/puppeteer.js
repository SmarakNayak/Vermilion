import puppeteer from 'puppeteer';
import { Jimp, diff } from 'jimp';

// Browser Pool Configuration
const isProd = process.env.NODE_ENV === 'production';
const POOL_SIZE = isProd ? 20 : 5;// Number of browser instances in the pool
const browserPool = {
  browsers: [],
  inUse: new Set(),
  initialized: false,
  initializing: false,

  async launchBrowser() {
    return await puppeteer.launch({
      headless: true,
      protocolTimeout: 5000,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      args: ['--disable-dev-shm-usage']
    });
  },
  
  async initialize() {
    if (this.initialized) return;
    if (this.initializing) return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (this.initialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
    this.initializing = true;
    
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
        const browser = await this.launchBrowser();
        this.browsers.push(browser);
      }
      console.log("Browser pool ready");
      this.initialized = true;
      this.initializing = false;
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

  async killAndReplaceBrowser(browser) {
    try {
      console.log("Attempting to kill and replace browser...");

      // Check if the browser is in the pool
      const browserIndex = this.browsers.indexOf(browser);
      if (browserIndex === -1) {
        console.log("Browser not found in pool, skipping...");
        return;
      }
      this.inUse.delete(browser);
      await Promise.race([
        browser.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Browser close timeout")), 5000)
        ),
      ]);
      console.log("Browser closed gracefully");
    } catch (err) {
      if (browser.process()) {
        console.log("Failed to close browser gracefully - force killing browser process...");
        let killed = await browser.process().kill("SIGKILL");
        if (killed) {
          console.log("Browser process killed");
        } else {
          throw new Error("Failed to kill browser process", { cause: err });
        }
      } else {
        throw new Error("Failed to close browser gracefully, cannot force kill as no browser process found", { cause: err });
      }
    } finally {
      // Remove the browser from the pool
      this.browsers = this.browsers.filter(b => b !== browser);

      // Launch a new browser to replace it
      try {
        const newBrowser = await this.launchBrowser();
        this.browsers.push(newBrowser);
        console.log("New browser added to pool");
      } catch (err) {
        throw new Error("Failed to launch replacement browser", { cause: err });
        // If replacement fails, you might want to retry or handle differently
      }
    }
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
    page.on('dialog', async dialog => {
      if (page.isClosed()) return;
      try {
        await dialog.accept();
      } catch (error) {
        if (error.name !== 'TargetCloseError') {
          console.log('Dialog accept error:', error);
          await dialog.dismiss().catch(err => console.log('Dialog dismiss error:', err));
        }
      }
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
      await page.close();
      browserPool.releaseBrowser(browser);
      console.log(`Page load failed with status: ${response.status()} ${response.statusText()} for: ${url}`);
      
      if (retryCount > 1) {
        console.log(`2 retries failed, returning early`);
        return {buffer, renderStatus: "PAGE_LOAD_FAILED_" + response.status()};
      }
      if ([400, 401, 403, 404, 405, 410, 418, 451].includes(response.status())) {
        console.log("bad status code, returning early");
        return {buffer, renderStatus: "PAGE_LOAD_FAILED_" + response.status()};
      } else if ([408, 422, 429, 500, 502, 503, 504].includes(response.status())) {
        console.log("handleable status code, retrying");
        return renderContent(url, retryCount + 1, fullPage);
      } else {
        console.log("unknown status code, retrying");
        return renderContent(url, retryCount + 1, fullPage);
      }
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
    try {        
      await page.close();
      browserPool.releaseBrowser(browser);
    } catch (err) {
      if (err.message.includes('Target.closeTarget timed out')) {
        process.stdout.write('Page close timed out - ');
        await browserPool.killAndReplaceBrowser(browser);
      } else {
        throw new Error(`Error closing page for: ${url}`, { cause: err });
      }
    }

    if (error.message.includes('Navigation timeout')) {
      if (retryCount > 1) {
        console.log(`Navigation timeout after 2 retries`);
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

    } else if (error.message.includes('Unable to capture screenshot')) {
      if (retryCount > 1) {
        console.log(`Screenshot timeout after 2 retries`);
        return {buffer, renderStatus: "SCREENSHOT_UNABLE"};
      };
      console.log('Screenshot error, trying again: ', url);
      return renderContent(url, retryCount + 1, false);

    } else if (error.message.includes('net::ERR_ABORTED')) {
      if (retryCount > 1) {
        console.log(`Network error after 2 retries`);
        return {buffer, renderStatus: "NETWORK_ABORTED"};
      };
      console.log('Network aborted, trying again: ', url);
      return renderContent(url, retryCount + 1, false);

    } else {
      throw new Error(`Unhandled puppeteer error: ${url}`, { cause: error });
    }
  }

  let endTime = performance.now();
  console.log(url);
  console.log('Browser acquisition time:', launchTime - startTime);
  console.log(`Render time:`, endTime - launchTime);
  return {buffer, renderStatus};
}

export { renderContent, browserPool };