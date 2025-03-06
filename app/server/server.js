import { chromium } from 'playwright';
//import puppeteer from 'puppeteer';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:1081' : 'https://blue.vermilion.place/api';

let browser;

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
      if (!browser) {
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
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
    '/test': async req => {
      if (!browser) {
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
      }
      let htmlResponse = await fetch(apiBaseUrl + '/inscription/4b31771df21656d2a77e6fa18720a6dd94b04510b9065a7c67250d5c89ad2079i0', {
        decompress: false,
      });

      let htmlContent = await htmlResponse.text();
      const prefetchLinks = await extractPrefetchLinks(apiBaseUrl + '/inscription/4b31771df21656d2a77e6fa18720a6dd94b04510b9065a7c67250d5c89ad2079i0');      
      // Join prefetch links with newlines and inject into head section
      let modifiedHtml = appendPrefetchLinks(htmlContent, prefetchLinks);
      
      console.log(modifiedHtml);
      return new Response(modifiedHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  }
});

// This renders the content using Playwright, capturing all /content requests made
// we can then inject the prefetch links into the head section
// saving the client side waterfall as all requests are made in parallel
async function extractPrefetchLinks(url) {
  const page = await browser.newPage();
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
  const page = await browser.newPage();
  try {
    await page.route('**/*.html', async route => {
      const res = await fetch(route.request().url());
      const content = await res.text();
      await route.fulfill({ body: content, contentType: 'text/html' });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('Screenshot saved as debug-screenshot.png.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await page.content();
  } catch (error) {
    return `<p>Error: ${error.message}</p>`;
  } finally {
    await page.close();
  }
}