// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AICrawler,
    CombinedScanResult,
    AICombinedReportDataConverter,
    validateScanArguments,
    ScanArguments,
} from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as url from 'url';
import * as util from 'util';
import { iocTypes } from '../ioc/ioc-types';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { AllProgressReporter } from '../progress-reporter/all-progress-reporter';
import { TaskConfig } from '../task-config';
import { PromiseUtils } from '../utils/promise-utils';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { toolName } from '../content/strings';
import { AxeInfo } from '../axe/axe-info';
import { ConsolidatedReportGenerator } from '../report/consolidated-report-generator';
import { isEmpty } from 'lodash';

@injectable()
export class Scanner {
    constructor(
        @inject(AICrawler) private readonly crawler: AICrawler,
        @inject(ConsolidatedReportGenerator) private readonly reportGenerator: ConsolidatedReportGenerator,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(AllProgressReporter) private readonly allProgressReporter: AllProgressReporter,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(AxeInfo) private readonly axeInfo: AxeInfo,
        @inject(AICombinedReportDataConverter) private readonly combinedReportDataConverter: AICombinedReportDataConverter,
        @inject(iocTypes.Process) protected readonly currentProcess: typeof process,
        @inject(Logger) private readonly logger: Logger,
    ) {}

    public async scan(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/require-await
        await this.promiseUtils.waitFor(this.invokeScan(), 90000, async () => {
            this.logger.logError('Unable to scan before timeout');
            this.currentProcess.exit(1);
        });
    }

    private async invokeScan(): Promise<void> {
        let scanUrl: string;

        try {
            await this.allProgressReporter.start();

            scanUrl = await this.resolveScanUrl();

            const scanArguments: ScanArguments = {
                url: scanUrl,
                ...this.getScanArguments(),
            };

            validateScanArguments(scanArguments);

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanUrl}`);

            const chromePath = this.taskConfig.getChromePath();
            this.logger.logInfo(`Chrome app executable: ${chromePath ?? 'system default'}`);

            const scanStarted = new Date();
            const combinedScanResult = await this.crawler.crawl({
                baseUrl: scanUrl,
                crawl: true,
                restartCrawl: true,
                chromePath,
                axeSourcePath: scanArguments.axeSourcePath,
                localOutputDir: this.taskConfig.getReportOutDir(),
            });
            const scanEnded = new Date();

            const convertedData = this.getConvertedData(combinedScanResult, scanStarted, scanEnded);
            this.reportGenerator.generateReport(convertedData);
            // await this.allProgressReporter.completeRun(axeScanResults);
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanUrl}`);
            await this.allProgressReporter.failRun(util.inspect(error));
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanUrl} completed`);
        }
    }

    private async resolveScanUrl(): Promise<string> {
        const remoteUrl: string = this.taskConfig.getUrl();
        if (isEmpty(remoteUrl)) {
            const baseUrl = await this.fileServer.start();
            return url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath());
        }
        return remoteUrl;
    }

    private getScanArguments(): Omit<ScanArguments, 'url'> {
        const args = {
            inputFile: this.taskConfig.getInputFile(),
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            discoveryPatterns: this.taskConfig.getDiscoveryPatterns(),
            inputUrls: this.taskConfig.getInputUrls(),
        };

        if (isEmpty(args.discoveryPatterns)) {
            delete args.discoveryPatterns;
        }

        if (isEmpty(args.inputUrls)) {
            delete args.inputUrls;
        }

        return args;
    }

    private getConvertedData(combinedScanResult: CombinedScanResult, scanStarted: Date, scanEnded: Date): CombinedReportParameters {
        const scanResultData = {
            baseUrl: combinedScanResult.scanMetadata.baseUrl ?? 'n/a',
            basePageTitle: combinedScanResult.scanMetadata.basePageTitle,
            scanEngineName: toolName,
            axeCoreVersion: this.axeInfo.version,
            browserUserAgent: combinedScanResult.scanMetadata.userAgent,
            urlCount: combinedScanResult.urlCount,
            scanStarted,
            scanEnded,
            browserResolution: '', // TODO
        };

        return this.combinedReportDataConverter.convertCrawlingResults(combinedScanResult.combinedAxeResults, scanResultData);
    }
}
