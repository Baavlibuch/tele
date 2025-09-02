const { createProxyMiddleware } = require('http-proxy-middleware');

// Backend server address
const BACKEND_TARGET = 'http://localhost:3001';

module.exports = function (app) {
  // Proxy API requests
  app.use(
    ['/api', '/admin'],
    createProxyMiddleware({
      target: BACKEND_TARGET,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );

  // Proxy WebSocket connections
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: BACKEND_TARGET,
      changeOrigin: true,
      ws: true,
      secure: false,
      logLevel: 'debug'
    })
  );

  // Proxy other requests that need to go to the backend
  app.use(
    '/auth',
    createProxyMiddleware({
      target: BACKEND_TARGET,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};
// Access to XMLHttpRequest at 'https://libretranslate.de/translate' from origin 'http://localhost:3001' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
