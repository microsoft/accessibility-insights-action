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
import { TelemetryClient } from '../telemetry/telemetry-client';
import { InputValidator } from '../input-validator';
import { isEmpty } from 'lodash';
import { TelemetryErrorCollector } from '../telemetry/telemetry-error-collector';
import * as fs from 'fs';
import { TelemetryEvent } from '../telemetry/telemetry-event';

export type ScanSucceededWithNoRequiredUserAction = boolean;

@injectable()
export class Scanner {
    private telemetryErrorCollector: TelemetryErrorCollector;

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
        @inject(iocTypes.TelemetryClient) private readonly telemetryClient: TelemetryClient,
        @inject(InputValidator) private readonly inputValidator: InputValidator,
        private readonly fileSystemObj: typeof fs = fs,
    ) {
        this.telemetryErrorCollector = new TelemetryErrorCollector('Scanner');
    }

    public async scan(): Promise<ScanSucceededWithNoRequiredUserAction> {
        if (!this.inputValidator.validate()) {
            await this.telemetryClient.flush();
            return false;
        }
        const scanTimeoutMsec = this.taskConfig.getScanTimeout();
        return this.promiseUtils.waitFor<ScanSucceededWithNoRequiredUserAction, ScanSucceededWithNoRequiredUserAction>(
            this.invokeScan(),
            scanTimeoutMsec,
            async (): Promise<ScanSucceededWithNoRequiredUserAction> => {
                const errorMessage = `Scan timed out after ${scanTimeoutMsec / 1000} seconds`;
                this.telemetryErrorCollector.collectError(errorMessage);
                if (!this.telemetryErrorCollector.isEmpty()) {
                    this.telemetryClient.trackEvent({
                        name: 'ErrorFound',
                        properties: this.telemetryErrorCollector.returnErrorList(),
                    } as TelemetryEvent);
                }
                await this.telemetryClient.flush();
                this.logger.logError(errorMessage);
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

            this.telemetryClient.trackEvent({ name: 'ScanStart' });
            this.telemetryClient.trackEvent({
                name: 'Inputs',
                properties: {
                    failOnAccessibilityError: this.taskConfig.getFailOnAccessibilityError(),
                    staticSiteDirSet: this.taskConfig.getStaticSiteDir() == undefined ? false : true,
                },
            });

            if (scanArguments.serviceAccountName !== undefined) {
                this.telemetryClient.trackEvent({ name: 'AuthUsed' });
            }

            this.logger.logStartGroup(`Scanning URL ${scanArguments.url}`);
            this.logger.logDebug(`Starting accessibility scanning of URL ${scanArguments.url}`);
            this.logger.logDebug(`Chrome app executable: ${scanArguments.chromePath ?? 'system default'}`);

            const crawlerParameters = this.crawlerParametersBuilder.build(scanArguments);

            const scanStarted = new Date();
            const combinedScanResult = await this.crawler.crawl(crawlerParameters, this.baselineOptionsBuilder.build(scanArguments));

            if (!isEmpty(combinedScanResult.errors)) {
                this.logger.logError(`Scan failed with ${combinedScanResult.errors.length} error(s)`);
                combinedScanResult.errors.forEach((error) => {
                    this.logAndTrackScanningException(error.error, error.url);
                });
                await this.allProgressReporter.failRun();
                return Promise.resolve(false);
            }
            const scanEnded = new Date();

            await this.checkIfLoginPageWasScanned(combinedScanResult, scanArguments);

            const combinedReportParameters = this.getCombinedReportParameters(combinedScanResult, scanStarted, scanEnded);
            this.reportGenerator.generateReport(combinedReportParameters);
            await this.baselineFileUpdater.updateBaseline(scanArguments, combinedScanResult.baselineEvaluation);
            this.logger.logEndGroup();

            await this.allProgressReporter.completeRun(combinedReportParameters, combinedScanResult.baselineEvaluation);
            return this.allProgressReporter.didScanSucceed();
        } catch (error) {
            this.logAndTrackScanningException(error, scanArguments?.url);
            await this.allProgressReporter.failRun();
        } finally {
            if (!this.telemetryErrorCollector.isEmpty()) {
                this.telemetryClient.trackEvent({
                    name: 'ErrorFound',
                    properties: this.telemetryErrorCollector.returnErrorList(),
                } as TelemetryEvent);
            }
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanArguments?.url} completed`);
            await this.telemetryClient.flush();
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
            browserResolution: combinedScanResult.scanMetadata.browserResolution,
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

    private logAndTrackScanningException(error: unknown, url: string): void {
        this.telemetryErrorCollector.collectError(String(error));
        this.logger.trackExceptionAny(error, `An error occurred while scanning website page: ${url}`);
    }

    private async checkIfLoginPageWasScanned(combinedScanResult: CombinedScanResult, scanArguments: ScanArguments): Promise<void | false> {
        const { urls } = combinedScanResult.combinedAxeResults;
        const { baseUrl } = combinedScanResult.scanMetadata;
        const { serviceAccountName } = scanArguments;
        const authEnabled = serviceAccountName !== undefined;

        // Throw error if the only URL scanned is the login page
        if (urls.length === 1 && urls[0] !== baseUrl && urls[0].startsWith('https://login.microsoftonline.com') && !authEnabled) {
            this.logger.logError(
                `${baseUrl} requires authentication. To learn how to add authentication, visit https://aka.ms/AI-action-auth`,
            );
            await this.allProgressReporter.failRun();
            return Promise.resolve(false);
        }

        // Log warning if the login page was scanned
        const scannedLoginPage = urls.filter((f) => f.startsWith('https://login.microsoftonline.com'));
        if (authEnabled && scannedLoginPage.length > 0) {
            for (const url of scannedLoginPage) {
                const baseUrlMatch = url.match(/redirect_uri=(.*?)&/);
                const baseUrlMatchEncoded = baseUrlMatch ? baseUrlMatch[1] : '';
                const baseUrlMatchDecoded = baseUrlMatchEncoded ? decodeURIComponent(baseUrlMatchEncoded) : 'one of the pages in your site';
                this.logger.logWarning(
                    `The service account ${serviceAccountName} does not have sufficient permissions to access ${baseUrlMatchDecoded}. For more information, visit https://aka.ms/ai-faq#authentication`, // This is not a real aka.ms url yet!
                );
            }
        }
    }
}
