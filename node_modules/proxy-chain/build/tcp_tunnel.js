'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _tools = require('./tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a connection from source client to an external proxy using HTTP CONNECT tunnel, allows TCP connection.
 */
var TcpTunnel = function () {
    function TcpTunnel(_ref) {
        var srcSocket = _ref.srcSocket,
            trgParsed = _ref.trgParsed,
            upstreamProxyUrlParsed = _ref.upstreamProxyUrlParsed,
            log = _ref.log;

        _classCallCheck(this, TcpTunnel);

        this.log = log;

        // Bind all event handlers to this instance
        this.bindHandlersToThis(['onSrcSocketClose', 'onSrcSocketEnd', 'onSrcSocketError', 'onTrgSocket', 'onTrgSocketClose', 'onTrgSocketEnd', 'onTrgSocketError', 'onTrgRequestConnect', 'onTrgRequestAbort', 'onTrgRequestError']);

        if (!trgParsed.hostname) throw new Error('The "trgParsed.hostname" option is required');
        if (!trgParsed.port) throw new Error('The "trgParsed.port" option is required');

        this.trgRequest = null;
        this.trgSocket = null;
        this.trgParsed = trgParsed;
        this.trgParsed.port = this.trgParsed.port || DEFAULT_TARGET_PORT;

        this.srcSocket = srcSocket;
        this.srcSocket.on('close', this.onSrcSocketClose);
        this.srcSocket.on('end', this.onSrcSocketEnd);
        this.srcSocket.on('error', this.onSrcSocketError);

        this.upstreamProxyUrlParsed = upstreamProxyUrlParsed;

        this.isClosed = false;
    }

    _createClass(TcpTunnel, [{
        key: 'bindHandlersToThis',
        value: function bindHandlersToThis(handlerNames) {
            var _this = this;

            handlerNames.forEach(function (evt) {
                _this[evt] = _this[evt].bind(_this);
            });
        }
    }, {
        key: 'run',
        value: function run() {
            this.log('Connecting to upstream proxy...');

            var options = {
                method: 'CONNECT',
                hostname: this.upstreamProxyUrlParsed.hostname,
                port: this.upstreamProxyUrlParsed.port,
                path: this.trgParsed.hostname + ':' + this.trgParsed.port,
                headers: {}
            };

            (0, _tools.maybeAddProxyAuthorizationHeader)(this.upstreamProxyUrlParsed, options.headers);

            this.trgRequest = _http2.default.request(options);

            this.trgRequest.on('connect', this.onTrgRequestConnect);
            this.trgRequest.on('abort', this.onTrgRequestAbort);
            this.trgRequest.on('socket', this.onTrgSocket);
            this.trgRequest.on('error', this.onTrgRequestError);

            // Send the data
            this.trgRequest.end();
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
        key: 'onSrcSocketEnd',
        value: function onSrcSocketEnd() {
            if (this.isClosed) return;
            this.log('Source socket ended');
            this.close();
        }
    }, {
        key: 'onSrcSocketError',
        value: function onSrcSocketError(err) {
            if (this.isClosed) return;
            this.log('Source socket failed: ' + (err.stack || err));
            this.close();
        }
    }, {
        key: 'onTrgSocket',
        value: function onTrgSocket(socket) {
            if (this.isClosed || this.trgSocket) return;

            this.log('Target socket assigned');

            this.trgSocket = socket;

            socket.on('close', this.onTrgSocketClose);
            socket.on('end', this.onTrgSocketEnd);
            socket.on('error', this.onTrgSocketError);
        }

        // Once target socket closes, we need to give time
        // to source socket to receive pending data, so we only call end() after a little while.
        // One second should be about enough.

    }, {
        key: 'onTrgSocketClose',
        value: function onTrgSocketClose() {
            var _this2 = this;

            if (this.isClosed) return;
            this.log('Target socket closed');
            setTimeout(function () {
                if (_this2.srcSocket) _this2.srcSocket.end();
            }, 1000);
        }

        // Same as onTrgSocketClose() above

    }, {
        key: 'onTrgSocketEnd',
        value: function onTrgSocketEnd() {
            var _this3 = this;

            if (this.isClosed) return;
            this.log('Target socket ended');
            setTimeout(function () {
                if (_this3.srcSocket) _this3.srcSocket.end();
            }, 1000);
        }
    }, {
        key: 'onTrgSocketError',
        value: function onTrgSocketError(err) {
            if (this.isClosed) return;
            this.log('Target socket failed: ' + (err.stack || err));
            this.fail(err);
        }
    }, {
        key: 'onTrgRequestConnect',
        value: function onTrgRequestConnect(response, socket) {
            if (this.isClosed) return;
            this.log('Connected to upstream proxy');

            // Attempt to fix https://github.com/apifytech/proxy-chain/issues/64,
            // perhaps the 'connect' event might occur before 'socket'
            if (!this.trgSocket) {
                this.onTrgSocket(socket);
            }

            if (this.checkUpstreamProxy407(response)) return;

            // Note that sockets could be closed anytime, causing this.close() to be called too in above statements
            // See https://github.com/apifytech/proxy-chain/issues/64
            if (this.isClosed) return;

            // Setup bi-directional tunnel
            this.trgSocket.pipe(this.srcSocket);
            this.srcSocket.pipe(this.trgSocket);

            this.srcSocket.resume();
        }
    }, {
        key: 'onTrgRequestAbort',
        value: function onTrgRequestAbort() {
            if (this.isClosed) return;
            this.log('Target aborted');
            this.close();
        }
    }, {
        key: 'onTrgRequestError',
        value: function onTrgRequestError(err) {
            if (this.isClosed) return;
            this.log('Target request failed: ' + (err.stack || err));
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
                this.fail('Invalid credentials provided for the upstream proxy.', 502);
                return true;
            }
            return false;
        }
    }, {
        key: 'fail',
        value: function fail(err, statusCode) {
            if (this.srcGotResponse) {
                this.log('Source already received a response, just destroying the socket...');
                this.close();
            } else if (statusCode) {
                // Manual error
                this.log(err + ', responding with custom status code ' + statusCode + ' to client');
            } else if (err.code === 'ENOTFOUND' && !this.upstreamProxyUrlParsed) {
                this.log('Target server not found, sending 404 to client');
            } else if (err.code === 'ENOTFOUND' && this.upstreamProxyUrlParsed) {
                this.log('Upstream proxy not found, sending 502 to client');
            } else if (err.code === 'ECONNREFUSED') {
                this.log('Upstream proxy refused connection, sending 502 to client');
            } else if (err.code === 'ETIMEDOUT') {
                this.log('Connection timed out, sending 502 to client');
            } else if (err.code === 'ECONNRESET') {
                this.log('Connection lost, sending 502 to client');
            } else if (err.code === 'EPIPE') {
                this.log('Socket closed before write, sending 502 to client');
            } else {
                this.log('Unknown error, sending 500 to client');
            }
        }

        /**
         * Detaches all listeners and destroys all sockets.
         */

    }, {
        key: 'close',
        value: function close() {
            if (!this.isClosed) {
                this.log('Closing handler');
                this.isClosed = true;

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
            }
        }
    }]);

    return TcpTunnel;
}();

exports.default = TcpTunnel;