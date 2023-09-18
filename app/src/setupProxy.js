const { createProxyMiddleware } = require('http-proxy-middleware');

//This redirects all local dev api calls to vermilion.place
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://vermilion.place/',
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
      target: 'https://vermilion.place/',
      changeOrigin: true,
      // target: 'http://localhost:2081',
      // pathRewrite: {
      //   '^/content/': '/inscription/', // remove base path on localhost
      // },
    })
  );
};