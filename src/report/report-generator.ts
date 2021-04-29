// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AxeReportParameters, ReporterFactory } from 'accessibility-insights-report';
import { AxeScanResults } from 'accessibility-insights-scan';
import * as filenamifyUrl from 'filenamify-url';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { iocTypes } from '../ioc/ioc-types';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';

@injectable()
export class ReportGenerator {
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(iocTypes.ReportFactory) private readonly reporterFactoryFunc: ReporterFactory,
        @inject(Logger) private readonly logger: Logger,
        private readonly fileSystemObj: typeof fs = fs,
        private readonly filenamify: typeof filenamifyUrl = filenamifyUrl,
    ) {}

    public generateReport(axeResults: AxeScanResults): string {
        const params = {
            pageTitle: axeResults.pageTitle,
        };
        const reportGenerationTime = new Date();

        const reporter = this.reporterFactoryFunc();

        const htmlReportParams: AxeReportParameters = {
            results: axeResults.results,
            description: `Automated report for accessibility scan of url ${
                axeResults.results.url
            } completed at ${reportGenerationTime.toUTCString()}.`,
            serviceName: 'Accessibility Insights Action',
            scanContext: {
                pageTitle: params.pageTitle,
            },
        };

        const outDirectory = this.taskConfig.getReportOutDir();
        const htmlReportContent = reporter.fromAxeResult(htmlReportParams).asHTML();
        const reportFileName = `${outDirectory}/${this.filenamify(axeResults.results.url, {
            replacement: '_',
        })}.html`;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (!this.fileSystemObj.existsSync(outDirectory)) {
            this.logger.logInfo('output directory does not exists.');
            this.logger.logInfo(`creating output directory - ${outDirectory}`);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            this.fileSystemObj.mkdirSync(outDirectory);
        }

        this.saveHtmlReport(reportFileName, htmlReportContent);

        return reportFileName;
    }

    private saveHtmlReport(fileName: string, content: string): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.fileSystemObj.writeFileSync(fileName, content);
        this.logger.logInfo(`scan report saved successfully ${fileName}`);
    }
}
