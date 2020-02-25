// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import { AIScanner } from 'accessibility-insights-scan';
import * as path from 'path';
import { IMock, It, Mock, Times } from 'typemoq';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';
import { PromiseUtils } from '../utils/promise-utils';
import { Scanner } from './scanner';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

describe(Scanner, () => {
    let scanner: Scanner;
    let scannerMock: IMock<AIScanner>;
    let loggerMock: IMock<Logger>;
    let promiseUtilsMock: IMock<PromiseUtils>;
    let taskConfigMock: IMock<TaskConfig>;
    let localFileServerMock: IMock<LocalFileServer>;
    let processStub: typeof process;
    let exitMock: IMock<(code: number) => any>;
    const scanUrl = 'localhost';
    const baseUrl = 'base';
    // tslint:disable-next-line:mocha-no-side-effect-code
    const axeSourcePath = path.resolve(__dirname, 'axe.js');
    const chromeBin = process.env.CHROME_BIN;

    beforeEach(() => {
        scannerMock = Mock.ofType(AIScanner);
        loggerMock = Mock.ofType(Logger);
        taskConfigMock = Mock.ofType(TaskConfig);
        promiseUtilsMock = Mock.ofType(PromiseUtils);
        localFileServerMock = Mock.ofType(LocalFileServer);
        exitMock = Mock.ofInstance((code: number) => undefined);
        processStub = {
            exit: exitMock.object,
        } as typeof process;
        scanner = new Scanner(
            loggerMock.object,
            scannerMock.object,
            taskConfigMock.object,
            localFileServerMock.object,
            promiseUtilsMock.object,
            processStub,
        );

        taskConfigMock
            .setup(tm => tm.getScanUrlRelativePath())
            .returns(() => scanUrl)
            .verifiable();
        localFileServerMock
            .setup(async lfs => lfs.start())
            .returns(() => Promise.resolve(baseUrl))
            .verifiable();
        localFileServerMock.setup(lfs => lfs.stop()).verifiable();
    });

    it('should create instance', () => {
        expect(scanner).not.toBeNull();
    });

    describe('scan', () => {
        it('should log info', async () => {
            scannerMock.setup(sm => sm.scan(scanUrl, chromeBin, axeSourcePath)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`)).verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('should trackException on error', async () => {
            const errorMessage: string = 'some err';
            const error = new Error(errorMessage);
            taskConfigMock.reset();
            taskConfigMock
                .setup(tm => tm.getScanUrlRelativePath())
                .callback(() => {
                    throw error;
                });
            scannerMock.setup(sm => sm.scan(scanUrl, undefined, axeSourcePath)).verifiable(Times.never());
            loggerMock.setup(lm => lm.logInfo(`Starting accessibility scanning of URL ${undefined}.`)).verifiable(Times.never());
            loggerMock
                .setup(lm => lm.trackExceptionAny(error, `An error occurred while scanning website page ${undefined}.`))
                .verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Accessibility scanning of URL ${undefined} completed.`)).verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('should return timeout promise', async () => {
            const errorMessage: string = `Unable to scan before timeout`;
            scannerMock.setup(sm => sm.scan(scanUrl, chromeBin, axeSourcePath)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logError(errorMessage)).verifiable(Times.once());
            exitMock.setup(em => em(1)).verifiable(Times.once());

            setupWaitForPromiseToReturnTimeoutPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('chrome path is not empty', async () => {
            const chromePath = 'path';
            scannerMock.setup(sm => sm.scan(scanUrl, chromePath, axeSourcePath)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`)).verifiable(Times.once());
            taskConfigMock
                .setup(tcm => tcm.getChromePath())
                .returns(() => chromePath)
                .verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('axe source path is empty', async () => {
            taskConfigMock.reset();
            taskConfigMock
                .setup(tm => tm.getScanUrlRelativePath())
                .returns(() => scanUrl)
                .verifiable();
            scannerMock.setup(sm => sm.scan(scanUrl, chromeBin, path.resolve(__dirname, axeSourcePath))).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`)).verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        function setupWaitForPromisetoReturnOriginalPromise(): void {
            promiseUtilsMock
                .setup(s => s.waitFor(It.isAny(), 90000, It.isAny()))
                .returns(async (scanPromiseObj, timeout, timeoutCb) => {
                    return scanPromiseObj;
                })
                .verifiable();
        }

        function setupWaitForPromiseToReturnTimeoutPromise(): void {
            promiseUtilsMock
                .setup(s => s.waitFor(It.isAny(), 90000, It.isAny()))
                .returns(async (scanPromiseObj, timeout, timeoutCb) => {
                    return timeoutCb();
                })
                .verifiable();
        }
    });

    function verifyMocks(): void {
        scannerMock.verifyAll();
        taskConfigMock.verifyAll();
        promiseUtilsMock.verifyAll();
        localFileServerMock.verifyAll();
        loggerMock.verifyAll();
    }
});
