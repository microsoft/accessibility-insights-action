# Http Request

Sends a HTTP request and returns the response. This package is used it [Apify SDK](https://www.npmjs.com/package/apify) instead of the old [request](https://www.npmjs.com/package/request)

NPM package. Implements a tunnel agent error fix, better proxy agents and supports `brotli` compression. Fixed `deflate` compression.

The function has similar functionality and has nearly the same options as the [got](https://www.npmjs.com/package/got) NPM package,
 but it brings several additional improvements and fixes:

 *  It support not only Gzip compression, but also Brotli and Deflate. To activate this feature,
  simply add `Accept-Encoding: gzip, deflate, br` to `options.headers` (or a combination) and set `options.useBrotli` to true.
 * Enables abortion of the request based on the response headers, before the data is downloaded.
 See `options.abortFunction` parameter. 
  * Tunnel agent error fix
  * Fixed old deflate compression.
  * Brotli support for Node.js <v12

## Example Usage
 
### Get decoded and decompressed response
 
  ```javascript
     const httpRequest = require("@apify/http-request");
  
     const {headers, body, statusCode} =  await httpRequest({ url: 'https://api.apify.com/v2/browser-info'});
 
 ```
 
## Get JSON from API
 
```javascript
    const httpRequest = require("@apify/http-request");

    const {headers, body, statusCode} =  await httpRequest({ url: 'https://api.apify.com/v2/browser-info', json: true });

```

### Stream the response
```javascript
     const httpRequest = require("@apify/http-request");

     const responseStream =  await httpRequest({ url: 'https://apify.com', stream: true});
```

## API Documentation

It's a `GET` request by default, but can be changed by using different methods or via `options.method`.

### httpRequest([options])

Returns a Promise for a [`response` object](#response) or a [stream](#streams-1) if `options.stream` is set to true.

#### options.url
URL of the target endpoint. Supports both HTTP and HTTPS schemes.

#### options.method
HTTP method. Default value is `GET`.

#### options.headers
HTTP headers. Default value is `{}`.

Note that the function generates several headers itself, unless
they are defined in the `headers` parameter, in which case the function leaves them untouched.
 *  For example, even if you define `{ 'Content-Length': null }`, the function doesn't define
  the 'Content-Length' header and the request will not contain it (due to the `null` value).

#### options.payload
HTTP payload for PATCH, POST and PUT requests. Must be a `Buffer` or `String`.

#### options.followRedirect
Follow HTTP 3xx responses as redirects (default: true).

#### options.maxRedirects
The maximum number of redirects to follow. Default value is `20`

#### options.timeoutSecs
Integer containing the number of milliseconds to wait for a server to send
response headers (and start the response body) before aborting the request.
Note that if the underlying TCP connection cannot be established, the OS-wide
TCP connection timeout will overrule the timeout option (the default in Linux can be anywhere from 20-120 seconds).

Default value is `30`.

#### options.proxyUrl
An HTTP proxy to be used. Supports proxy authentication with Basic Auth.
 
#### options.ignoreSslErrors

If false, requires SSL/TLS certificates to be valid

Default value is `false`
#### options.abortFunction
A function that determines whether the request should be aborted. It is called when the server
responds with the HTTP headers, but before the actual data is downloaded.
class and it should return `true` if request should be aborted, or `false` otherwise.
You can also throw custom error inside the `options.abortFunction`. 
In this case, `httpRequest` aborts the request and throws your custom error.

Default value is `null`.
#### options.throwOnHttpErrors
If set to true function throws and error on 4XX and 5XX response codes.

Default value is `false`.

#### options.decodeBody
If set to true decoded body is returned. Cannot be set to false if the [options.parsedBody] is true.

Default value is `true`

#### options.json
If set to true parsed body is returned. And content-type header is set to `application/json`
It won't work if you have the `options.stream` set to true.

Default value is `false`.

#### options.stream
If set to true decompressed stream is returned.

Default value is `false`

#### options.useBrotli
If set to true Brotli decompression is enabled. Brotli has a Node.js native support from `V10.16.0`. If you use older version you must have the peer dependency `iltorb` installed.

Default value is `false`

### Response
 Promise\<object\> - The response object will typically be a
 * [Node.js HTTP response stream](https://nodejs.org/api/http.html#http_class_http_incomingmessage),
 however, if returned from the cache it will be a [response-like object](https://github.com/lukechilds/responselike) which behaves in the same way.

For more information please see original npm package - [got](https://www.npmjs.com/package/got).
