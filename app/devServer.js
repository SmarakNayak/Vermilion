import homepage from "./index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/*": homepage,
    '/api/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/content/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/search_api/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/bun/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/r/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/blockheight/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/blockhash/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    },
    '/blocktime/*': async req => {
      return proxyRequest(req, 'https://blue.vermilion.place');
    }
  }
});

async function proxyRequest(req, targetHost) {
  const url = new URL(req.url);
  const targetUrl = `${targetHost}${url.pathname}${url.search}`;  
  try {
    // Forward the original request to the target server
    let response = await fetch(targetUrl, {
      // disable decompression - otherwise it will be decompressed here and again when sent to the client
      decompress: false, 
    });
    return response;
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    return new Response(`Proxy error: ${error.message}`, { status: 502 });
  }
}