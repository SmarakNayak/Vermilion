const { createProxyMiddleware } = require('http-proxy-middleware');

//This redirects all local dev api calls to vermilion.place
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://vermilion.place/',
      changeOrigin: true,
    })
  );
};