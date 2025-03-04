import { serve } from 'bun';
import { DOMParser } from 'bun-html-dom';

// Configuration
const PORT = 3002;
const ORD_API_URL = 'http://127.0.0.1:1081';
const INSCRIPTION_ENDPOINT = '/inscription';
const CONTENT_PREFIX = '/content/';

// Cache for inscription content to reduce repeated fetches
const contentCache = new Map();

/**
 * Fetches an inscription's content by ID
 * @param {string} id - Inscription ID
 * @param {string} query - Query parameters
 * @returns {Promise<{content: string|Uint8Array, contentType: string}|null>}
 */
async function fetchInscriptionContent(id, query = '') {
  const cacheKey = `${id}${query}`;
  
  // Check cache first
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey);
  }
  
  try {
    const url = `${ORD_API_URL}${INSCRIPTION_ENDPOINT}/${id}${query}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching inscription ${id}: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    let content;
    
    // Handle binary content
    if (contentType && contentType.startsWith('image/')) {
      content = new Uint8Array(await response.arrayBuffer());
    } else {
      content = await response.text();
    }
    
    const result = { content, contentType };
    
    // Cache the result
    contentCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching inscription ${id}:`, error);
    return null;
  }
}

/**
 * Processes HTML content by inlining all dependencies
 * @param {string} html - The HTML content
 * @param {number} depth - Current recursion depth
 * @returns {Promise<string>} - Processed HTML with inlined dependencies
 */
async function processHtml(html, depth = 0) {
  // Prevent infinite recursion
  if (depth > 5) {
    console.warn('Maximum recursion depth reached');
    return html;
  }
  
  // Parse the HTML
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  
  // Process different types of dependencies
  await Promise.all([
    processScripts(document, depth),
    processStylesheets(document, depth),
    processImages(document, depth),
    processIframes(document, depth)
  ]);
  
  // Return the processed HTML
  return document.documentElement.outerHTML;
}

/**
 * Process script tags with src attributes
 */
async function processScripts(document, depth) {
  const scripts = document.querySelectorAll('script[src]');
  
  const promises = Array.from(scripts).map(async (script) => {
    const src = script.getAttribute('src');
    
    if (src && src.startsWith(CONTENT_PREFIX)) {
      const id = src.slice(CONTENT_PREFIX.length);
      const result = await fetchInscriptionContent(id);
      
      if (result && (result.contentType.includes('javascript') || result.contentType.includes('text/plain'))) {
        script.removeAttribute('src');
        script.textContent = result.content;
      }
    }
  });
  
  await Promise.all(promises);
}

/**
 * Process stylesheet links
 */
async function processStylesheets(document, depth) {
  const links = document.querySelectorAll('link[rel="stylesheet"][href]');
  
  const promises = Array.from(links).map(async (link) => {
    const href = link.getAttribute('href');
    
    if (href && href.startsWith(CONTENT_PREFIX)) {
      const id = href.slice(CONTENT_PREFIX.length);
      const result = await fetchInscriptionContent(id);
      
      if (result && (result.contentType.includes('text/css') || result.contentType.includes('text/plain'))) {
        const style = document.createElement('style');
        style.textContent = result.content;
        link.parentNode.replaceChild(style, link);
      }
    }
  });
  
  await Promise.all(promises);
}

/**
 * Process image tags
 */
async function processImages(document, depth) {
  const images = document.querySelectorAll('img[src]');
  
  const promises = Array.from(images).map(async (img) => {
    const src = img.getAttribute('src');
    
    if (src && src.startsWith(CONTENT_PREFIX)) {
      const id = src.slice(CONTENT_PREFIX.length);
      const result = await fetchInscriptionContent(id);
      
      if (result && result.contentType.startsWith('image/')) {
        const base64 = Buffer.from(result.content).toString('base64');
        img.setAttribute('src', `data:${result.contentType};base64,${base64}`);
      }
    }
  });
  
  await Promise.all(promises);
}

/**
 * Process iframes
 */
async function processIframes(document, depth) {
  const iframes = document.querySelectorAll('iframe[src]');
  
  const promises = Array.from(iframes).map(async (iframe) => {
    const src = iframe.getAttribute('src');
    
    if (src && src.startsWith(CONTENT_PREFIX)) {
      const id = src.slice(CONTENT_PREFIX.length);
      const result = await fetchInscriptionContent(id);
      
      if (result && result.contentType.includes('text/html')) {
        // Recursively process the iframe content
        const processedHtml = await processHtml(result.content, depth + 1);
        iframe.removeAttribute('src');
        iframe.setAttribute('srcdoc', processedHtml);
      }
    }
  });
  
  await Promise.all(promises);
}

// Main server
const server = serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    
    // Only handle content requests
    if (url.pathname.startsWith(CONTENT_PREFIX)) {
      const inscriptionId = url.pathname.slice(CONTENT_PREFIX.length);
      
      try {
        console.log(`Processing inscription: ${inscriptionId}`);
        
        // Fetch the requested inscription
        const result = await fetchInscriptionContent(inscriptionId, url.search);
        
        if (!result) {
          return new Response('Inscription not found', { status: 404 });
        }
        
        // If it's HTML, process it
        if (result.contentType.includes('text/html')) {
          const processedHtml = await processHtml(result.content);
          
          return new Response(processedHtml, {
            headers: { 
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        } 
        // For non-HTML content, return as-is
        else {
          return new Response(result.content, {
            headers: { 
              'Content-Type': result.contentType,
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch (error) {
        console.error('Error processing inscription:', error);
        return new Response('Error processing inscription', { status: 500 });
      }
    }
    
    return new Response('Not found', { status: 404 });
  },
});

console.log(`HTML SSR server running at http://localhost:${PORT}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});