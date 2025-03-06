import { chromium } from 'playwright';
import puppeteer from 'puppeteer';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:1081' : 'https://blue.vermilion.place/api';

let playwrightBrowser;
let puppeteerBrowser;

Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('Hello World!'),
    '/content/:id': async req => {
      const url = new URL(req.url)
      let searchParams = url.searchParams;

      // This should only trigger for recursive html, nginx will not route other requests here
      // We reroute just in case
      if (!searchParams.has('vermilion_ssr')) {
        let newHeaders = new Headers();
        newHeaders.set('accept-encoding', req.headers.get('accept-encoding') || 'identity');
        return fetch(apiBaseUrl + "/inscription/" + req.params.id + url.search, {
          headers: newHeaders,
          decompress: false, // Do not decompress response
        });
      }

      // Otherwise, remove the flag and continue
      searchParams.delete('vermilion_ssr');
      if (!playwrightBrowser) {
        playwrightBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
      }
      let newUrl = apiBaseUrl + "/inscription/" + req.params.id + url.search;
      let htmlResponse = await fetch(newUrl, {
        decompress: false,
      });
      let htmlContent = await htmlResponse.text();
      const prefetchLinks = await extractPrefetchLinks(newUrl);
      // Join prefetch links with newlines and inject into head section
      let modifiedHtml = appendPrefetchLinks(htmlContent, prefetchLinks);

      console.log(modifiedHtml);
      return new Response(modifiedHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    },
    '/renderedContentPlaywright/:id': async req => {
      let ss = await renderContentPlaywright(apiBaseUrl + "/inscription/" + req.params.id);
      if (!ss) {
        return new Response('Error rendering content', { status: 404 });
      }
      return new Response(ss, {
        headers: { 'Content-Type': 'image/png' },
      });
    },
    '/renderedContent/:id': async req => {
      let ss = await renderContentPuppeteer(apiBaseUrl + "/inscription/" + req.params.id);
      if (!ss) {
        return new Response('Error rendering content', { status: 404 });
      }
      return new Response(ss, {
        headers: { 'Content-Type': 'image/png' },
      });
    }
  }
});

// This renders the content using Playwright, capturing all /content requests made
// we can then inject the prefetch links into the head section
// saving the client side waterfall as all requests are made in parallel
async function extractPrefetchLinks(url) {
  const page = await playwrightBrowser.newPage();
  const contentLinks = new Set();

  await page.route('**/*', async route => {
    let path = new URL(route.request().url()).pathname;
    if (path.startsWith('/content')) {
      contentLinks.add(path);
    }
    await route.continue();
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  const prefetchLinks = Array.from(contentLinks).map(
    path => `<link rel="prefetch" href="${path}" />`
  );
  
  return prefetchLinks;
}

function appendPrefetchLinks(htmlContent, prefetchLinks) {
  const prefetchTags = prefetchLinks.join('\n    ');
  console.log(htmlContent);
  let modifiedHtml = htmlContent;
  if (htmlContent.includes('<head>')) {
    modifiedHtml = htmlContent.replace(
      '<head>',
      `<head>\n    ${prefetchTags}`
    );
  } else {
    modifiedHtml = `<!DOCTYPE html><html><head>\n    ${prefetchTags}\n</head><body>${htmlContent}</body></html>`;
  }
  console.log(modifiedHtml);
  return modifiedHtml;
}

// Can use this function for later, to take screenshots
async function renderContentPlaywright(url) {
  // let startTime = performance.now();
  if (!playwrightBrowser) {
    playwrightBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  }
  // let launchTime = performance.now();
  const page = await playwrightBrowser.newPage();
  try {
    await page.setViewportSize({ width: 600, height: 600 });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    // console.log('Screenshot captured in memory.');
    // let endTime = performance.now();
    // console.log('Launch time:', launchTime - startTime);
    // console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content:', error);
    return null;
  } finally {
    await page.close();
  }
}

async function renderContentPuppeteer(url) {
  // let startTime = performance.now();
  if (!puppeteerBrowser) {
    puppeteerBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  }
  // let launchTime = performance.now();
  const page = await puppeteerBrowser.newPage();
  try {
    await page.setViewport({ width: 600, height: 600 });
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response.status() !== 200) {
      throw new Error(`Page load failed with status: ${response.status()} ${response.statusText()}`);
    }
    await page.waitForNetworkIdle({ timeout: 10000 });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    // console.log('Screenshot captured in memory.');
    // let endTime = performance.now();
    // console.log('Launch time:', launchTime - startTime);
    // console.log('Render time:', endTime - launchTime);
    return screenshotBuffer;
  } catch (error) {
    console.error('Error rendering content:', error);
    return null;
  } finally {
    await page.close();
  }
}