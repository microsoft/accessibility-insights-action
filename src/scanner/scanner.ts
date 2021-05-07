// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AICrawler,
    CombinedScanResult,
    AICombinedReportDataConverter,
    ScanArguments,
    CrawlerParametersBuilder,
} from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import * as util from 'util';
import { iocTypes } from '../ioc/ioc-types';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { AllProgressReporter } from '../progress-reporter/all-progress-reporter';
import { PromiseUtils } from '../utils/promise-utils';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { toolName } from '../content/strings';
import { AxeInfo } from '../axe/axe-info';
import { ConsolidatedReportGenerator } from '../report/consolidated-report-generator';
import { CrawlArgumentHandler } from './crawl-argument-handler';
import { TaskConfig } from '../task-config';
import { isEmpty } from 'lodash';

@injectable()
export class Scanner {
    private scanTimeoutMsec = 90000;

    constructor(
        @inject(AICrawler) private readonly crawler: AICrawler,
        @inject(ConsolidatedReportGenerator) private readonly reportGenerator: ConsolidatedReportGenerator,
        @inject(AllProgressReporter) private readonly allProgressReporter: AllProgressReporter,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(AxeInfo) private readonly axeInfo: AxeInfo,
        @inject(AICombinedReportDataConverter) private readonly combinedReportDataConverter: AICombinedReportDataConverter,
        @inject(iocTypes.Process) protected readonly currentProcess: typeof process,
        @inject(Logger) private readonly logger: Logger,
        @inject(CrawlArgumentHandler) private readonly crawlArgumentHandler: CrawlArgumentHandler,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(CrawlerParametersBuilder) private readonly crawlerParametersBuilder: CrawlerParametersBuilder,
    ) {}

    public async scan(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/require-await
        await this.promiseUtils.waitFor(this.invokeScan(), this.scanTimeoutMsec, async () => {
            this.logger.logError(`Scan timed out after ${this.scanTimeoutMsec / 1000} seconds`);
            this.currentProcess.exit(1);
        });
    }

    private async invokeScan(): Promise<void> {
        let scanArguments: ScanArguments;
        let localServerUrl: string;

        try {
            await this.allProgressReporter.start();

            if (isEmpty(this.taskConfig.getUrl())) {
                localServerUrl = await this.fileServer.start();
            }

            scanArguments = this.crawlArgumentHandler.processScanArguments(localServerUrl);

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanArguments.url}`);
            this.logger.logInfo(`Chrome app executable: ${scanArguments.chromePath ?? 'system default'}`);

            const crawlerParameters = this.crawlerParametersBuilder.build(scanArguments);

            const scanStarted = new Date();
            const combinedScanResult = await this.crawler.crawl(crawlerParameters);
            const scanEnded = new Date();

            const combinedReportResult = this.getCombinedReportResult(combinedScanResult, scanStarted, scanEnded);
            this.reportGenerator.generateReport(combinedReportResult);

            await this.allProgressReporter.completeRun(combinedReportResult);
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanArguments?.url}`);
            await this.allProgressReporter.failRun(util.inspect(error));
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanArguments?.url} completed`);
        }
    }

    private getCombinedReportResult(combinedScanResult: CombinedScanResult, scanStarted: Date, scanEnded: Date): CombinedReportParameters {
        const scanResultData = {
            baseUrl: combinedScanResult.scanMetadata.baseUrl ?? 'n/a',
            basePageTitle: combinedScanResult.scanMetadata.basePageTitle,
            scanEngineName: toolName,
            axeCoreVersion: this.axeInfo.version,
            browserUserAgent: combinedScanResult.scanMetadata.userAgent,
            urlCount: combinedScanResult.urlCount,
            scanStarted,
            scanEnded,
            browserResolution: '1920x1080', // resoluton is fixed by crawler implementation
        };

        return this.combinedReportDataConverter.convertCrawlingResults(combinedScanResult.combinedAxeResults, scanResultData);
    }
}
