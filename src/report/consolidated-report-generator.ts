// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Logger } from '../logger/logger';
import { ReporterFactory, CombinedReportParameters } from 'accessibility-insights-report';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { iocTypes } from '../ioc/ioc-types';
import { TaskConfig } from '../task-config';

@injectable()
export class ConsolidatedReportGenerator {
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(iocTypes.ReportFactory) private readonly reporterFactoryFunc: ReporterFactory,
        @inject(Logger) private readonly logger: Logger,
        private readonly fileSystemObj: typeof fs = fs,
    ) {}

    public generateReport(combinedReportData: CombinedReportParameters): string {
        const reporter = this.reporterFactoryFunc();

        const htmlReportContent = reporter.fromCombinedResults(combinedReportData).asHTML();

        const outDirectory = this.taskConfig.getReportOutDir();
        const reportFileName = `${outDirectory}/index.html`;

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
