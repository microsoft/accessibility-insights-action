// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as express from 'express';
import { Express, Handler } from 'express-serve-static-core';
import * as getPort from 'get-port';
import { Server } from 'http';
import * as serveStatic from 'serve-static';
import { IMock, Mock, Times } from 'typemoq';

import { LocalFileServer } from './local-file-server';
import { Logger } from './logger/logger';
import { TaskConfig } from './task-config';

interface ExpressInterface {
    use(handler: any): ExpressInterface;
    listen(port: number): Server;
}

class MockableExpress implements ExpressInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public use(handler: any): ExpressInterface {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public listen(port: number): Server {
        return undefined;
    }
}

describe(LocalFileServer, () => {
    let localFileServer: LocalFileServer;
    let loggerMock: IMock<Logger>;
    let taskConfigMock: IMock<TaskConfig>;
    let getPortMock: IMock<typeof getPort>;
    let expressMock: IMock<typeof express>;
    let serverStaticMock: IMock<typeof serveStatic>;
    let appMock: IMock<MockableExpress>;
    let appHandler: Handler;
    let serverMock: IMock<Server>;
    const scanUrl = 'localhost';
    const port = 80;

    beforeEach(() => {
        loggerMock = Mock.ofType(Logger);
        taskConfigMock = Mock.ofType(TaskConfig);
        getPortMock = Mock.ofType<typeof getPort>();
        serverStaticMock = Mock.ofType<typeof serveStatic>();
        expressMock = Mock.ofType<typeof express>();
        serverMock = Mock.ofType<Server>();
        appMock = Mock.ofType<MockableExpress>();
        appHandler = () => undefined;

        localFileServer = new LocalFileServer(
            taskConfigMock.object,
            loggerMock.object,
            getPortMock.object,
            expressMock.object,
            serverStaticMock.object,
        );
    });

    it('should create instance', () => {
        expect(localFileServer).not.toBeNull();
    });

    describe('start', () => {
        beforeEach(() => {
            setupMocksForLocalFileServerStart();
        });

        it('start', async () => {
            const host = await localFileServer.start();
            expect(host).toBe(`http://localhost:${port}`);
            verifyMocks();
        });

        it('should get the same instance when start is called multiple times', async () => {
            const promiseFunc1 = await localFileServer.start();
            const promiseFunc2 = await localFileServer.start();

            expect(promiseFunc1).toEqual(promiseFunc2);
        });
    });

    describe('stop', () => {
        it('should do nothing if server is not started yet', () => {
            serverMock.setup((sm) => sm.close()).verifiable(Times.never());
            localFileServer.stop();

            verifyMocks();
        });

        it('should close server', async () => {
            setupMocksForLocalFileServerStart();
            serverMock.setup((sm) => sm.close()).verifiable(Times.once());

            await localFileServer.start();
            localFileServer.stop();

            verifyMocks();
        });
    });

    function setupMocksForLocalFileServerStart(): void {
        taskConfigMock
            .setup((tm) => tm.getSiteDir())
            .returns(() => scanUrl)
            .verifiable();

        getPortMock
            .setup(async (gm) => gm())
            .returns(() => Promise.resolve(port))
            .verifiable();

        loggerMock.setup((lm) => lm.logInfo(`Using port ${port}`)).verifiable(Times.once());

        expressMock
            .setup((em) => em())
            .returns(() => appMock.object as Express)
            .verifiable();

        serverStaticMock
            .setup((sm) => sm(scanUrl))
            .returns(() => appHandler)
            .verifiable();

        appMock.setup((am) => am.use(appHandler)).verifiable();

        appMock
            .setup((am) => am.listen(port))
            .returns(() => serverMock.object)
            .verifiable();
    }

    function verifyMocks(): void {
        taskConfigMock.verifyAll();
        getPortMock.verifyAll();
        serverStaticMock.verifyAll();
        expressMock.verifyAll();
        serverMock.verifyAll();
        loggerMock.verifyAll();
    }
});
