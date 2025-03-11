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
    try {
      for (let i = 0; i < POOL_SIZE; i++) {
        const browser = await puppeteer.launch({ 
          headless: true, 
          args: ['--no-sandbox', '--disable-dev-shm-usage'] 
        });
        this.browsers.push(browser);
      }
      console.log("Browser pool ready");
    } catch (err) {
      this.initialized = false;
      console.error("Browser pool failed to start:", err);
      return;
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

async function renderContentPuppeteer(url) {
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
    console.error('Error rendering content for: ', url, error);
    return null;
  } finally {
    await page.close();
    // Release the browser back to the pool
    browserPool.releaseBrowser(browser);
  }
}

async function captureStableScreenshot(page, url, maxWait = 10000) {
  const threshold = 0.1; // Similarity threshold
  const interval = 100; // Check every 100 ms
  let activeRequests = 0;
  let elapsed = 0;
  page.on('request', () => activeRequests++);
  page.on('response', () => activeRequests--);

  let activeRequestArr = [];
  let diffArr = [];
  let imageArr = [];

  // Capture initial (empty) screenshot
  let count = 0;
  await page.setViewport({ width: 600, height: 600 });
  let buffer = Buffer.from(await page.screenshot({ fullPage: true }));
  imageArr.push(await Jimp.read(buffer));
  //Bun.file(`ss_${count}.png`).write(buffer);

  // capture screenshot after load
  count++;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  if (response.status() !== 200) {
    throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
  }
  activeRequestArr.push(activeRequests);
  buffer = Buffer.from(await page.screenshot({ fullPage: true }));
  imageArr.push(await Jimp.read(buffer));
  //Bun.file(`ss_${count}.png`).write(buffer);

  while (elapsed < maxWait) {
    count++;
    await Bun.sleep(interval);
    activeRequestArr.push(activeRequests);
    buffer = Buffer.from(await page.screenshot({ fullPage: true }));
    //Bun.file(`ss_${count}.png`).write(buffer);
    imageArr.push(await Jimp.read(buffer));
    const orginalDiff = diff(imageArr[imageArr.length-1], imageArr[0], 0.1).percent;
    const recentDiff = diff(imageArr[imageArr.length-1], imageArr[imageArr.length - 2], 0.1).percent;
    diffArr.push({original: orginalDiff, recent: recentDiff});

    // check that screenshot is not similar to orginal, but similar to previous
    // also check that there were no active requests for current and previous screenshot
    if (orginalDiff > threshold && recentDiff < threshold && activeRequestArr[activeRequestArr.length-1] <= 0 && activeRequestArr[activeRequestArr.length-2] <= 0) {
      //console.log(diffArr);
      return buffer; // Stable enough
    }
    elapsed += interval;
    if (count > 50) {
      console.error('Failed to stabilize screenshot after 50 attempts for:', url);
      console.log(diffArr);
      break;
    }
  }
  return buffer; // Fallback to last screenshot
}

// Export the browser pool
export default renderContentPuppeteer;