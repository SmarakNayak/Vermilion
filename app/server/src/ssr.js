import { browserPool } from "./puppeteer";

async function addInscriptionPreviewsToHtml({
  inscriptionMetadata,
  host = "vermilion.place",
  filePath = '../dist/index.html'
}) {
  let hydratedHtml;
  const options = {
    title: `Inscription ${numberWithCommas(inscriptionMetadata.number)} | Vermilion`,
    siteUrl: `https://${host}/inscription/${inscriptionMetadata.number}`,
    filePath: filePath
  };
  if (['image', 'html'].includes(inscriptionMetadata.content_category)) {
    options.imageUrl = `https://${host}/bun/inscription_card/${inscriptionMetadata.id}`;
  };
  
  hydratedHtml = await rewriteMetaTagsFromFile(options);
  return hydratedHtml;
}

async function rewriteMetaTagsFromFile({
  title = "Vermilion - Bitcoin Ordinals Explorer",
  description = "Discover bitcoin. Discover ordinals.",
  imageUrl = "https://vermilion.place/vermilion.place_twitter_800_418.png",
  siteUrl = "https://vermilion.place",
  filePath = '../dist/index.html'
} = {}) {
  try {
    // Read the HTML file using Bun's file API
    const htmlContent = await Bun.file(filePath).text();

    // Create a simple parser to update meta tags
    const updatedHtml = htmlContent
      .replace(
        /<meta name="description" content="[^"]*"/i,
        `<meta name="description" content="${description}"`
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*"/i,
        `<meta name="twitter:title" content="${title}"`
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*"/i,
        `<meta name="twitter:description" content="${description}"`
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*"/i,
        `<meta name="twitter:image" content="${imageUrl}"`
      )
      .replace(
        /<meta property="og:title" content="[^"]*"/i,
        `<meta property="og:title" content="${title}"`
      )
      .replace(
        /<meta property="og:description" content="[^"]*"/i,
        `<meta property="og:description" content="${description}"`
      )
      .replace(
        /<meta property="og:image" content="[^"]*"/i,
        `<meta property="og:image" content="${imageUrl}"`
      )
      .replace(
        /<meta property="og:url" content="[^"]*"/i,
        `<meta property="og:url" content="${siteUrl}"`
      )
      .replace(
        /<title>.*<\/title>/i,
        `<title>${title}</title>`
      )
      .replace(
        '<!-- Social sharing - Twitter -->',
        '<!-- Social sharing - Twitter -->\n<meta name="twitter:card" content="summary" />\n<meta name="twitter:image" content="https://blue.vermilion.place/verm-black-512.png"'
      );

    return updatedHtml;
  } catch (error) {
    console.error('Error processing HTML file:', error);
    throw error;
  }
}

async function renderInscriptionCard({inscriptionMetadata, host = "vermilion.place"}) {
  try {
    let t0 = performance.now();
    let browser = await browserPool.getBrowser();
    let page = await browser.newPage();
    await page.setViewport({ width: 800, height: 418, deviceScaleFactor: 1 });
    let t1 = performance.now();
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <body style="width: 800px; height: 418px; margin: 0px; padding: 0px;">
          <div style="width: 800px; height: 418px; padding: 45px; display: flex; justify-content: center; align-items: center; box-sizing: border-box; background-color: lightgrey;">
            <img src="https://${host}/bun/rendered_content/${inscriptionMetadata.id}" style="max-width: 100%; max-height: 100%;"/>
          </div>
        </body>
      </html>`,
      { waitUntil: 'load' }
    );
    let t2 = performance.now();
    let buffer = await page.screenshot();
    let t3 = performance.now();
    await page.close();
    browserPool.releaseBrowser(browser);
    let t4 = performance.now();
    console.log('Init time:', t1 - t0);
    console.log('Render time:', t2 - t1);
    console.log('Screenshot time:', t3 - t2);
    console.log('Close time:', t4 - t3);
    console.log('Total time:', t4 - t0);
    return buffer;
  } catch (error) {
    console.error('Error rendering inscription card, returning fallback', error);
    let fallback = Bun.file('../dist/vermilion.place_twitter_800_418.png');
    return Buffer.from(await fallback.arrayBuffer());
  }
}

//add commas to a number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export { addInscriptionPreviewsToHtml, renderInscriptionCard };