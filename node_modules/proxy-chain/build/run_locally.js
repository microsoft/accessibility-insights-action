'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _proxy = require('proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _server = require('./server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set up upstream proxy with no auth
var upstreamProxyHttpServer = _http2.default.createServer(); // eslint-disable-line import/no-extraneous-dependencies
/*!
 * This script runs the proxy with a second upstream proxy locally on port specified by PORT environment variable
 * or 8080 if not provided. This is used to manually test the proxy on normal browsing.
 *
 * node ./build/run_locally.js
 *
 * Author: Jan Curn (jan@apify.com)
 * Copyright(c) 2017 Apify Technologies. All rights reserved.
 *
 */

upstreamProxyHttpServer.on('error', function (err) {
    console.error(err.stack || err);
});

var upstreamProxyServer = (0, _proxy2.default)(upstreamProxyHttpServer);
var upstreamProxyPort = process.env.UPSTREAM_PROXY_PORT || 8081;
upstreamProxyServer.listen(process.env.UPSTREAM_PROXY_PORT || 8081, function (err) {
    if (err) {
        console.error(err.stack || err);
        process.exit(1);
    }
});

// Setup proxy to forward to upstream
var server = new _server.Server({
    port: process.env.PORT || 8080,
    // verbose: true,
    prepareRequestFunction: function prepareRequestFunction() {
        return { requestAuthentication: false, upstreamProxyUrl: 'http://127.0.0.1:' + upstreamProxyPort };
    }
});

server.on('requestFailed', function (_ref) {
    var error = _ref.error,
        request = _ref.request;

    console.error('Request failed (' + (request ? request.url : 'N/A') + '): ' + (error.stack || error));
});

server.listen().then(function () {
    console.log('Proxy server is running at http://127.0.0.1:' + server.port);

    setInterval(function () {
        console.log('Stats: ' + JSON.stringify(server.stats));
    }, 30000);
}).catch(function (err) {
    console.error(err.stack || err);
    process.exit(1);
});