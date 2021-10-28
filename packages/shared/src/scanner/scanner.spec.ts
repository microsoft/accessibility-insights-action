// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as util from 'util';
import {
    AICombinedReportDataConverter,
    AICrawler,
    BaselineEvaluation,
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

describe(Scanner, () => {
    let aiCrawlerMock: IMock<AICrawler>;
    let reportGeneratorMock: IMock<ConsolidatedReportGenerator>;
    let progressReporterMock: IMock<AllProgressReporter>;
    let localFileServerMock: IMock<LocalFileServer>;
    let promiseUtilsMock: IMock<PromiseUtils>;
    let axeInfoMock: IMock<AxeInfo>;
    let combinedReportConverterMock: IMock<AICombinedReportDataConverter>;
    let processStub: typeof process;
    let exitMock: IMock<(code: number) => void>;
    let loggerMock: IMock<Logger>;
    let crawlArgumentHandlerMock: IMock<CrawlArgumentHandler>;
    let taskConfigMock: IMock<TaskConfig>;
    let crawlerParametersBuilder: IMock<CrawlerParametersBuilder>;
    let baselineOptionsBuilderMock: IMock<BaselineOptionsBuilder>;
    let scanner: Scanner;
    let combinedScanResult: CombinedScanResult;
    let scanArguments: ScanArguments;

    const scanTimeoutMsec = 100000;

    beforeEach(() => {
        aiCrawlerMock = Mock.ofType<AICrawler>();
        reportGeneratorMock = Mock.ofType(ConsolidatedReportGenerator);
        progressReporterMock = Mock.ofType(AllProgressReporter);
        localFileServerMock = Mock.ofType(LocalFileServer, MockBehavior.Strict);
        promiseUtilsMock = Mock.ofType(PromiseUtils);
        axeInfoMock = Mock.ofType<AxeInfo>();
        combinedReportConverterMock = Mock.ofType<AICombinedReportDataConverter>();
        exitMock = Mock.ofType<(_: number) => void>();
        processStub = {
            exit: exitMock.object,
        } as typeof process;
        loggerMock = Mock.ofType(Logger);
        crawlArgumentHandlerMock = Mock.ofType<CrawlArgumentHandler>();
        taskConfigMock = Mock.ofType<TaskConfig>();
        crawlerParametersBuilder = Mock.ofType<CrawlerParametersBuilder>();
        baselineOptionsBuilderMock = Mock.ofType<BaselineOptionsBuilder>(null, MockBehavior.Strict);
        scanner = new Scanner(
            aiCrawlerMock.object,
            reportGeneratorMock.object,
            progressReporterMock.object,
            localFileServerMock.object,
            promiseUtilsMock.object,
            axeInfoMock.object,
            combinedReportConverterMock.object,
            processStub,
            loggerMock.object,
            crawlArgumentHandlerMock.object,
            taskConfigMock.object,
            crawlerParametersBuilder.object,
            baselineOptionsBuilderMock.object,
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
        it('performs expected steps in happy path with remote url', async () => {
            setupMocksForSuccessfulScan();
            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('performs expected steps in happy path with local url (starts file server)', async () => {
            scanArguments.url = '';
            localFileServerMock.setup((m) => m.start()).returns((_) => Promise.resolve('localhost'));
            setupMocksForSuccessfulScan();
            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
            localFileServerMock.verify((m) => m.start(), Times.once());
        });

        it('passes BaselineEvaluation to ProgressReporter', async () => {
            setupMocksForSuccessfulScan({} as BaselineEvaluation);
            setupWaitForPromisetoReturnOriginalPromise();

            await scanner.scan();

            verifyMocks();
        });

        it('reports error when timeout occurs', async () => {
            const errorMessage = `Scan timed out after ${scanTimeoutMsec / 1000} seconds`;
            localFileServerMock.setup((m) => m.stop()).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logError(errorMessage)).verifiable(Times.once());
            exitMock.setup((em) => em(1)).verifiable(Times.once());
            taskConfigMock
                .setup((m) => m.getScanTimeout())
                .returns((_) => scanTimeoutMsec)
                .verifiable(Times.once());
            setupWaitForPromiseToReturnTimeoutPromise();
            await scanner.scan();

            verifyMocks();
        });

        it('should trackException on error', async () => {
            const errorMessage = 'some err';
            const error = new Error(errorMessage);

            taskConfigMock.setup((m) => m.getScanTimeout()).returns((_) => scanTimeoutMsec);
            progressReporterMock.setup((m) => m.start()).throws(error);

            loggerMock
                .setup((lm) => lm.trackExceptionAny(error, `An error occurred while scanning website page undefined`))
                .verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Accessibility scanning of URL undefined completed`)).verifiable(Times.once());
            progressReporterMock.setup((p) => p.failRun(util.inspect(error))).verifiable(Times.once());
            localFileServerMock.setup((m) => m.stop()).verifiable(Times.once());

            setupWaitForPromisetoReturnOriginalPromise();

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
            progressReporterMock.setup((p) => p.start()).verifiable(Times.once());
            crawlArgumentHandlerMock
                .setup((m) => m.processScanArguments(It.isAny()))
                .returns((_) => scanArguments)
                .verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`Starting accessibility scanning of URL ${scanArguments.url}`)).verifiable(Times.once());
            loggerMock
                .setup((lm) => lm.logInfo(`Chrome app executable: ${scanArguments.chromePath ?? 'system default'}`))
                .verifiable(Times.once());

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

        function setupWaitForPromisetoReturnOriginalPromise(): void {
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
    }
});
