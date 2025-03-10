import { SQL, sql } from 'bun';
import { parse } from 'yaml';
import puppeteer from 'puppeteer';
import { Jimp, diff } from 'jimp';

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

// Page Pool Configuration
const POOL_SIZE = isProd ? 20 : 5; // Number of pages in the pool
const pagePool = {
  browser: null,
  page_count: 0,
  initialized: false,

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log(`Initializing browser... cleaning up any existing Chrome processes`);
    const cleanup = Bun.spawn(['pkill', '-f', 'chrome'], {
      stdout: 'inherit',
      stderr: 'inherit',
    });
    await cleanup.exited;

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      console.log("Browser ready");
    } catch (err) {
      this.initialized = false;
      console.error("Browser failed to start:", err);
      await this.closeAll();
    }
  },

  async getPage() {
    if (!this.initialized) await this.initialize();
    return new Promise(resolve => {
      const check = () => {
        if (this.page_count < POOL_SIZE) {
          this.page_count++;
          resolve(this.browser.newPage());
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  async releasePage(page) {
    await page.close();    
    this.page_count--;
  },

  async closeAll() {
    console.log("Closing page pool...");
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page_count = 0;
      this.initialized = false;
    }
    console.log("Page pool closed");
  },
};

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained'),
    '/rendered_content/:id': async req => {
      let metadata = await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson = await metadata.json();
      return getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive);
    },
    '/rendered_content_number/:number': async req => {
      let metadata = await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
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
  },
});

async function renderContentPuppeteer(url) {
  let startTime = performance.now();

  // Get a page from the pool
  const page = await pagePool.getPage();
  let launchTime = performance.now();

  try {
    const screenshotBuffer = await captureStableScreenshot(page, url);
    let endTime = performance.now();
    console.log('Page acquisition time:', launchTime - startTime);
    console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content for:', url, error);
    return null;
  } finally {
    pagePool.releasePage(page);
  }
}

async function captureStableScreenshot(page, url, maxWait = 10000) {
  console.log('Capturing stable screenshot for:', url);
  const threshold = 0.1;
  const interval = 100;
  let activeRequests = 0;
  let elapsed = 0;

  // Reset event listeners to avoid double-counting across uses
  page.removeAllListeners('request');
  page.removeAllListeners('response');
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

  // Capture screenshot after load
  count++;
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('Page load status:', response.status());
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
    console.log('Diff:', orginalDiff, recentDiff);

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

async function getRenderedContentResponse(id, content_type, is_recursive) {
  if (content_type?.startsWith('text/html') || (content_type?.startsWith('image/svg') && is_recursive)) {
    let ss = await renderContentPuppeteer(apiBaseUrl + "/content/" + id);
    if (!ss) return new Response('Error rendering content', { status: 404 });
    return new Response(ss, {
      headers: { 'Content-Type': 'image/png' },
    });
  } else {
    let content = await fetch(apiBaseUrl + "/content/" + id, {
      decompress: false,
    });
    if (!content.ok) return new Response('Content fetch failed', { status: content.status });
    return content;
  }
}

// Shutdown function
async function shutdown() {
  console.log("Shutting down...");
  server.stop();
  console.log("Bun server stopped");
  await pagePool.closeAll();
  console.log("Page pool closed");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

//Initialize the page pool on startup
pagePool.initialize().catch(err => {
  console.error("Failed to initialize page pool:", err);
});