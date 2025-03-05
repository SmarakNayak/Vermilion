import puppeteer from 'puppeteer';

let browser;

Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('Hello World!'),
    '/content/:id': async req => {
      const url = new URL(req.url)
      let searchParams = url.searchParams;
      searchParams.delete('vermilion_ssr');
      console.log('https://blue.vermilion.place/api/inscription/' + req.params.id + url.search);
      return await fetchContent(req.params.id, url.search);
    },
    '/test': async req => {
      if (!browser) {
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }

      const renderedContent = await renderContentWithBrowser('https://blue.vermilion.place/content/4b31771df21656d2a77e6fa18720a6dd94b04510b9065a7c67250d5c89ad2079i0');
      console.log(renderedContent);
      return new Response(renderedContent, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  }
});

async function fetchContent(id, search) {
  const res = await fetch('https://blue.vermilion.place/api/inscription/' + id + search);
  return res;
}

async function renderContentWithBrowser(url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    return await page.content();
  } catch (error) {
    console.error(`Failed to render ${url}: ${error}`);
    return '<p>Error loading content</p>';
  } finally {
    await page.close();
  }
}