'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _server = require('./server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Base class for proxy connection handlers. It emits the `destroyed` event
 * when the handler is no longer used.
 */
var HandlerBase = function (_EventEmitter) {
    _inherits(HandlerBase, _EventEmitter);

    function HandlerBase(_ref) {
        var server = _ref.server,
            id = _ref.id,
            srcRequest = _ref.srcRequest,
            srcHead = _ref.srcHead,
            srcResponse = _ref.srcResponse,
            trgParsed = _ref.trgParsed,
            upstreamProxyUrlParsed = _ref.upstreamProxyUrlParsed;

        _classCallCheck(this, HandlerBase);

        var _this = _possibleConstructorReturn(this, (HandlerBase.__proto__ || Object.getPrototypeOf(HandlerBase)).call(this));

        if (!server) throw new Error('The "server" option is required');
        if (!id) throw new Error('The "id" option is required');
        if (!srcRequest) throw new Error('The "srcRequest" option is required');
        if (!srcRequest.socket) throw new Error('"srcRequest.socket" cannot be null');
        if (!trgParsed.hostname) throw new Error('The "trgParsed.hostname" option is required');

        _this.server = server;
        _this.id = id;

        _this.srcRequest = srcRequest;
        _this.srcHead = srcHead;
        _this.srcResponse = srcResponse;
        _this.srcSocket = srcRequest.socket;

        _this.trgRequest = null;
        _this.trgSocket = null;
        _this.trgParsed = trgParsed;
        _this.trgParsed.port = _this.trgParsed.port || DEFAULT_TARGET_PORT;

        // Indicates that source socket might have received some data already
        _this.srcGotResponse = false;

        _this.isClosed = false;

        _this.upstreamProxyUrlParsed = upstreamProxyUrlParsed;

        // Create ServerResponse for the client HTTP request if it doesn't exist
        // NOTE: This is undocumented API, it might break in the future
        if (!_this.srcResponse) {
            _this.srcResponse = new _http2.default.ServerResponse(srcRequest);
            _this.srcResponse.shouldKeepAlive = false;
            _this.srcResponse.chunkedEncoding = false;
            _this.srcResponse.useChunkedEncodingByDefault = false;
            _this.srcResponse.assignSocket(_this.srcSocket);
        }

        // Bind all event handlers to this instance
        _this.bindHandlersToThis(['onSrcResponseFinish', 'onSrcResponseError', 'onSrcSocketEnd', 'onSrcSocketFinish', 'onSrcSocketClose', 'onSrcSocketError', 'onTrgSocket', 'onTrgSocketEnd', 'onTrgSocketFinish', 'onTrgSocketClose', 'onTrgSocketError']);

        _this.srcResponse.on('error', _this.onSrcResponseError);

        // Called for the ServerResponse's "finish" event
        // Normally, Node's "http" module has a "finish" event listener that would
        // take care of closing the socket once the HTTP response has completed, but
        // since we're making this ServerResponse instance manually, that event handler
        // never gets hooked up, so we must manually close the socket...
        _this.srcResponse.on('finish', _this.onSrcResponseFinish);

        // Forward data directly to source client without any delay
        _this.srcSocket.setNoDelay();

        _this.srcSocket.on('end', _this.onSrcSocketEnd);
        _this.srcSocket.on('close', _this.onSrcSocketClose);
        _this.srcSocket.on('finish', _this.onSrcSocketFinish);
        _this.srcSocket.on('error', _this.onSrcSocketError);
        return _this;
    }

    _createClass(HandlerBase, [{
        key: 'bindHandlersToThis',
        value: function bindHandlersToThis(handlerNames) {
            var _this2 = this;

            handlerNames.forEach(function (evt) {
                _this2[evt] = _this2[evt].bind(_this2);
            });
        }
    }, {
        key: 'log',
        value: function log(str) {
            this.server.log(this.id, str);
        }

        // Abstract method, needs to be overridden

    }, {
        key: 'run',
        value: function run() {} // eslint-disable-line

    }, {
        key: 'onSrcSocketEnd',
        value: function onSrcSocketEnd() {
            if (this.isClosed) return;
            this.log('Source socket ended');
            this.close();
        }

        // On Node 10+, the 'close' event is called only after socket is destroyed,
        // so we also need to listen for the stream 'finish' event

    }, {
        key: 'onSrcSocketFinish',
        value: function onSrcSocketFinish() {
            if (this.isClosed) return;
            this.log('Source socket finished');
            this.close();
        }

        // If the client closes the connection prematurely,
        // then immediately destroy the upstream socket, there's nothing we can do with it

    }, {
        key: 'onSrcSocketClose',
        value: function onSrcSocketClose() {
            if (this.isClosed) return;
            this.log('Source socket closed');
            this.close();
        }
    }, {
        key: 'onSrcSocketError',
        value: function onSrcSocketError(err) {
            if (this.isClosed) return;
            this.log('Source socket failed: ' + (err.stack || err));
            this.close();
        }

        // This is to address https://github.com/apifytech/proxy-chain/issues/27
        // It seems that when client closed the connection, the piped target socket
        // can still pump data to it, which caused unhandled "write after end" error

    }, {
        key: 'onSrcResponseError',
        value: function onSrcResponseError(err) {
            if (this.isClosed) return;
            this.log('Source response failed: ' + (err.stack || err));
            this.close();
        }
    }, {
        key: 'onSrcResponseFinish',
        value: function onSrcResponseFinish() {
            if (this.isClosed) return;
            this.log('Source response finished, ending source socket');
            // NOTE: We cannot destroy the socket, since there might be pending data that wouldn't be delivered!
            // This code is inspired by resOnFinish() in _http_server.js in Node.js code base.
            if (typeof this.srcSocket.destroySoon === 'function') {
                this.srcSocket.destroySoon();
            } else {
                this.srcSocket.end();
            }
        }
    }, {
        key: 'onTrgSocket',
        value: function onTrgSocket(socket) {
            if (this.isClosed || this.trgSocket) return;
            this.log('Target socket assigned');

            this.trgSocket = socket;

            // Forward data directly to target server without any delay
            this.trgSocket.setNoDelay();

            socket.on('end', this.onTrgSocketEnd);
            socket.on('finish', this.onTrgSocketFinish);
            socket.on('close', this.onTrgSocketClose);
            socket.on('error', this.onTrgSocketError);
        }
    }, {
        key: 'trgSocketShutdown',
        value: function trgSocketShutdown(msg) {
            if (this.isClosed) return;
            this.log(msg);
            // Once target socket closes, we need to give time
            // to source socket to receive pending data, so we only call end()
            // If socket is closed here instead of response, phantomjs does not properly parse the response as http response.
            if (this.srcResponse) {
                this.srcResponse.end();
            } else if (this.srcSocket) {
                // Handler tunnel chain does not use srcResponse, but needs to close srcSocket
                this.srcSocket.end();
            }
        }
    }, {
        key: 'onTrgSocketEnd',
        value: function onTrgSocketEnd() {
            this.trgSocketShutdown('Target socket ended');
        }
    }, {
        key: 'onTrgSocketFinish',
        value: function onTrgSocketFinish() {
            this.trgSocketShutdown('Target socket finished');
        }
    }, {
        key: 'onTrgSocketClose',
        value: function onTrgSocketClose() {
            this.trgSocketShutdown('Target socket closed');
        }
    }, {
        key: 'onTrgSocketError',
        value: function onTrgSocketError(err) {
            if (this.isClosed) return;
            this.log('Target socket failed: ' + (err.stack || err));
            this.fail(err);
        }

        /**
         * Checks whether response from upstream proxy is 407 Proxy Authentication Required
         * and if so, responds 502 Bad Gateway to client.
         * @param response
         * @return {boolean}
         */

    }, {
        key: 'checkUpstreamProxy407',
        value: function checkUpstreamProxy407(response) {
            if (this.upstreamProxyUrlParsed && response.statusCode === 407) {
                this.fail(new _server.RequestError('Invalid credentials provided for the upstream proxy.', 502));
                return true;
            }
            return false;
        }
    }, {
        key: 'fail',
        value: function fail(err) {
            if (this.srcGotResponse) {
                this.log('Source already received a response, just destroying the socket...');
                this.close();
                return;
            }

            this.srcGotResponse = true;
            this.srcResponse.setHeader('Content-Type', 'text/plain; charset=utf-8');

            if (err.statusCode) {
                // Error is RequestError with HTTP status code
                this.log(err + ' Responding with custom status code ' + err.statusCode + ' to client');
                this.srcResponse.writeHead(err.statusCode);
                this.srcResponse.end('' + err.message);
            } else if (err.code === 'ENOTFOUND' && !this.upstreamProxyUrlParsed) {
                this.log('Target server not found, sending 404 to client');
                this.srcResponse.writeHead(404);
                this.srcResponse.end('Target server not found');
            } else if (err.code === 'ENOTFOUND' && this.upstreamProxyUrlParsed) {
                this.log('Upstream proxy not found, sending 502 to client');
                this.srcResponse.writeHead(502);
                this.srcResponse.end('Upstream proxy was not found');
            } else if (err.code === 'ECONNREFUSED') {
                this.log('Upstream proxy refused connection, sending 502 to client');
                this.srcResponse.writeHead(502);
                this.srcResponse.end('Upstream proxy refused connection');
            } else if (err.code === 'ETIMEDOUT') {
                this.log('Connection timed out, sending 502 to client');
                this.srcResponse.writeHead(502);
                this.srcResponse.end('Connection to upstream proxy timed out');
            } else if (err.code === 'ECONNRESET') {
                this.log('Connection lost, sending 502 to client');
                this.srcResponse.writeHead(502);
                this.srcResponse.end('Connection lost');
            } else if (err.code === 'EPIPE') {
                this.log('Socket closed before write, sending 502 to client');
                this.srcResponse.writeHead(502);
                this.srcResponse.end('Connection interrupted');
            } else {
                this.log('Unknown error, sending 500 to client');
                this.srcResponse.writeHead(500);
                this.srcResponse.end('Internal error in proxy server');
            }
        }
    }, {
        key: 'getStats',
        value: function getStats() {
            return {
                srcTxBytes: this.srcSocket ? this.srcSocket.bytesWritten : null,
                srcRxBytes: this.srcSocket ? this.srcSocket.bytesRead : null,
                trgTxBytes: this.trgSocket ? this.trgSocket.bytesWritten : null,
                trgRxBytes: this.trgSocket ? this.trgSocket.bytesRead : null
            };
        }

        /**
         * Detaches all listeners, destroys all sockets and emits the 'close' event.
         */

    }, {
        key: 'close',
        value: function close() {
            if (this.isClosed) return;

            this.log('Closing handler');
            this.isClosed = true;

            // Save stats before sockets are destroyed
            var stats = this.getStats();

            if (this.srcRequest) {
                this.srcRequest.destroy();
                this.srcRequest = null;
            }

            if (this.srcSocket) {
                this.srcSocket.destroy();
                this.srcSocket = null;
            }

            if (this.trgRequest) {
                this.trgRequest.abort();
                this.trgRequest = null;
            }

            if (this.trgSocket) {
                this.trgSocket.destroy();
                this.trgSocket = null;
            }

            this.emit('close', { stats: stats });
        }
    }]);

    return HandlerBase;
}(_events2.default);

exports.default = HandlerBase;