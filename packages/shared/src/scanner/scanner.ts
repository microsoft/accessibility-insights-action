// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AICrawler,
    CombinedScanResult,
    AICombinedReportDataConverter,
    ScanArguments,
    CrawlerParametersBuilder,
    BaselineOptionsBuilder,
    BaselineFileUpdater,
} from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
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
import * as fs from 'fs';

export type ScanSucceededWithNoRequiredUserAction = boolean;

@injectable()
export class Scanner {
    constructor(
        @inject(AICrawler) private readonly crawler: AICrawler,
        @inject(ConsolidatedReportGenerator) private readonly reportGenerator: ConsolidatedReportGenerator,
        @inject(AllProgressReporter) private readonly allProgressReporter: AllProgressReporter,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(AxeInfo) private readonly axeInfo: AxeInfo,
        @inject(AICombinedReportDataConverter) private readonly combinedReportDataConverter: AICombinedReportDataConverter,
        @inject(Logger) private readonly logger: Logger,
        @inject(CrawlArgumentHandler) private readonly crawlArgumentHandler: CrawlArgumentHandler,
        @inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(CrawlerParametersBuilder) private readonly crawlerParametersBuilder: CrawlerParametersBuilder,
        @inject(BaselineOptionsBuilder) private readonly baselineOptionsBuilder: BaselineOptionsBuilder,
        @inject(BaselineFileUpdater) private readonly baselineFileUpdater: BaselineFileUpdater,
        private readonly fileSystemObj: typeof fs = fs,
    ) {}

    public async scan(): Promise<ScanSucceededWithNoRequiredUserAction> {
        const scanTimeoutMsec = this.taskConfig.getScanTimeout();
        return this.promiseUtils.waitFor<ScanSucceededWithNoRequiredUserAction, ScanSucceededWithNoRequiredUserAction>(
            this.invokeScan(),
            scanTimeoutMsec,
            async (): Promise<ScanSucceededWithNoRequiredUserAction> => {
                this.logger.logError(`Scan timed out after ${scanTimeoutMsec / 1000} seconds`);
                return Promise.resolve(false);
            },
        );
    }

    private async invokeScan(): Promise<ScanSucceededWithNoRequiredUserAction> {
        let scanArguments: ScanArguments;
        let localServerUrl: string;

        try {
            this.createReportOutputDirectory();

            await this.allProgressReporter.start();

            if (isEmpty(this.taskConfig.getUrl())) {
                localServerUrl = await this.fileServer.start();
            }

            scanArguments = this.crawlArgumentHandler.processScanArguments(localServerUrl);

            this.logger.logStartGroup(`Scanning URL ${scanArguments.url}`);
            this.logger.logDebug(`Starting accessibility scanning of URL ${scanArguments.url}`);
            this.logger.logDebug(`Chrome app executable: ${scanArguments.chromePath ?? 'system default'}`);

            const crawlerParameters = this.crawlerParametersBuilder.build(scanArguments);

            const scanStarted = new Date();
            const combinedScanResult = await this.crawler.crawl(crawlerParameters, this.baselineOptionsBuilder.build(scanArguments));
            const scanEnded = new Date();

            const combinedReportParameters = this.getCombinedReportParameters(combinedScanResult, scanStarted, scanEnded);
            this.reportGenerator.generateReport(combinedReportParameters);
            await this.baselineFileUpdater.updateBaseline(scanArguments, combinedScanResult.baselineEvaluation);
            this.logger.logEndGroup();

            await this.allProgressReporter.completeRun(combinedReportParameters, combinedScanResult.baselineEvaluation);
            return this.allProgressReporter.didScanSucceed();
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanArguments?.url}`);
            await this.allProgressReporter.failRun();
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanArguments?.url} completed`);
        }

        return Promise.resolve(false);
    }

    private getCombinedReportParameters(
        combinedScanResult: CombinedScanResult,
        scanStarted: Date,
        scanEnded: Date,
    ): CombinedReportParameters {
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

    private createReportOutputDirectory(): void {
        const outDirectory = this.taskConfig.getReportOutDir();
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (!this.fileSystemObj.existsSync(outDirectory)) {
            this.logger.logInfo(`Report output directory does not exist. Creating directory ${outDirectory}`);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            this.fileSystemObj.mkdirSync(outDirectory);
        }
    }
}
