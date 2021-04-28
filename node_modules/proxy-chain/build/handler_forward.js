'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _tools = require('./tools');

var _handler_base = require('./handler_base');

var _handler_base2 = _interopRequireDefault(_handler_base);

var _server = require('./server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a proxied request to a HTTP server, either direct or via another upstream proxy.
 */
var HandlerForward = function (_HandlerBase) {
    _inherits(HandlerForward, _HandlerBase);

    function HandlerForward(options) {
        _classCallCheck(this, HandlerForward);

        var _this = _possibleConstructorReturn(this, (HandlerForward.__proto__ || Object.getPrototypeOf(HandlerForward)).call(this, options));

        _this.bindHandlersToThis(['onTrgResponse', 'onTrgError']);
        return _this;
    }

    _createClass(HandlerForward, [{
        key: 'run',
        value: function run() {
            var reqOpts = this.trgParsed;
            reqOpts.method = this.srcRequest.method;
            reqOpts.headers = {};

            // TODO:
            //  - We should probably use a raw HTTP message via socket instead of http.request(),
            //    since Node transforms the headers to lower case and thus makes it easy to detect the proxy
            //  - The "Connection" header might define additional hop-by-hop headers that should be removed,
            //    see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection
            //  - We should also add "Via" and "X-Forwarded-For" headers
            //  - Or, alternatively, we should make this proxy fully transparent

            var hostHeaderFound = false;

            for (var i = 0; i < this.srcRequest.rawHeaders.length; i += 2) {
                var headerName = this.srcRequest.rawHeaders[i];
                var headerValue = this.srcRequest.rawHeaders[i + 1];

                if (/^connection$/i.test(headerName) && /^keep-alive$/i.test(headerValue)) {
                    // Keep the "Connection: keep-alive" header, to reduce the chance that the server
                    // will detect we're not a browser and also to improve performance
                } else if ((0, _tools.isHopByHopHeader)(headerName)) {
                    continue;
                } else if ((0, _tools.isInvalidHeader)(headerName, headerValue)) {
                    continue;
                } else if (/^host$/i.test(headerName)) {
                    // If Host header was used multiple times, only consider the first one.
                    // This is to prevent "TypeError: hostHeader.startsWith is not a function at calculateServerName (_http_agent.js:240:20)"
                    if (hostHeaderFound) continue;
                    hostHeaderFound = true;
                }

                /*
                if (!hasXForwardedFor && 'x-forwarded-for' === keyLower) {
                    // append to existing "X-Forwarded-For" header
                    // http://en.wikipedia.org/wiki/X-Forwarded-For
                    hasXForwardedFor = true;
                    value += ', ' + socket.remoteAddress;
                    debug.proxyRequest('appending to existing "%s" header: "%s"', key, value);
                }
                 if (!hasVia && 'via' === keyLower) {
                    // append to existing "Via" header
                    hasVia = true;
                    value += ', ' + via;
                    debug.proxyRequest('appending to existing "%s" header: "%s"', key, value);
                }
                */

                (0, _tools.addHeader)(reqOpts.headers, headerName, headerValue);
            }

            /*
            // add "X-Forwarded-For" header if it's still not here by now
            // http://en.wikipedia.org/wiki/X-Forwarded-For
            if (!hasXForwardedFor) {
                headers['X-Forwarded-For'] = socket.remoteAddress;
                debug.proxyRequest('adding new "X-Forwarded-For" header: "%s"', headers['X-Forwarded-For']);
            }
             // add "Via" header if still not set by now
            if (!hasVia) {
                headers.Via = via;
                debug.proxyRequest('adding new "Via" header: "%s"', headers.Via);
            }
             // custom `http.Agent` support, set `server.agent`
            var agent = server.agent;
            if (null != agent) {
                debug.proxyRequest('setting custom `http.Agent` option for proxy request: %s', agent);
                parsed.agent = agent;
                agent = null;
            }
             */

            // If desired, send the request via proxy
            if (this.upstreamProxyUrlParsed) {
                reqOpts.host = this.upstreamProxyUrlParsed.hostname;
                reqOpts.hostname = reqOpts.host;
                reqOpts.port = this.upstreamProxyUrlParsed.port;

                // HTTP requests to proxy contain the full URL in path, for example:
                // "GET http://www.example.com HTTP/1.1\r\n"
                // So we need to replicate it here
                reqOpts.path = this.srcRequest.url;

                (0, _tools.maybeAddProxyAuthorizationHeader)(this.upstreamProxyUrlParsed, reqOpts.headers);

                this.log('Connecting to upstream proxy ' + reqOpts.host + ':' + reqOpts.port);
            } else {
                this.log('Connecting to target ' + reqOpts.host);
            }

            // console.dir(requestOptions);

            this.trgRequest = _http2.default.request(reqOpts);
            this.trgRequest.on('socket', this.onTrgSocket);
            this.trgRequest.on('response', this.onTrgResponse);
            this.trgRequest.on('error', this.onTrgError);

            // this.srcRequest.pipe(tee('to trg')).pipe(this.trgRequest);
            this.srcRequest.pipe(this.trgRequest);
        }
    }, {
        key: 'onTrgResponse',
        value: function onTrgResponse(response) {
            if (this.isClosed) return;
            this.log('Received response from target (' + response.statusCode + ')');

            if (this.checkUpstreamProxy407(response)) return;

            // Prepare response headers
            var headers = {};
            for (var i = 0; i < response.rawHeaders.length; i += 2) {
                var name = response.rawHeaders[i];
                var value = response.rawHeaders[i + 1];

                if ((0, _tools.isHopByHopHeader)(name)) continue;
                if ((0, _tools.isInvalidHeader)(name, value)) continue;

                (0, _tools.addHeader)(headers, name, value);
            }

            // Ensure status code is in the range accepted by Node, otherwise proxy will crash with
            // "RangeError: Invalid status code: 0" (see writeHead in Node's _http_server.js)
            // Fixes https://github.com/apifytech/proxy-chain/issues/35
            if (response.statusCode < 100 || response.statusCode > 999) {
                this.fail(new _server.RequestError('Target server responded with an invalid HTTP status code (' + response.statusCode + ')', 500));
                return;
            }

            this.srcGotResponse = true;

            // Note that sockets could be closed anytime, causing this.close() to be called too in above statements
            // See https://github.com/apifytech/proxy-chain/issues/64
            if (this.isClosed) return;

            this.srcResponse.writeHead(response.statusCode, headers);
            response.pipe(this.srcResponse);
        }
    }, {
        key: 'onTrgError',
        value: function onTrgError(err) {
            if (this.isClosed) return;
            this.log('Target socket failed: ' + (err.stack || err));
            this.fail(err);
        }
    }]);

    return HandlerForward;
}(_handler_base2.default);

exports.default = HandlerForward;