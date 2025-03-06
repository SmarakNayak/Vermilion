import { chromium } from 'playwright';
import puppeteer from 'puppeteer';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:1080' : 'https://blue.vermilion.place/';

let playwrightBrowser;
let puppeteerBrowser;

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('Hello World!'),
    '/renderedContentPlaywright/:id': async req => {
      let ss = await renderContentPlaywright(apiBaseUrl + "/content/" + req.params.id);
      if (!ss) {
        return new Response('Error rendering content', { status: 404 });
      }
      return new Response(ss, {
        headers: { 'Content-Type': 'image/png' },
      });
    },
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

async function renderContentPlaywright(url) {
  let startTime = performance.now();
  if (!playwrightBrowser) {
    playwrightBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'], dumpio: true });
  }
  let launchTime = performance.now();
  const page = await playwrightBrowser.newPage();
  try {
    await page.setViewportSize({ width: 600, height: 600 });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    if (response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    console.log('Screenshot captured in memory.');
    let endTime = performance.now();
    console.log('Launch time:', launchTime - startTime);
    console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content:', error);
    return null;
  } finally {
    await page.close();
  }
}

async function renderContentPuppeteer(url) {
  let startTime = performance.now();
  if (!puppeteerBrowser) {
    puppeteerBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  }
  let launchTime = performance.now();
  const page = await puppeteerBrowser.newPage();
  try {
    await page.setViewport({ width: 600, height: 600 });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    // wait for idle network, animation frame and DOM mutation
    await Promise.all([
      page.waitForNetworkIdle({ timeout: 10000 }),
      page.waitForFunction(() => {
        return new Promise(resolve => {
          let lastFrameTime = performance.now();
          const checkIdle = () => {
            const now = performance.now();
            if (now - lastFrameTime > 500) {
              resolve(true);
            } else {
              lastFrameTime = now;
              requestAnimationFrame(checkIdle);
            }
          };
          requestAnimationFrame(checkIdle);
        });
      }, { timeout: 10000 }),
      page.waitForFunction(() => {
        return new Promise(resolve => {
          const observer = new MutationObserver(() => {
            clearTimeout(window.domIdleTimeout);
            window.domIdleTimeout = setTimeout(() => {
              observer.disconnect();
              resolve(true);
            }, 500);
          });
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }, { timeout: 10000 })
    ]);
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    console.log('Screenshot captured in memory.');
    let endTime = performance.now();
    console.log('Launch time:', launchTime - startTime);
    console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content:', error);
    return null;
  } finally {
    await page.close();
  }
}

// Shutdown function to clean up everything
async function shutdown() {
  console.log("Shutting down...");
  // Stop Bun server
  server.stop();
  console.log("Bun server stopped");
  // Close Puppeteer browser
  if (puppeteerBrowser) {
    await puppeteerBrowser.close();
    console.log("Puppeteer browser closed");
  }
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



// page.on('console', (msg) => {
//   console.log('console',msg);
// });
// page.on('pageerror', (msg) => {
//   console.log('pageerror',msg);
// });
// page.on('requestfailed', (request) => {
//   console.log('requestfailed',request.url(), request.failure().errorText);
// }
// );
// page.on('response', (response) => {
//   console.log('response',response.url(), response.status());
// }
// );
// page.on('request', (request) => {
//   console.log('request',request.url());
// }
// );
// page.on('load', () => {
//   console.log('Page loaded');
// }
// );
// page.on('domcontentloaded', () => {
//   console.log('DOM content loaded');
// }
// );
// page.on('close', () => {
//   console.log('Page closed');
// }
// );
// page.on('error', (error) => {
//   console.log('error', error);
// }
// );