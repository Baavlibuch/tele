const { createProxyMiddleware } = require('http-proxy-middleware');

const EXPRESS_SERVER_IP = process.env.EXPRESS_SERVER_IP || "127.0.0.1";
const EXPRESS_SERVER_PORT = process.env.EXPRESS_SERVER_PORT || "3006";

module.exports = function (app) {
	app.use(
	  ['/api', '/admin'],
	  createProxyMiddleware({
		  target: `http://${EXPRESS_SERVER_IP}:${EXPRESS_SERVER_PORT}`,
		  changeOrigin: true
	  })
	);

	app.use(
	  '/socket.io',
	  createProxyMiddleware({
		  target: `http://${EXPRESS_SERVER_IP}:${EXPRESS_SERVER_PORT}`,
		  changeOrigin: true,
		  ws: true,
		  logLevel: 'debug',
		  secure: 'true'
	  })
	);
};
// Access to XMLHttpRequest at 'https://libretranslate.de/translate' from origin 'http://localhost:3001' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
