// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AICrawler,
    CombinedScanResult,
    AICombinedReportDataConverter,
    validateScanArguments,
    ScanArguments,
    CrawlerParametersBuilder,
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
        @inject(CrawlerParametersBuilder) private readonly crawlerParametersBuilder: CrawlerParametersBuilder,
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

            const remoteUrl: string = this.taskConfig.getUrl();
            if (remoteUrl) {
                scanUrl = remoteUrl;
            } else {
                const baseUrl = await this.fileServer.start();
                scanUrl = url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath());
            }

            const inputUrls = this.taskConfig.getInputUrls();
            const discoveryPatterns = this.taskConfig.getDiscoveryPatterns();

            const scanArguments: ScanArguments = {
                url: scanUrl,
                inputFile:this.taskConfig.getInputFile(),
                output: this.taskConfig.getReportOutDir(),
                maxUrls: this.taskConfig.getMaxUrls(),
                inputUrls: isEmpty(inputUrls) ? undefined : inputUrls,
                discoveryPatterns: isEmpty(discoveryPatterns) ? undefined : discoveryPatterns,
                chromePath: this.taskConfig.getChromePath(),
                // axeSourcePath is relative to /dist/index.js, not this source file
                axeSourcePath: path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.js'),
                crawl: true,
                restart: true,
            };

            validateScanArguments(scanArguments);

            const crawlerRunOptions = this.crawlerParametersBuilder.build(scanArguments);

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanUrl}`);

            const chromePath = this.taskConfig.getChromePath();
            this.logger.logInfo(`Chrome app executable ${chromePath}`);

            const scanStarted = new Date();
            const combinedScanResult = await this.crawler.crawl(crawlerRunOptions);
            const scanEnded = new Date();

            const convertedData = this.getConvertedData(combinedScanResult, scanStarted, scanEnded);
            this.reportGenerator.generateReport(convertedData);
            this.logger.logInfo('after repoert generated');
            await this.allProgressReporter.completeRun({
                results: {
                    passes: [{
                        description: 'description',
                        help: 'help',
                        helpUrl: 'helpUrl',
                        id: 'id',
                        tags: [],
                        nodes: [{
                            html: 'html',
                            target: [],
                            any: [],
                            all: [],
                            none: [],
                        }]
                    }],
                    toolOptions: {},
                    testEngine: {
                        name: 'name',
                        version: 'version',
                    },
                    testEnvironment: {
                        userAgent: 'user agent',
                        windowHeight: 100,
                        windowWidth: 100,
                    },
                    testRunner: {
                        name: 'runner',
                    },
                    url: 'url',
                    timestamp: 'timestamp',
                    violations: [],
                    inapplicable: [],
                    incomplete: [],
                },
            });
            this.logger.logInfo("after complete run");
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanUrl}`);
            await this.allProgressReporter.failRun(util.inspect(error));
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanUrl} completed`);
        }
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
