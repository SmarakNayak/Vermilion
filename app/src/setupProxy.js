const { createProxyMiddleware } = require('http-proxy-middleware');

//This redirects all local dev api calls to vermilion.place
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://blue.vermilion.place/',
      changeOrigin: true,
      // target: 'http://localhost:2081',
      // pathRewrite: {
      //   '^/api/': '/', // remove base path on localhost
      // },
    })
  );
  app.use(
    '/content',
    createProxyMiddleware({
      target: 'https://blue.vermilion.place/',
      changeOrigin: true,
      // target: 'http://localhost:2081',
      // pathRewrite: {
      //   '^/content/': '/inscription/', // switch content for inscription on localhost
      // },
    })
  );
  app.use(
    '/search_api',
    createProxyMiddleware({
      target: 'https://blue.vermilion.place/',
      changeOrigin: true,
      // target: 'http://localhost:4080',
      // pathRewrite: {
      //   '^/search_api/': '/', // remove base path on localhost
      // },
    })
  );
};