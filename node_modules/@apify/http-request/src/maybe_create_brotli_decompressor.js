/**
 * Gets decompressed response from response if the brotli compression is used.
 * Got package by default supports br encoded contents only for Node.js 11.7.0 or later.
 * @param {Stream} response
 * @param {boolean} useBrotli
 * @returns {PassThrough|Stream} - Decompressed response
 * @ignore
 */
module.exports = function maybeCreateBrotliDecompressor(response, useBrotli) {
    const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);

    if (!useBrotli) {
        return response;
    }

    let decompressor;

    if (nodeVersion >= 10.16) {
        decompressor = require('zlib').createBrotliDecompress(); // eslint-disable-line
    } else {
        try {
            decompressor = require('iltorb').decompressStream(); // eslint-disable-line
        } catch (e) {
            throw new Error('You must have the "iltorb" dependency installed to use brotli decompression or use NodeJS v10.16.0+. '
                + 'We did not include iltorb in the installation because it sometimes failed to compile for users '
                + 'on their machines and therefore created unnecessary friction for everyone using NodeJS v10.16.0'
                + ' and above, where it\'s not needed because brotli algorithm has been included into NodeJS stdlib.');
        }
    }

    return decompressor;
};
