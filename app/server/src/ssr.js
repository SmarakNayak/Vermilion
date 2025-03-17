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
    options.imageUrl = `https://${host}/bun/rendered_content/${inscriptionMetadata.id}`;
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
      );

    return updatedHtml;
  } catch (error) {
    console.error('Error processing HTML file:', error);
    throw error;
  }
}

//add commas to a number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export { addInscriptionPreviewsToHtml };