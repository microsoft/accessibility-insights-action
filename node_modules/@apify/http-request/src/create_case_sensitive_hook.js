/**
 * Overrides got lower-cased headers to case sensitive ones.
 * @param ourOptions {Object} - Got options
 */
module.exports = (ourOptions) => {
    return (gotOptions) => {
        Object.entries(ourOptions.headers).forEach(([key, value]) => {
            if (gotOptions.headers[key.toLowerCase()]) {
                delete gotOptions.headers[key.toLowerCase()];
                gotOptions.headers[key] = value;
            }
        });
        // Do not allow Host header override, because it breaks the internet.
        // If someone needs it, they can use a different client.
        delete gotOptions.headers.Host;
        gotOptions.headers = {
            Host: createNodeLikeHostHeader(gotOptions.url),
            ...gotOptions.headers,
        };
    };
};

/**
 * @param {URL} url
 * @returns {string}
 */
function createNodeLikeHostHeader(url) {
    let hostHeader = url.hostname || url.host || 'localhost';

    // For the Host header, ensure that IPv6 addresses are enclosed
    // in square brackets, as defined by URI formatting
    // https://tools.ietf.org/html/rfc3986#section-3.2.2
    const posColon = hostHeader.indexOf(':');
    if (posColon !== -1
        && hostHeader.includes(':', posColon + 1)
        && hostHeader.charCodeAt(0) !== 91/* '[' */) {
        hostHeader = `[${hostHeader}]`;
    }

    if (url.port) {
        hostHeader += `:${url.port}`;
    }
    return hostHeader;
}
