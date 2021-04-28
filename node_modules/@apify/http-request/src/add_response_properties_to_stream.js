/**
 * Adds most used response attributes to stream.
 * @param stream {Stream} - Stream to what are the response attributes added.
 * @param response {http.IncomingMessage} - Response.
 * @return {Stream} - Stream with response attributes
 */
module.exports = function (stream, response) {
    stream.statusCode = response.statusCode;
    stream.headers = response.headers;
    stream.complete = response.complete;
    stream.httpVersion = response.httpVersion;
    stream.rawHeaders = response.rawHeaders;
    stream.rawTrailers = response.rawTrailers;
    stream.socket = response.socket;
    stream.statusMessage = response.statusMessage;
    stream.trailers = response.trailers;
    stream.url = response.url;
    stream.request = response.request;

    return stream;
};
