'use strict';

var _server = require('./server');

var _tools = require('./tools');

var _anonymize_proxy = require('./anonymize_proxy');

var _tcp_tunnel_tools = require('./tcp_tunnel_tools');

// Publicly exported functions and classes
var ProxyChain = {
    Server: _server.Server,
    RequestError: _server.RequestError,
    parseUrl: _tools.parseUrl,
    redactUrl: _tools.redactUrl,
    redactParsedUrl: _tools.redactParsedUrl,
    anonymizeProxy: _anonymize_proxy.anonymizeProxy,
    closeAnonymizedProxy: _anonymize_proxy.closeAnonymizedProxy,
    createTunnel: _tcp_tunnel_tools.createTunnel,
    closeTunnel: _tcp_tunnel_tools.closeTunnel
};

module.exports = ProxyChain;