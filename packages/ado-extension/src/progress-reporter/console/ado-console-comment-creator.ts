// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger } from '@accessibility-insights-action/shared';
import * as fs from 'fs';
import { ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';

@injectable()
export class AdoConsoleCommentCreator extends ProgressReporter {
    public static readonly CURRENT_COMMENT_TITLE = 'Results from Current Run';
    public static readonly PREVIOUS_COMMENT_TITLE = 'Results from Previous Run';

    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
        @inject(ADOTaskConfig) private readonly taskConfig: ADOTaskConfig,
        private readonly fileSystemObj: typeof fs = fs,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything to start the run
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        const reportMarkdown = this.reportMarkdownConvertor.convert(
            combinedReportResult,
            AdoConsoleCommentCreator.CURRENT_COMMENT_TITLE,
            this.getBaselineInfo(baselineEvaluation),
        );
        this.outputResultsMarkdownToBuildSummary(reportMarkdown);
        this.logResultsToConsole(reportMarkdown);

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

    private outputResultsMarkdownToBuildSummary(markdownContent: string): void {
        const outDirectory = this.taskConfig.getReportOutDir();
        const fileName = `${outDirectory}/results.md`;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (!this.fileSystemObj.existsSync(outDirectory)) {
            this.logger.logInfo(`Report output directory does not exists. Creating directory ${outDirectory}`);
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            this.fileSystemObj.mkdirSync(outDirectory);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.fileSystemObj.writeFileSync(fileName, markdownContent);
        this.logger.logInfo(`##vso[task.uploadsummary]${fileName}`);
    }

    private logResultsToConsole(markdownContent: string): void {
        this.logger.logInfo(markdownContent);
    }
}
