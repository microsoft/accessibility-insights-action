const zlib = require('zlib');

const inflate = require('./inflate');
const maybeCreateBrotliDecompressor = require('./maybe_create_brotli_decompressor');

/**
 * Decompress function handling br, deflate, gzip compressions
 * Functions checks if you have "iltorb" peer dependency installed in case of Node.js version older than 12.
 * If node version 12+ is installed function uses Node.js brotli decompress function, otherwise "iltorb" is used
 * @param response {Stream} - Node.js response stream
 * @param useBrotli {boolean} - if true brotli decompression  is enabled
 * @return {Stream} - in case of know compression decompressed stream is returner otherwise raw stream is returned
 */

function decompress(response, useBrotli) {
    const compression = response.headers['content-encoding'] || 'identity';

    let decompressor;

    switch (compression) {
        case 'br':
            decompressor = maybeCreateBrotliDecompressor(response, useBrotli);
            break;
        case 'deflate':
            decompressor = inflate.createInflate();
            break;
        case 'gzip':
            decompressor = zlib.createGunzip();
            break;
        case 'identity':
            return response;
        default:
            throw new Error(`Invalid Content-Encoding header. Expected gzip, deflate or br, but received: ${compression}`);
    }

    return response.pipe(decompressor);
}

module.exports = decompress;
