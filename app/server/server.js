import { SQL, sql } from 'bun';
import { parse } from 'yaml';
import puppeteer from 'puppeteer';
import {Jimp, diff} from 'jimp';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';
const configFile = Bun.file(`${process.env.HOME}/ord.yaml`);
const config = parse(await configFile.text());
process.env.POSTGRES_URL = `postgres://${config.db_user}:${config.db_password}@${config.db_host}:5432/${config.db_name}`;
const db = new SQL({
  url: `postgres://${config.db_user}:${config.db_password}@${config.db_host}:5432/${config.db_name}`,
  hostname: config.db_host,
  database: config.db_name,
  user: config.db_user,
  password: config.db_password
});

// Browser Pool Configuration
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

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained'),
    '/rendered_content/:id': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson = await metadata.json();
      return getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive);  
    },
    '/rendered_content_number/:number': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
      let metadataJson = await metadata.json();
      return getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive);     
    },
    '/block_icon/:block': async req => {
      const [row] = await sql`SELECT id, content_type, is_recursive FROM ordinals 
         WHERE genesis_height = ${req.params.block} 
         AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
         ORDER BY content_length DESC NULLS LAST
         LIMIT 1`;
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return getRenderedContentResponse(row.id, row.content_type, row.is_recursive);     
    },
    '/sat_block_icon/:block': async req => {
      const [row] = await sql`SELECT id, content_type, is_recursive FROM ordinals 
         WHERE sat IN (SELECT sat FROM sat WHERE block = ${req.params.block})
         AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
         ORDER BY content_length DESC NULLS LAST
         LIMIT 1`;
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return getRenderedContentResponse(row.id, row.content_type, row.is_recursive);      
    },
  }
});

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
  // Initialize timing structure
  const startTime = performance.now();
  const timings = {
    total: 0,
    setup: 0,
    initialScreenshot: 0,
    navigation: 0,
    postNavScreenshot: 0,
    iterations: []
  };
  
  const threshold = 0.1; // Similarity threshold
  const interval = 100; // Check every 100 ms
  let activeRequests = 0;
  let elapsed = 0;
  
  // Setup timing start
  const setupStart = performance.now();
  page.on('request', () => activeRequests++);
  page.on('response', () => activeRequests--);
  await page.setViewport({ width: 600, height: 600 });
  timings.setup = performance.now() - setupStart;

  let activeRequestArr = [];
  let diffArr = [];
  let imageArr = [];

  // Capture initial (empty) screenshot
  let count = 0;
  const initialScreenshotStart = performance.now();
  let buffer = Buffer.from(await page.screenshot({ fullPage: true }));
  const initialScreenshotCaptured = performance.now();
  imageArr.push(await Jimp.read(buffer));
  timings.initialScreenshot = performance.now() - initialScreenshotStart;
  timings.initialScreenshotCapture = initialScreenshotCaptured - initialScreenshotStart;
  timings.initialImageProcessing = performance.now() - initialScreenshotCaptured;

  // Navigation and post-navigation screenshot
  count++;
  const navigationStart = performance.now();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  if (response.status() !== 200) {
    throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
  }
  const navigationComplete = performance.now();
  timings.navigation = navigationComplete - navigationStart;
  
  // Post-navigation screenshot
  const postNavStart = performance.now();
  activeRequestArr.push(activeRequests);
  buffer = Buffer.from(await page.screenshot({ fullPage: true }));
  const postNavCaptured = performance.now();
  imageArr.push(await Jimp.read(buffer));
  timings.postNavScreenshot = performance.now() - postNavStart;
  timings.postNavCapture = postNavCaptured - postNavStart;
  timings.postNavProcessing = performance.now() - postNavCaptured;

  while (elapsed < maxWait) {
    count++;
    const iterationStart = performance.now();
    const iterationTiming = {
      iteration: count - 2,
      total: 0,
      sleep: 0,
      screenshot: 0,
      processing: 0,
      diffCalculation: 0,
      activeRequests: activeRequests
    };
    
    const sleepStart = performance.now();
    await Bun.sleep(interval);
    iterationTiming.sleep = performance.now() - sleepStart;
    
    activeRequestArr.push(activeRequests);
    
    const screenshotStart = performance.now();
    buffer = Buffer.from(await page.screenshot({ fullPage: true }));
    const screenshotComplete = performance.now();
    iterationTiming.screenshot = screenshotComplete - screenshotStart;
    
    const processingStart = performance.now();
    imageArr.push(await Jimp.read(buffer));
    iterationTiming.processing = performance.now() - processingStart;
    
    const diffStart = performance.now();
    const orginalDiff = diff(imageArr[imageArr.length-1], imageArr[0], 0.1).percent;
    const recentDiff = diff(imageArr[imageArr.length-1], imageArr[imageArr.length - 2], 0.1).percent;
    iterationTiming.diffCalculation = performance.now() - diffStart;
    
    diffArr.push({original: orginalDiff, recent: recentDiff});
    
    iterationTiming.total = performance.now() - iterationStart;
    timings.iterations.push(iterationTiming);

    // check that screenshot is not similar to orginal, but similar to previous
    // also check that there were no active requests for current and previous screenshot
    if (orginalDiff > threshold && recentDiff < threshold && 
        activeRequestArr[activeRequestArr.length-1] <= 0 && 
        activeRequestArr[activeRequestArr.length-2] <= 0) {
      
      // Complete timing calculation
      timings.total = performance.now() - startTime;
      
      // Log timing summary
      console.log(`Screenshot stabilized for ${url} after ${count-2} iterations in ${timings.total.toFixed(2)}ms`);
      console.log('Timing breakdown:', {
        setup: timings.setup.toFixed(2) + 'ms',
        initialScreenshot: timings.initialScreenshot.toFixed(2) + 'ms',
        navigation: timings.navigation.toFixed(2) + 'ms',
        postNavScreenshot: timings.postNavScreenshot.toFixed(2) + 'ms',
        iterations: timings.iterations.length,
        avgIterationTime: (timings.iterations.reduce((sum, it) => sum + it.total, 0) / timings.iterations.length).toFixed(2) + 'ms',
        avgScreenshotTime: (timings.iterations.reduce((sum, it) => sum + it.screenshot, 0) / timings.iterations.length).toFixed(2) + 'ms',
        avgProcessingTime: (timings.iterations.reduce((sum, it) => sum + it.processing, 0) / timings.iterations.length).toFixed(2) + 'ms',
        avgDiffTime: (timings.iterations.reduce((sum, it) => sum + it.diffCalculation, 0) / timings.iterations.length).toFixed(2) + 'ms',
      });
      
      return buffer; // Stable enough
    }
    
    elapsed += interval;
    if (count > 50) {
      // Complete timing calculation
      timings.total = performance.now() - startTime;
      
      console.error(`Failed to stabilize screenshot after 50 attempts for: ${url} (${timings.total.toFixed(2)}ms)`);
      console.log('Final diff values:', diffArr.slice(-5));
      console.log('Timing data:', {
        setup: timings.setup.toFixed(2) + 'ms', 
        initialScreenshot: timings.initialScreenshot.toFixed(2) + 'ms',
        navigation: timings.navigation.toFixed(2) + 'ms',
        iterations: timings.iterations.length,
        totalTime: timings.total.toFixed(2) + 'ms'
      });
      break;
    }
  }
  
  // Timeout case
  timings.total = performance.now() - startTime;
  console.log(`Screenshot capture timed out for ${url} after ${timings.total.toFixed(2)}ms`);
  
  return buffer; // Fallback to last screenshot
}

async function getRenderedContentResponse(id, content_type, is_recursive) {
  if (content_type?.startsWith('text/html') || (content_type?.startsWith('image/svg') && is_recursive)) {
    let ss = await renderContentPuppeteer(apiBaseUrl + "/content/" + id);
    if (!ss) return new Response('Error rendering content', { status: 404 });
    return new Response(ss, {
      headers: { 'Content-Type': 'image/png' },
    });
  } else {
    let content = await fetch(apiBaseUrl + "/content/" + id, {
      decompress: false
    });
    if (!content.ok) return new Response('Content fetch failed', { status: content.status });
    return content;
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
  console.log("Browser pool closed");
  
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