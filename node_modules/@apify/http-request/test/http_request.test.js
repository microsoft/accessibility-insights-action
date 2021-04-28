const zlib = require('zlib');
const express = require('express');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const { compress } = require('iltorb');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ProxyChain = require('proxy-chain');

const upload = multer();

const { readStreamToString } = require('apify-shared/streams_utilities');
const httpRequest = require('../src/index');

const CONTENT = 'CONTENT';
const HOST = '127.0.0.1';
const ERROR_BODY = 'CUSTOM_ERROR';

const startExpressAppPromise = (app, port) => {
    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
};

describe('httpRequest', () => {
    let mochaListener;
    let port;
    let server;

    beforeAll(async () => {
        const file = fs.createWriteStream('./bigFile.txt');

        for (let i = 0; i <= 1e6; i++) {
            file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n'); //eslint-disable-line
        }
        file.end();

        const app = express();
        app.use(bodyParser.urlencoded({
            extended: true,
        }));
        app.use(bodyParser.json());

        app.get('/timeOut', async (req, res) => {
            const timeout = parseInt(req.query.timeout, 10);
            await new Promise(resolve => setTimeout(resolve, timeout));
            res.status(200);
            res.send(CONTENT);
        });

        app.get('/invalidJson', (req, res) => {
            res.status(200);
            res.setHeader('content-type', req.headers['content-type']);
            res.send('["test" : 123]');
        });

        app.get('/proxy2', async (req, res) => {
            const ip = req.connection.remoteAddress;
            res.status(200);
            res.send(ip);
        });

        app.post('/echo', (req, res) => {
            res.setHeader('content-type', req.headers['content-type']);
            res.send(req.body);
        });

        app.post('/multipart', upload.single('file'), (req, res) => {
            res.send(req.file);
        });

        app.get('/gzip', (req, res) => {
            zlib.gzip(CONTENT, (error, result) => {
                if (error) throw error;
                res.setHeader('content-encoding', 'gzip');
                res.send(result);
            });
        });

        app.get('/deflate', (req, res) => {
            // return zlib.compress(CONTENT);
            zlib.deflate(CONTENT, (error, result) => {
                if (error) throw error;
                res.setHeader('content-encoding', 'deflate');
                res.send(result);
            });
        });

        app.get('/deflate-raw', (req, res) => {
            // return zlib.compress(CONTENT);
            zlib.deflateRaw(CONTENT, (error, result) => {
                if (error) throw error;
                res.setHeader('content-encoding', 'deflate');
                res.send(result);
            });
        });

        app.get('/brotli', async (req, res) => {
            // return zlib.compress(CONTENT);
            const compressed = await compress(Buffer.from(CONTENT, 'utf8'));

            res.setHeader('content-encoding', 'br');
            res.send(compressed);
        });

        app.get('/500', (req, res) => {
            res.status(500);
            res.send(ERROR_BODY);
        });

        app.get('/500/invalidBody', async (req, res) => {
            const compressed = await compress(Buffer.from(CONTENT, 'utf8'));

            res.setHeader('content-encoding', 'deflate');
            res.status(500);
            res.send(compressed);
        });

        app.get('/invalidBody', async (req, res) => {
            const compressed = await compress(Buffer.from('{', 'utf8'));

            res.setHeader('content-encoding', 'deflate');
            res.status(500);
            res.send(compressed);
        });

        app.get('/rawHeaders', (req, res) => {
            res.send(JSON.stringify(req.rawHeaders));
        });

        app.get('/bigFile', (req, res) => {
            const src = fs.createReadStream('./bigFile.txt');
            src.pipe(res);
        });

        server = await startExpressAppPromise(app, 0);
        port = server.address().port; //eslint-disable-line
    });

    afterAll(() => {
        server.close();
        process.on('uncaughtException', mochaListener);
        fs.unlinkSync('./bigFile.txt');
    });

    test('Test multipart/form-data format support.', async () => { // multipart/form-data
        const fileName = 'http_request.test.js';
        const filePath = path.join(__dirname, fileName);
        const form = new FormData();

        form.append('field2', 'my value');
        form.append('file', fs.createReadStream(filePath));

        const opts = {
            url: `http://${HOST}:${port}/multipart`,
            method: 'POST',
            payload: form,

        };
        const response = await httpRequest(opts);
        const body = JSON.parse(response.body);
        expect(response.statusCode).toBe(200);
        expect(body.mimetype).toBe('application/javascript');
        expect(body.fieldname).toBe('file');
    });

    test('throws error when decode body is false and parse body is true', async () => {
        const data = {
            url: `http://${HOST}:${port}/gzip`,
            decodeBody: false,
            json: true,

        };
        let error;

        try {
            await httpRequest(data);
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe('If the "json" parameter is true, "decodeBody" must be also true.');
    });


    test('sends payload', async () => {
        const payload = JSON.stringify({
            TEST: 'TEST',
        });
        const options = {
            url: `http://${HOST}:${port}/echo`,
            payload,
            method: 'POST',
            parseBody: false,
            decodeBody: true,
            useCaseSensitiveHeaders: false,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await httpRequest(options);

        expect(response.body).toEqual(payload);
    });

    test('decompress deflateRaw when content-encoding is deflate', async () => {
        const { body } = await httpRequest({ url: `http://${HOST}:${port}/deflate-raw` });
        expect(body).toEqual(CONTENT);
    });


    test('has timeout parameter working', async () => {
        const waitTime = 1000;
        const options = {
            url: `http://${HOST}:${port}/timeout?timeout=${waitTime}`,
            timeoutSecs: 0.2,
        };
        let error;
        const start = Date.now();
        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }
        const end = Date.now();
        expect((end - start) > waitTime).toBe(false);
        expect(error.message.includes("Timeout awaiting 'request'")).toBe(true);
    });

    test('has valid return value', async () => {
        const response = await httpRequest({ url: `http://${HOST}:${port}/echo`, parseBody: false });
        expect(response).toHaveProperty('body');
        expect(response).toHaveProperty('statusCode');
        expect(response).toHaveProperty('headers');
        expect(response).toHaveProperty('request');
    });

    test('catches SSL Errors', async () => {
        let error;
        try {
            await httpRequest({ url: 'https://self-signed.badssl.com/', ignoreSslErrors: false });
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined(); // eslint-disable-line
    });

    test('ignores SSL Errors', async () => {
        let error;
        try {
            await httpRequest({ url: 'https://self-signed.badssl.com/', ignoreSslErrors: true });
        } catch (e) {
            error = e;
        }
        expect(error).toBeUndefined(); // eslint-disable-line
    });


    test('passes response to abortFunction', async () => {
        let response;
        const data = {
            url: `http://${HOST}:${port}/gzip`,
            abortFunction: (res) => {
                response = res;
                return false;
            },

        };

        await httpRequest(data);

        expect(response.constructor.name).toBe('IncomingMessage');
        expect(response.body).toBe(CONTENT);
    });

    test('it does not aborts request when aborts function returns false', async () => {
        let aborted = false;
        const data = {
            url: `http://${HOST}:${port}/gzip`,
            abortFunction: (response) => {
                response.on('aborted', () => {
                    aborted = true;
                });
                return false;
            },

        };
        await httpRequest(data);
        expect(aborted).toBe(false);
    });

    test('it aborts request', async () => {
        const data = {
            url: `http://${HOST}:${port}/gzip`,
            abortFunction: () => {
                return true;
            },

        };

        let error;

        try {
            await httpRequest(data);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual(`Request for ${data.url} aborted due to abortFunction`);
    });

    test('decompress gzip', async () => {
        const options = {
            url: `http://${HOST}:${port}/gzip`,
            parseBody: false,

        };

        const response = await httpRequest(options);
        expect(response.body).toEqual(CONTENT);
    });

    test('decompress deflate', async () => {
        const options = {
            url: `http://${HOST}:${port}/deflate`,
            parseBody: false,

        };

        const response = await httpRequest(options);
        expect(response.body).toEqual(CONTENT);
    });

    test('decompress brotli', async () => {
        const options = {
            url: `http://${HOST}:${port}/brotli`,
            parseBody: false,
            useBrotli: true,

        };

        const response = await httpRequest(options);
        expect(response.body).toEqual(CONTENT);
    });

    test('it does not throw error for 400+ error codes when throwOnHttpError is false', async () => {
        const options = {
            url: `http://${HOST}:${port}/500`,
        };
        let error;
        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }
                expect(error).toBeUndefined(); // eslint-disable-line
    });

    test('it does throw error for 400+ error codes when throwOnHttpErrors is true', async () => {
        const options = {
            url: `http://${HOST}:${port}/500`,
            throwOnHttpErrors: true,

        };
        let error;

        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }

            expect(error.message).toBeDefined(); // eslint-disable-line
    });

    test('it throws error when the body cannot be parsed and the code is 500 when throwOnHttpErrors is true', async () => {
        const options = {
            url: `http://${HOST}:${port}/500/invalidBody`,
            throwOnHttpErrors: true,

        };
        let error;
        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }
                expect(error.message).toBeDefined(); // eslint-disable-line
    });

    test('it throws error when the body cannot be parsed', async () => {
        const options = {
            url: `http://${HOST}:${port}/invalidBody`,
            json: true,

        };
        let error;
        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }
            expect(error.message).toBeDefined(); // eslint-disable-line
    });

    test('it returns stream when stream is set to true', async () => {
        const options = {
            url: `http://${HOST}:${port}/gzip`,
            stream: true,

        };
        const stream = await httpRequest(options);

        // check for response properties.
        expect(stream.statusCode).toBe(200);
        expect(stream.headers).toBeDefined();
        expect(stream.complete).toBeDefined();
        expect(stream.httpVersion).toBe('1.1');
        expect(stream.rawHeaders).toBeDefined();
        expect(stream.rawTrailers).toBeDefined();
        expect(stream.socket).toBeDefined();
        expect(stream.statusMessage).toBe('OK');
        expect(stream.trailers).toBeDefined();
        expect(stream.url).toBeDefined();
        expect(stream.request).toBeDefined();
        expect(stream.request.options).toBeDefined();

        const content = await readStreamToString(stream);
        expect(content).toEqual(CONTENT);
        expect(stream.constructor.name).not.toBe('Promise');
    });

    test(
        'it catches errors from abort functions and rejects the promise with the same error',
        async () => {
            const error = new Error('Custom error');
            const options = {
                url: `http://${HOST}:${port}/gzip`,
                stream: false,
                abortFunction: () => {
                    throw error;
                },

            };
            let rejectedError;
            try {
                await httpRequest(options);
            } catch (e) {
                rejectedError = e;
            }
            expect(rejectedError.message).toEqual(error.message);
        },
    );

    test('it rethrows error if the json body cannot be parsed', async () => {
        const options = {
            url: `http://${HOST}:${port}/invalidJson`,
            json: true,

        };
        let rejectedError;
        try {
            await httpRequest(options);
        } catch (e) {
            rejectedError = e;
        }
        expect(rejectedError.message).toBe('Could not parse the body');
    });

    test('headers work as expected', async () => {
        const options = {
            url: `http://${HOST}:${port}/rawHeaders`,
            json: true,
            useCaseSensitiveHeaders: true,
            headers: {
                'User-Agent': 'Test',
                Host: HOST,
            },

        };
        const { body } = await httpRequest(options);

        expect(body.includes('Host')).toBe(true);
        expect(body.includes('User-Agent')).toBe(true);

        options.useCaseSensitiveHeaders = false;
        const { body: body2 } = await httpRequest(options);

        expect(body2.includes('Host')).toBe(false);
        expect(body2.includes('User-Agent')).toBe(false);
    });

    test(
        'headers should have uniqueValues with useCaseSensitive headers',
        async () => {
            const options = {
                url: `http://${HOST}:${port}/rawHeaders`,
                json: true,
                useCaseSensitiveHeaders: true,
                headers: {
                    'User-Agent': 'Test',
                    Host: HOST,
                    host: HOST,
                    'user-agent': 'TEST',
                },

            };
            const { body } = await httpRequest(options);

            expect(body.includes('Host')).toBe(true);
            expect(body.includes('User-Agent')).toBe(true);
            expect(body.includes('user-agent')).toBe(false);
            expect(body.includes('host')).toBe(false);
        },
    );

    test('gets rejected with error thrown from abort function ', async () => {
        class MyError extends Error {

        }
        const testError = new MyError('TEST');

        const options = {
            url: `http://${HOST}:${port}/rawHeaders`,
            abortFunction: () => {
                throw testError;
            },
        };
        let error;
        try {
            await httpRequest(options);
        } catch (e) {
            error = e;
        }

        expect(error.message).toEqual(testError.message);
        expect(error instanceof MyError).toBe(true);
    });

    test('can read a large response using stream API', async () => {
        const options = {
            url: `http://${HOST}:${port}/bigFile`,
            stream: true,
        };
        const response = await httpRequest(options);

        const body = await readStreamToString(response);
        expect(body).toBeDefined(); // eslint-disable-line
    });

    test('can read a large response using promise API', async () => {
        const options = {
            url: `http://${HOST}:${port}/bigFile`,
            stream: false,
        };
        const response = await httpRequest(options);

        expect(response.body).toBeDefined(); // eslint-disable-line
    });

    describe('Proxy', () => {
        let proxyServer;
        const PROXY_PORT = 8000;

        beforeAll(async () => {
            proxyServer = new ProxyChain.Server({
                // Port where the server will listen. By default 8000.
                port: PROXY_PORT,
                verbose: false,
                prepareRequestFunction: ({ request }) => {
                    return {
                        upstreamProxyUrl: null,
                        customResponseFunction: () => {
                            return {
                                headers: Object.assign(request.headers, { 'proxy-test': 'proxy' }) };
                        },
                    };
                },
            });

            await new Promise(((resolve) => {
                proxyServer.listen(() => {
                    console.log(`Proxy server is listening on port ${server.port}`);
                    resolve();
                });
            }));
        });

        afterAll(() => {
            proxyServer.close();
        });

        test('uses proxy (proxyUrl)', async () => {
            const response = await httpRequest({ url: `http://${HOST}:${port}/rawHeaders`, proxyUrl: `http://${HOST}:${PROXY_PORT}`, json: false });
            expect(response.headers['proxy-test']).toEqual('proxy');
        });
    });
});
