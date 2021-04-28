var bluebird = require('bluebird');
var net = require('net');
var debug = require('debug');

module.exports = {

  // Returns a promise that will be resolved with an array of open ports
  test: bluebird.method(function(port, iface, callback) {
    var that = this;
    var log = debug('portastic:test');
    var def = bluebird.defer();

    // Callback handling
    def.promise
      .then(function(ports) {
        if (!that._callback(callback, [ports]))
          return ports;
      })
      .catch(function(err) {
        if (!that._callback(callback, [err]))
          throw err;
      });

    if (typeof iface !== 'string' && !callback) {
      callback = iface;
      iface = null;
    }

    var server = net.createServer();

    server.on('error', function(err) {
      if (err.code === 'EADDRINUSE') {
        log('Port %s was in use', port);
        return def.resolve(false);
      }

      def.reject(err);
    });

    server.on('close', function() {
      log('TCP server on port %s closed', port);
      def.resolve(true);
    });

    log('Trying to test port %s', port);
    server.listen(port, iface, function(err) {
      if (err && err.code === 'EADDRINUSE') {
        log('Port %s was in use', port);
        return def.resolve(false);
      }

      if (err)
        return def.reject(err);

      server.close(function(err) {
        if (err)
          return def.reject(err);

        log('Port %s was free', port);
      });
    });

    return def.promise;
  }),

  // Filter ports that are in use
  filter: bluebird.method(function(ports, iface, callback) {
    var that = this;
    var log = debug('portastic:filter');
    var def = bluebird.defer();

    // Callback handling
    def.promise
      .then(function(ports) {
        if (!that._callback(callback, [ports]))
          return ports;
      })
      .catch(function(err) {
        if (!that._callback(callback, [err]))
          throw err;
      });

    if (typeof iface !== 'string' && !callback) {
      callback = iface;
      iface = null;
    }

    bluebird.all(ports)
      .filter(function(port) {
        log('Filtering port %s', port);
        return that.test(port, iface);
      })
      .then(function(free) {
        def.resolve(free);
      })
      .catch(function(err) {
        def.reject(err);
      });

    return def.promise;
  }),

  // Find open ports in a range
  find: bluebird.method(function(options, iface, callback) {
    var log = debug('portastic:find');
    var that = this;
    var ports = [];
    var result = [];

    if (typeof iface !== 'string' && !callback) {
      callback = iface;
      iface = null;
    }

    for (var i = options.min; i <= options.max; i++)
      ports.push(i);

    log('Trying to find open ports between range %s and %s', options.min,
      options.max);

    var promise = bluebird.resolve(ports)
      .each(function(port) {
        return that.test(port, iface)
          .then(function(open) {
            if (options.retrieve && result.length >= options.retrieve) {
              log('Result reached the maximum of %s ports, returning...',
                options.retrieve);
              return promise.cancel();
            }

            if (open) {
              log('Port %s was open, adding it to the result list', port);
              log('Pushing port %s to the result list', port);
              return result.push(port);
            } else
              log('Port %s was not open', port);
          });
      })
      .cancellable()
      .catch(bluebird.CancellationError, function() {
        return;
      })
      .then(function() {
        if (!that._callback(callback, [ports]))
          return result;
      })
      .catch(function(err) {
        if (!that._callback(callback, [err]))
          throw err;
      });

    return promise;
  }),

  // Handles callbacks
  _callback: function(cb, args) {
    if (cb) {
      // This will bypass promises errors catching
      process.nextTick(function() {
        cb.apply(cb, args);
      });
    }

    return !!cb;
  }

};
