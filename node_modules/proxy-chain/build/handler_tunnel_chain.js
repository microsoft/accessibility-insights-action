'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _handler_base = require('./handler_base');

var _handler_base2 = _interopRequireDefault(_handler_base);

var _tools = require('./tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a connection from source client to an external proxy using HTTP CONNECT tunnel.
 */
var HandlerTunnelChain = function (_HandlerBase) {
    _inherits(HandlerTunnelChain, _HandlerBase);

    function HandlerTunnelChain(options) {
        _classCallCheck(this, HandlerTunnelChain);

        var _this = _possibleConstructorReturn(this, (HandlerTunnelChain.__proto__ || Object.getPrototypeOf(HandlerTunnelChain)).call(this, options));

        if (!_this.upstreamProxyUrlParsed) throw new Error('The "upstreamProxyUrlParsed" option is required');

        _this.bindHandlersToThis(['onTrgRequestConnect', 'onTrgRequestAbort', 'onTrgRequestError']);
        return _this;
    }

    _createClass(HandlerTunnelChain, [{
        key: 'run',
        value: function run() {
            this.log('Connecting to upstream proxy...');

            var targetHost = this.trgParsed.hostname + ':' + this.trgParsed.port;

            var options = {
                method: 'CONNECT',
                hostname: this.upstreamProxyUrlParsed.hostname,
                port: this.upstreamProxyUrlParsed.port,
                path: targetHost,
                headers: {
                    Host: targetHost
                }
            };

            (0, _tools.maybeAddProxyAuthorizationHeader)(this.upstreamProxyUrlParsed, options.headers);

            this.trgRequest = _http2.default.request(options);

            this.trgRequest.on('socket', this.onTrgSocket);
            this.trgRequest.on('connect', this.onTrgRequestConnect);
            this.trgRequest.on('abort', this.onTrgRequestAbort);
            this.trgRequest.on('error', this.onTrgRequestError);

            // Send the data
            this.trgRequest.end();
        }
    }, {
        key: 'onTrgRequestConnect',
        value: function onTrgRequestConnect(response, socket, head) {
            if (this.isClosed) return;
            this.log('Connected to upstream proxy');

            // Attempt to fix https://github.com/apifytech/proxy-chain/issues/64,
            // perhaps the 'connect' event might occur before 'socket'
            if (!this.trgSocket) {
                this.onTrgSocket(socket);
            }

            if (this.checkUpstreamProxy407(response)) return;

            this.srcGotResponse = true;
            this.srcResponse.removeListener('finish', this.onSrcResponseFinish);
            this.srcResponse.writeHead(200, 'Connection Established');

            // HACK: force a flush of the HTTP header. This is to ensure 'head' is empty to avoid
            // assert at https://github.com/request/tunnel-agent/blob/master/index.js#L160
            // See also https://github.com/nodejs/node/blob/master/lib/_http_outgoing.js#L217
            this.srcResponse._send('');

            // It can happen that this.close() it called in the meanwhile, so this.srcSocket becomes null
            // and the detachSocket() call below fails with "Cannot read property '_httpMessage' of null"
            // See https://github.com/apifytech/proxy-chain/issues/63
            if (this.isClosed) return;

            // Relinquish control of the `socket` from the ServerResponse instance
            this.srcResponse.detachSocket(this.srcSocket);

            // Nullify the ServerResponse object, so that it can be cleaned
            // up before this socket proxying is completed
            this.srcResponse = null;

            // Forward pre-parsed parts of the first packets (if any)
            if (head && head.length > 0) {
                this.srcSocket.write(head);
            }
            if (this.srcHead && this.srcHead.length > 0) {
                this.trgSocket.write(this.srcHead);
            }

            // Note that sockets could be closed anytime, causing this.close() to be called too in above statements
            // See https://github.com/apifytech/proxy-chain/issues/64
            if (this.isClosed) return;

            // Setup bi-directional tunnel
            this.trgSocket.pipe(this.srcSocket);
            this.srcSocket.pipe(this.trgSocket);
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
    }]);

    return HandlerTunnelChain;
}(_handler_base2.default);

exports.default = HandlerTunnelChain;