// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { AIScanner, AxeScanResults } from 'accessibility-insights-scan';
import { IMock, It, Mock, Times } from 'typemoq';
import * as util from 'util';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { AllProgressReporter } from '../progress-reporter/all-progress-reporter';
import { ReportGenerator } from '../report/report-generator';
import { TaskConfig } from '../task-config';
import { PromiseUtils } from '../utils/promise-utils';
import { Scanner } from './scanner';

describe(Scanner, () => {
    let scanner: Scanner;
    let scannerMock: IMock<AIScanner>;
    let reportGeneratorMock: IMock<ReportGenerator>;
    let loggerMock: IMock<Logger>;
    let promiseUtilsMock: IMock<PromiseUtils>;
    let taskConfigMock: IMock<TaskConfig>;
    let progressReporterMock: IMock<AllProgressReporter>;
    let localFileServerMock: IMock<LocalFileServer>;
    let processStub: typeof process;
    let exitMock: IMock<(code: number) => void>;
    let axeScanResults: AxeScanResults;
    const scanUrl = 'localhost';
    const baseUrl = 'base';
    const axeSourcePath = require.resolve('axe-core/axe.min.js');
    const chromePath = 'chrome path';

    beforeEach(() => {
        scannerMock = Mock.ofType(AIScanner);
        reportGeneratorMock = Mock.ofType(ReportGenerator);
        loggerMock = Mock.ofType(Logger);
        taskConfigMock = Mock.ofType(TaskConfig);
        progressReporterMock = Mock.ofType(AllProgressReporter);
        promiseUtilsMock = Mock.ofType(PromiseUtils);
        localFileServerMock = Mock.ofType(LocalFileServer);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exitMock = Mock.ofInstance((code: number) => {
            /* noop */
        });
        axeScanResults = {
            results: {
                violations: [
                    {
                        id: 'color-contrast',
                        nodes: [{ html: 'html' }],
                    },
                ],
            },
        } as AxeScanResults;
        processStub = {
            exit: exitMock.object,
        } as typeof process;
        scanner = new Scanner(
            loggerMock.object,
            scannerMock.object,
            reportGeneratorMock.object,
            taskConfigMock.object,
            progressReporterMock.object,
            localFileServerMock.object,
            promiseUtilsMock.object,
            processStub,
        );

        taskConfigMock
            .setup((tm) => tm.getScanUrlRelativePath())
            .returns(() => scanUrl)
            .verifiable();
        taskConfigMock
            .setup((tcm) => tcm.getChromePath())
            .returns(() => chromePath)
            .verifiable(Times.once());
        localFileServerMock
            .setup(async (lfs) => lfs.start())
            .returns(() => Promise.resolve(baseUrl))
            .verifiable();
        localFileServerMock.setup((lfs) => lfs.stop()).verifiable();
    });

    it('should create instance', () => {
        expect(scanner).not.toBeNull();
    });

    describe('scan', () => {
        it('should log info and create/complete check run', async () => {
            scannerMock
                .setup((sm) => sm.scan(scanUrl, chromePath, axeSourcePath))
                .returns(async () => {
                    return Promise.resolve(axeScanResults);
                })
                .verifiable(Times.once());
            reportGeneratorMock.setup((rgm) => rgm.generateReport(axeScanResults)).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`)).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`)).verifiable(Times.once());
            progressReporterMock.setup((p) => p.start()).verifiable(Times.once());
            progressReporterMock.setup((p) => p.completeRun(axeScanResults)).verifiable(Times.once());
            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('should trackException on error', async () => {
            const errorMessage = 'some err';
            const error = new Error(errorMessage);
            taskConfigMock.reset();
            taskConfigMock
                .setup((tm) => tm.getScanUrlRelativePath())
                .callback(() => {
                    throw error;
                });
            scannerMock.setup((sm) => sm.scan(scanUrl, undefined, axeSourcePath)).verifiable(Times.never());
            loggerMock.setup((lm) => lm.logInfo(`Starting accessibility scanning of URL undefined.`)).verifiable(Times.never());
            loggerMock
                .setup((lm) => lm.trackExceptionAny(error, `An error occurred while scanning website page undefined.`))
                .verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Accessibility scanning of URL undefined completed.`)).verifiable(Times.once());
            progressReporterMock.setup((p) => p.start()).verifiable(Times.once());
            progressReporterMock.setup((p) => p.completeRun(It.isAny())).verifiable(Times.never());
            progressReporterMock.setup((p) => p.failRun(util.inspect(error))).verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('should return timeout promise', async () => {
            const errorMessage = `Unable to scan before timeout`;
            scannerMock.setup((sm) => sm.scan(scanUrl, chromePath, axeSourcePath)).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logError(errorMessage)).verifiable(Times.once());
            exitMock.setup((em) => em(1)).verifiable(Times.once());

            setupWaitForPromiseToReturnTimeoutPromise();

            await scanner.scan();

            verifyMocks();
        });

        function setupWaitForPromisetoReturnOriginalPromise(): void {
            promiseUtilsMock
                .setup((s) => s.waitFor(It.isAny(), 90000, It.isAny()))
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
                .returns(async (scanPromiseObj, timeout, timeoutCb) => {
                    return scanPromiseObj;
                })
                .verifiable();
        }

        function setupWaitForPromiseToReturnTimeoutPromise(): void {
            promiseUtilsMock
                .setup((s) => s.waitFor(It.isAny(), 90000, It.isAny()))
                // eslint-disable-next-line @typescript-eslint/require-await
                .returns(async (scanPromiseObj, timeout, timeoutCb) => {
                    return timeoutCb();
                })
                .verifiable();
        }
    });

    function verifyMocks(): void {
        scannerMock.verifyAll();
        reportGeneratorMock.verifyAll();
        taskConfigMock.verifyAll();
        progressReporterMock.verifyAll();
        promiseUtilsMock.verifyAll();
        localFileServerMock.verifyAll();
        loggerMock.verifyAll();
    }
});
