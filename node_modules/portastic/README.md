# portastic
[![Coverage Status](https://coveralls.io/repos/alanhoff/node-portastic/badge.svg?branch=master)][0]
[![Travis](https://travis-ci.org/alanhoff/node-portastic.svg)][1]
[![Dependencies](https://david-dm.org/alanhoff/node-portastic.svg)][2]

Pure javascript swiss knife for port management. Find open ports, monitor ports
and other port relates things.

### API

* `portastic.test(port, [interface , [callback]])`

Test if a port is open. If a callback
is provided it will be called with an `error` parameter and a second parameter
with a `boolean` that tells if the port is open or not. If a callback is not
provided the return value will be a promise that will be fullfied with the
result.

```javascript
var portastic = require('portastic');

portastic.test(8080)
  .then(function(isOpen){
    console.log('Port 8080 is %s', isOpen ? 'open' : 'closed');
  });
```

* `portastic.find(options, [interface, [callback]])`

Retrieve a list of open ports between `min` and `max`, if a callback is not
provided this method will resolve a promise with the results. Options can be:

  * `min` The minimum port number to start with
  * `max` The maximum port number to scan
  * `retrieve` How many ports to collect

```javascript
var portastic = require('portastic');

portastic.find({
    min: 8000,
    max: 8080
  })
  .then(function(ports){
    console.log('Ports available between 8000 and 8080 are: %s',
      ports.join(', '));
  });
```

* `portastic.filter(ports..., [interface, [callback]])`

Test a list of ports and return the open ones. If a callback is not provided
this method will resolve a promise with the results

```javascript
var portastic = require('portastic');

portastic.filter([8080, 8081, 8082])
  .then(function(ports){
    console.log('The available ports are: %s', ports.join(', '));
  });
```

* `portastic.Monitor(ports...)`

Monitor is an `EventEmitter` that emits `open` when a monitored port is
available and `close` when the port has closed.

```javascript
var portastic = require('portastic');
var monitor = new portastic.Monitor([8080, 8081, 8082]);

monitor.on('open', function(port){
  console.log('Port %s is open', port);
});

monitor.on('close', function(port){
  console.log('Port %s is closed', port);
});

setTimeout(function(){
  monitor.stop(); // Stops the monitoring after 5 seconds
}, 5000);
```

### Command line

It's also possible to use `portastic` as a command line utility, you just need
to install it globally with `npm install -g portastic`. Here is the help command
output.

```

Usage: portastic [options] [command]


Commands:

  test|t <port>                 Test if a port is closed or open
  find|f [options] <min> <max>  Find ports that are available to use
  filter|i <ports...>           Find ports that are open whithin a list of ports
  monitor|m <ports...>          Monitor a list of ports and logs to the terminal when port state had changed

Options:

  -h, --help     output usage information
  -V, --version  output the version number

```

### Testing

```bash
git clone git@github.com:alanhoff/node-portastic.git
cd node-portastic
npm install && npm test
```

### Debugging

To see debug messages you must set your enviroment variable `DEBUG` to `*` or
`portastic:*`, example:

```bash
DEBUG=portastic:\* npm test
```

### License (ISC)

```
Copyright (c) 2015, Alan Hoffmeister <alanhoffmeister@gmail.com>

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

[0]: https://coveralls.io/github/alanhoff/node-portastic
[1]: https://travis-ci.org/alanhoff/node-portastic
[2]: https://david-dm.org/alanhoff/node-portastic
