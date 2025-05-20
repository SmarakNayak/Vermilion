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
    '/bun/social/*': {
      GET: async req => {
        return proxyRequest(req, 'https://blue.vermilion.place');
        //return proxyRequest(req, 'localhost:1082',  '/social/*');
      },
      POST: async req => {
        return proxyRequest(req, 'https://blue.vermilion.place');
        //return proxyRequest(req, 'localhost:1082',  '/social/*');
      }
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
  },
  fetch(req) {
    console.log(`Received request for ${req.url} - Not Found`);
    return new Response("Not Found", { status: 404 });
  }
});

async function proxyRequest(req, targetHost, rewrite) {
  const url = new URL(req.url);
  let path = url.pathname;

  // handle wildcard in rewrite
  if (rewrite) {
    if (rewrite.includes('*')) {
      const [prefix, suffix] = rewrite.split('*');

      let wildcard = '';
      const idx = path.indexOf(prefix);
      if (idx !== -1) {
        wildcard = path.slice(idx + prefix.length);
      }
      // strip off suffix if present
      if (suffix && wildcard.endsWith(suffix)) {
        wildcard = wildcard.slice(0, -suffix.length);
      }

      path = `${prefix}${wildcard}${suffix}`;
    } else {
      path = rewrite;
    }
  }

  const targetUrl = `${targetHost}${path}${url.search}`;

  // clone incoming headers and add auth
  const headers = new Headers();
  headers.set('Authorization', req.headers.get('Authorization') || '');
  headers.set('Cookie', req.headers.get('Cookie') || '');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      decompress: false,
    });
    return response;
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    return new Response(`Proxy error: ${error.message}`, { status: 502 });
  }
}

console.log(`🚀 Server running at ${server.url}`);