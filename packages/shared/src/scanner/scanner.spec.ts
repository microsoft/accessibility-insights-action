// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import {
    AICombinedReportDataConverter,
    AICrawler,
    BaselineEvaluation,
    BaselineFileUpdater,
    BaselineOptions,
    BaselineOptionsBuilder,
    CombinedScanResult,
    CrawlerParametersBuilder,
    CrawlerRunOptions,
    ScanArguments,
} from 'accessibility-insights-scan';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { AllProgressReporter } from '../progress-reporter/all-progress-reporter';
import { PromiseUtils } from '../utils/promise-utils';
import { Scanner } from './scanner';
import { ConsolidatedReportGenerator } from '../report/consolidated-report-generator';
import { AxeInfo } from '../axe/axe-info';
import { CrawlArgumentHandler } from './crawl-argument-handler';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { TaskConfig } from '../task-config';
import * as fs from 'fs';
import { TelemetryClient } from '../telemetry/telemetry-client';

describe(Scanner, () => {
    let aiCrawlerMock: IMock<AICrawler>;
    let reportGeneratorMock: IMock<ConsolidatedReportGenerator>;
    let progressReporterMock: IMock<AllProgressReporter>;
    let localFileServerMock: IMock<LocalFileServer>;
    let promiseUtilsMock: IMock<PromiseUtils>;
    let axeInfoMock: IMock<AxeInfo>;
    let combinedReportConverterMock: IMock<AICombinedReportDataConverter>;
    let loggerMock: IMock<Logger>;
    let crawlArgumentHandlerMock: IMock<CrawlArgumentHandler>;
    let taskConfigMock: IMock<TaskConfig>;
    let crawlerParametersBuilder: IMock<CrawlerParametersBuilder>;
    let baselineOptionsBuilderMock: IMock<BaselineOptionsBuilder>;
    let baselineFileUpdaterMock: IMock<BaselineFileUpdater>;
    let telemetryClientMock: IMock<TelemetryClient>;
    let fsMock: IMock<typeof fs>;
    let scanner: Scanner;
    let combinedScanResult: CombinedScanResult;
    let scanArguments: ScanArguments;

    const scanTimeoutMsec = 100000;
    const reportOutDir = 'reportOutDir';

    beforeEach(() => {
        aiCrawlerMock = Mock.ofType<AICrawler>();
        reportGeneratorMock = Mock.ofType(ConsolidatedReportGenerator);
        progressReporterMock = Mock.ofType(AllProgressReporter);
        localFileServerMock = Mock.ofType(LocalFileServer, MockBehavior.Strict);
        promiseUtilsMock = Mock.ofType(PromiseUtils);
        axeInfoMock = Mock.ofType<AxeInfo>();
        combinedReportConverterMock = Mock.ofType<AICombinedReportDataConverter>();
        loggerMock = Mock.ofType(Logger);
        crawlArgumentHandlerMock = Mock.ofType<CrawlArgumentHandler>();
        taskConfigMock = Mock.ofType<TaskConfig>();
        crawlerParametersBuilder = Mock.ofType<CrawlerParametersBuilder>();
        baselineOptionsBuilderMock = Mock.ofType<BaselineOptionsBuilder>(null, MockBehavior.Strict);
        baselineFileUpdaterMock = Mock.ofType<BaselineFileUpdater>();
        telemetryClientMock = Mock.ofType<TelemetryClient>();
        fsMock = Mock.ofType<typeof fs>();
        scanner = new Scanner(
            aiCrawlerMock.object,
            reportGeneratorMock.object,
            progressReporterMock.object,
            localFileServerMock.object,
            promiseUtilsMock.object,
            axeInfoMock.object,
            combinedReportConverterMock.object,
            loggerMock.object,
            crawlArgumentHandlerMock.object,
            taskConfigMock.object,
            crawlerParametersBuilder.object,
            baselineOptionsBuilderMock.object,
            baselineFileUpdaterMock.object,
            telemetryClientMock.object,
            fsMock.object,
        );
        combinedScanResult = {
            scanMetadata: {
                baseUrl: 'baseUrl',
            },
        };
        scanArguments = {
            url: 'url',
            chromePath: 'chrome',
            axeSourcePath: 'axe',
        } as ScanArguments;
    });

    describe('scan', () => {
        it('performs expected steps in happy path with remote url and returns true', async () => {
            setupMocksForSuccessfulScan();
            setupWaitForPromiseToReturnOriginalPromise();

            const result = await scanner.scan();
            expect(result).toBe(true);

            verifyMocks();
        });

        it('performs expected steps in happy path with local url (starts file server) and returns true', async () => {
            scanArguments.url = '';
            localFileServerMock.setup((m) => m.start()).returns((_) => Promise.resolve('localhost'));
            setupMocksForSuccessfulScan();
            setupWaitForPromiseToReturnOriginalPromise();

            await expect(scanner.scan()).resolves.toBe(true);

            verifyMocks();
            localFileServerMock.verify((m) => m.start(), Times.once());
        });

        it('passes BaselineEvaluation to ProgressReporter', async () => {
            setupMocksForSuccessfulScan({} as BaselineEvaluation);
            setupWaitForPromiseToReturnOriginalPromise();

            await expect(scanner.scan()).resolves.toBe(true);

            verifyMocks();
        });

        it('reports error when timeout occurs and returns false', async () => {
            const errorMessage = `Scan timed out after ${scanTimeoutMsec / 1000} seconds`;
            localFileServerMock.setup((m) => m.stop()).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logError(errorMessage)).verifiable(Times.once());
            taskConfigMock
                .setup((m) => m.getScanTimeout())
                .returns((_) => scanTimeoutMsec)
                .verifiable(Times.once());
            setupWaitForPromiseToReturnTimeoutPromise();
            await expect(scanner.scan()).resolves.toBe(false);

            verifyMocks();
        });

        it('should trackException and return false after an Error is thrown', async () => {
            const errorMessage = 'some err';
            const error = new Error(errorMessage);

            taskConfigMock.setup((m) => m.getScanTimeout()).returns((_) => scanTimeoutMsec);
            progressReporterMock.setup((m) => m.start()).throws(error);

            loggerMock
                .setup((lm) => lm.trackExceptionAny(error, `An error occurred while scanning website page undefined`))
                .verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Accessibility scanning of URL undefined completed`)).verifiable(Times.once());
            progressReporterMock.setup((p) => p.failRun()).verifiable(Times.once());
            localFileServerMock.setup((m) => m.stop()).verifiable(Times.once());

            setupWaitForPromiseToReturnOriginalPromise();

            await expect(scanner.scan()).resolves.toBe(false);

            verifyMocks();
        });

        it('emits the expected pattern of telemetry', async () => {
            setupMocksForSuccessfulScan();
            setupWaitForPromiseToReturnOriginalPromise();

            telemetryClientMock.setup((m) => m.trackEvent({ name: 'ScanStart' }));
            telemetryClientMock.setup((m) => m.flush());

            await scanner.scan();

            verifyMocks();
        });

        function setupMocksForSuccessfulScan(baselineEvaluation?: BaselineEvaluation): void {
            taskConfigMock
                .setup((m) => m.getScanTimeout())
                .returns((_) => scanTimeoutMsec)
                .verifiable(Times.once());
            taskConfigMock
                .setup((m) => m.getUrl())
                .returns((_) => scanArguments.url)
                .verifiable(Times.once());
            taskConfigMock
                .setup((m) => m.getReportOutDir())
                .returns(() => reportOutDir)
                .verifiable(Times.once());
            progressReporterMock.setup((p) => p.start()).verifiable(Times.once());
            progressReporterMock
                .setup((m) => m.didScanSucceed())
                .returns(() => Promise.resolve(true))
                .verifiable(Times.once());
            crawlArgumentHandlerMock
                .setup((m) => m.processScanArguments(It.isAny()))
                .returns((_) => scanArguments)
                .verifiable(Times.once());
            loggerMock.setup((lm) => lm.logDebug(`Starting accessibility scanning of URL ${scanArguments.url}`)).verifiable(Times.once());
            loggerMock
                .setup((lm) => lm.logDebug(`Chrome app executable: ${scanArguments.chromePath ?? 'system default'}`))
                .verifiable(Times.once());
            loggerMock
                .setup((lm) => lm.logInfo(`Report output directory does not exist. Creating directory ${reportOutDir}`))
                .verifiable(Times.once());

            fsMock
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                .setup((fsm) => fsm.existsSync(reportOutDir))
                .returns(() => false)
                .verifiable();
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fsMock.setup((fsm) => fsm.mkdirSync(reportOutDir)).verifiable();

            const crawlerParams: CrawlerRunOptions = {
                baseUrl: scanArguments.url,
            };

            const baselineOptions: BaselineOptions = {} as BaselineOptions;

            crawlerParametersBuilder
                .setup((m) => m.build(scanArguments))
                .returns((_) => crawlerParams)
                .verifiable(Times.once());
            baselineOptionsBuilderMock
                .setup((m) => m.build(scanArguments))
                .returns(() => baselineOptions)
                .verifiable(Times.once());
            baselineFileUpdaterMock
                .setup((m) => m.updateBaseline(scanArguments, baselineEvaluation))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());

            combinedScanResult.baselineEvaluation = baselineEvaluation;
            aiCrawlerMock
                .setup((m) => m.crawl(crawlerParams, baselineOptions))
                .returns(async () => {
                    return Promise.resolve(combinedScanResult);
                })
                .verifiable(Times.once());

            const combinedReportData = {} as CombinedReportParameters;
            axeInfoMock.setup((m) => m.version).returns((_) => 'version');
            combinedReportConverterMock
                .setup((m) => m.convertCrawlingResults(It.isAny(), It.isAny()))
                .returns((_) => combinedReportData)
                .verifiable(Times.once());
            reportGeneratorMock.setup((rgm) => rgm.generateReport(combinedReportData)).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Accessibility scanning of URL ${scanArguments.url} completed`)).verifiable(Times.once());
            progressReporterMock.setup((p) => p.completeRun(combinedReportData, baselineEvaluation)).verifiable(Times.once());
            localFileServerMock.setup((lfs) => lfs.stop()).verifiable();
        }

        function setupWaitForPromiseToReturnOriginalPromise(): void {
            promiseUtilsMock
                .setup((s) => s.waitFor(It.isAny(), scanTimeoutMsec, It.isAny()))
                // eslint-disable-next-line @typescript-eslint/require-await
                .returns(async (scanPromiseObj) => {
                    return scanPromiseObj;
                })
                .verifiable(Times.once());
        }

        function setupWaitForPromiseToReturnTimeoutPromise(): void {
            promiseUtilsMock
                .setup((s) => s.waitFor(It.isAny(), scanTimeoutMsec, It.isAny()))
                // eslint-disable-next-line @typescript-eslint/require-await
                .returns(async (_, __, timeoutCb) => {
                    return timeoutCb();
                })
                .verifiable(Times.once());
        }
    });

    function verifyMocks(): void {
        progressReporterMock.verifyAll();
        crawlArgumentHandlerMock.verifyAll();
        loggerMock.verifyAll();
        aiCrawlerMock.verifyAll();
        axeInfoMock.verifyAll();
        combinedReportConverterMock.verifyAll();
        reportGeneratorMock.verifyAll();
        localFileServerMock.verifyAll();
        promiseUtilsMock.verifyAll();
        baselineOptionsBuilderMock.verifyAll();
        baselineFileUpdaterMock.verifyAll();
        telemetryClientMock.verifyAll();
        fsMock.verifyAll();
    }
});
