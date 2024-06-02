const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
	  ['/api', '/admin'],
	  createProxyMiddleware({
		  target: 'http://127.0.0.1:3000',
		  changeOrigin: true
	  })
	);

	app.use(
	  '/socket.io',
	  createProxyMiddleware({
		  target: 'http://127.0.0.1:3000',
		  changeOrigin: true,
		  ws: true,
		  logLevel: 'debug',
		  secure: 'true'
	  })
	);
};
// Access to XMLHttpRequest at 'https://libretranslate.de/translate' from origin 'http://localhost:3001' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
