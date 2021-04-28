var portastic = require('./portastic');
var events = require('events');
var util = require('util');

var Monitor = function(ports, options) {
  this._ports = ports;
  this._options = options || {};
  this._watchers = [];

  if (this._options.autostart === false)
    return;

  this.start();
};
util.inherits(Monitor, events.EventEmitter);

Monitor.prototype.start = function() {
  if (this._watchers.length)
    return this.emit('error', new Error('Monitor already started'));

  var that = this;
  this._ports.forEach(function(port) {
    that._watchers.push(that._watcher(port));
  });
};

Monitor.prototype.stop = function() {
  this._watchers.forEach(function(watcher) {
    clearInterval(watcher.intervar);
  });

  this._watchers = [];
};

Monitor.prototype._watcher = function(port) {
  var that = this;
  var setup = {
    state: null,
    interval: setInterval(function() {
      portastic.test(port)
        .then(function(open) {
          if (setup.state === open)
            return;

          that.emit(open ? 'open' : 'close', port);
          setup.state = open;
        })
        .catch(function(err) {
          process.nextTick(function() {
            that.emit('error', err);
          });
        });
    }, that._options.interval || 100)
  };

  return setup;
};

module.exports = Monitor;
