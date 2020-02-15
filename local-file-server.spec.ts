// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import * as express from 'express';
import { Express, Handler } from 'express-serve-static-core';
import getPort = require('get-port');
import { Server } from 'http';
import serveStatic = require('serve-static');
import { IMock, It, Mock, Times } from 'typemoq';

import { LocalFileServer } from './local-file-server';
import { Logger } from './logger/logger';
import { TaskConfig } from './task-config';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

interface ExpressInterface {
    use: (handler: any) => ExpressInterface;
    listen: (port: number) => Server;
}

class MockableExpress implements ExpressInterface {
    public use(handler: any): ExpressInterface {
        return null;
    }
    public listen(port: number): Server {
        return null;
    }
}

describe('LocalFileServer', () => {
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
        appHandler = () => {};
        taskConfigMock
            .setup(tm => tm.getSiteDir())
            .returns(() => scanUrl)
            .verifiable();

        getPortMock
            .setup(async gm => gm())
            .returns(() => Promise.resolve(port))
            .verifiable();

        loggerMock.setup(lm => lm.logInfo(`Using port ${port}`)).verifiable(Times.once());

        expressMock
            .setup(em => em())
            .returns(() => appMock.object as Express)
            .verifiable();

        serverStaticMock
            .setup(sm => sm(scanUrl))
            .returns(() => appHandler)
            .verifiable();

        appMock.setup(am => am.use(appHandler)).verifiable();

        appMock
            .setup(am => am.listen(port))
            .returns(() => serverMock.object)
            .verifiable();

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

    it('start', async () => {
        const promiseFunc = await localFileServer.start();
         
        verifyMocks();
    });

    function verifyMocks(): void {
        taskConfigMock.verifyAll();
        getPortMock.verifyAll();
        serverStaticMock.verifyAll();
        expressMock.verifyAll();
        serverMock.verifyAll();
        loggerMock.verifyAll();
    }
});
