'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createTunnel = createTunnel;
exports.closeTunnel = closeTunnel;

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _tcp_tunnel = require('./tcp_tunnel');

var _tcp_tunnel2 = _interopRequireDefault(_tcp_tunnel);

var _tools = require('./tools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var runningServers = {};

function createTunnel(proxyUrl, targetHost) {
    var providedOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var callback = arguments[3];

    // TODO: More and better validations - yeah, make sure targetHost is really a hostname
    var _targetHost$split = targetHost.split(':'),
        _targetHost$split2 = _slicedToArray(_targetHost$split, 2),
        trgHostname = _targetHost$split2[0],
        trgPort = _targetHost$split2[1];

    if (!trgHostname || !trgPort) throw new Error('target needs to include both hostname and port.');

    var parsedProxyUrl = (0, _tools.parseUrl)(proxyUrl);
    if (!parsedProxyUrl.hostname) throw new Error('proxyUrl needs to include atleast hostname');
    if (parsedProxyUrl.scheme !== 'http') throw new Error('Currently only "http" scheme is supported');

    var options = _extends({
        verbose: false,
        hostname: 'localhost',
        port: null
    }, providedOptions);

    var promise = new Promise(function (resolve, reject) {
        if (options.port) return resolve(options.port);
        (0, _tools.findFreePort)().then(resolve).catch(reject);
    }).then(function (port) {
        var server = _net2.default.createServer();

        var log = function log() {
            var _console;

            if (options.verbose) (_console = console).log.apply(_console, arguments);
        };

        server.on('connection', function (srcSocket) {
            runningServers[port].connections = srcSocket;
            var remoteAddress = srcSocket.remoteAddress + ':' + srcSocket.remotePort;
            log('new client connection from %s', remoteAddress);

            srcSocket.pause();

            var tunnel = new _tcp_tunnel2.default({
                srcSocket: srcSocket,
                upstreamProxyUrlParsed: parsedProxyUrl,
                trgParsed: {
                    hostname: trgHostname,
                    port: trgPort
                },
                log: log
            });

            tunnel.run();

            srcSocket.on('data', onConnData);
            srcSocket.on('close', onConnClose);
            srcSocket.on('error', onConnError);

            function onConnData(d) {
                log('connection data from %s: %j', remoteAddress, d);
            }

            function onConnClose() {
                log('connection from %s closed', remoteAddress);
            }

            function onConnError(err) {
                log('Connection %s error: %s', remoteAddress, err.message);
            }
        });

        return new Promise(function (resolve) {
            server.listen(port, function (err) {
                if (err) return reject(err);
                log('server listening to ', server.address());
                runningServers[port] = { server: server, connections: [] };
                resolve(options.hostname + ':' + port);
            });
        });
    });

    return (0, _tools.nodeify)(promise, callback);
}

function closeTunnel(serverPath, closeConnections, callback) {
    var _serverPath$split = serverPath.split(':'),
        _serverPath$split2 = _slicedToArray(_serverPath$split, 2),
        hostname = _serverPath$split2[0],
        port = _serverPath$split2[1];

    if (!hostname) throw new Error('serverPath must contain hostname');
    if (!port) throw new Error('serverPath must contain port');

    var promise = new Promise(function (resolve) {
        if (!runningServers[port]) return resolve(false);
        if (!closeConnections) return resolve();
        runningServers[port].connections.forEach(function (connection) {
            return connection.destroy();
        });
        resolve();
    }).then(function (serverExists) {
        return new Promise(function (resolve) {
            if (!serverExists) return resolve(false);
            runningServers[port].close(function () {
                delete runningServers[port];
                resolve(true);
            });
        });
    });

    return (0, _tools.nodeify)(promise, callback);
}