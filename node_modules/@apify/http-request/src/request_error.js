/**
 * Extended Error class to handle errors.
 */
class RequestError extends Error {
    /**
     * constructor
     * @param {string} message
     * @param {PassThrough} response
     */
    constructor(message, response) {
        super(message);
        this.response = { body: response.body, headers: response.headers };
        this.statusCode = response.status;
    }
}

module.exports = RequestError;
