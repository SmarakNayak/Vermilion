import homepage from "./index.html";

const useLocalSocial = process.argv.includes('--local-social');
const socialTarget = useLocalSocial ? 'http://localhost:1082' : 'https://green.vermilion.place/bun/';
const effectTarget = useLocalSocial ? 'http://localhost:1083' : 'https://green.vermilion.place/effect/';

const server = Bun.serve({
  port: 3000,
  development: {
    hmr: true,
    console: true
  },
  routes: {
    "/*": homepage,
    '/api/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/content/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/search_api/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/bun/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/bun/social/*': {
      GET: async req => {
        return proxyRequest(req, socialTarget, '/social/*');
      },
      POST: async req => {
        return proxyRequest(req, socialTarget, '/social/*');
      }
    },
    '/effect/*': {
      GET: async req => {
        return proxyRequest(req, effectTarget, false, '/effect');
      },
      POST: async req => {
        return proxyRequest(req, effectTarget, false, '/effect');
      },
      PUT: async req => {
        return proxyRequest(req, effectTarget, false, '/effect');
      },
      DELETE: async req => {
        return proxyRequest(req, effectTarget, false, '/effect');
      }
    },
    '/r/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/blockheight/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/blockhash/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    },
    '/blocktime/*': async req => {
      return proxyRequest(req, 'https://green.vermilion.place');
    }
  },
  fetch(req) {
    console.log(`Received request for ${req.url} - Not Found`);
    return new Response("Not Found", { status: 404 });
  }
});

async function proxyRequest(req, targetHost, rewrite, strip) {
  let url = new URL(req.url);
  let path = url.pathname;

  // strip prefix if specified
  if (strip && path.startsWith(strip)) {
    path = path.slice(strip.length);
    if (!path.startsWith('/')) path = '/' + path;
  }

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
  //console.log(`Proxying request to: ${targetUrl}`);

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
      keepalive: false // Disable keepalive to avoid 400 issues with chrome
    });
    return response;
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    return new Response(`Proxy error: ${error.message}`, { status: 502 });
  }
}

console.log(`🚀 Server running at ${server.url}`);