// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger } from '@accessibility-insights-action/shared';
import * as fs from 'fs';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';
import { ReportConsoleLogConvertor, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';

@injectable()
export class AdoConsoleCommentCreator extends ProgressReporter {
    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(ReportConsoleLogConvertor) private readonly reportConsoleLogConvertor: ReportConsoleLogConvertor,
        @inject(Logger) private readonly logger: Logger,
        private readonly fileSystemObj: typeof fs = fs,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything to start the run
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        const baselineInfo = this.getBaselineInfo(baselineEvaluation);
        this.outputResultsMarkdownToBuildSummary(combinedReportResult, baselineInfo);
        this.logResultsToConsole(combinedReportResult, baselineInfo);

        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async failRun(): Promise<void> {
        // We don't do anything for failed runs
    }

    private getBaselineInfo(baselineEvaluation?: BaselineEvaluation): BaselineInfo {
        const baselineFileName = this.adoTaskConfig.getBaselineFile();

        if (!baselineFileName) {
            return {} as BaselineInfo;
        }

        return { baselineFileName, baselineEvaluation };
    }

    private outputResultsMarkdownToBuildSummary(combinedReportResult: CombinedReportParameters, baselineInfo?: BaselineInfo): void {
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult, undefined, baselineInfo);

        const outDirectory = this.adoTaskConfig.getReportOutDir();
        const fileName = `${outDirectory}/results.md`;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.fileSystemObj.writeFileSync(fileName, reportMarkdown);
        this.logger.logInfo(`##vso[task.uploadsummary]${fileName}`);
    }

    private logResultsToConsole(combinedReportResult: CombinedReportParameters, baselineInfo?: BaselineInfo): void {
        const reportConsoleLogOutput = this.reportConsoleLogConvertor.convert(combinedReportResult, undefined, baselineInfo);

        this.logger.logInfo(reportConsoleLogOutput);
    }
}
