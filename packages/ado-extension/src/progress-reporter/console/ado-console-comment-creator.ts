// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { iocTypes, Logger, ReportConsoleLogConvertor } from '@accessibility-insights-action/shared';
import * as fs from 'fs';
import * as path from 'path';
import { ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';

@injectable()
export class AdoConsoleCommentCreator extends ProgressReporter {
    constructor(
        @inject(iocTypes.TaskConfig) private readonly taskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(ReportConsoleLogConvertor) private readonly reportConsoleLogConvertor: ReportConsoleLogConvertor,
        @inject(Logger) private readonly logger: Logger,
        private readonly fileSystemObj: typeof fs = fs,
        private readonly pathObj: typeof path = path,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything to start the run
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        const baselineInfo = this.getBaselineInfo(baselineEvaluation);
        const artifactName = this.getArtifactName();
        this.outputResultsMarkdownToBuildSummary(artifactName, combinedReportResult, baselineInfo);
        this.uploadOutputArtifact(artifactName);
        this.logResultsToConsole(combinedReportResult, baselineInfo);

        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async failRun(): Promise<void> {
        // We don't do anything for failed runs
    }

    private getBaselineInfo(baselineEvaluation?: BaselineEvaluation): BaselineInfo {
        const baselineFileName = this.taskConfig.getBaselineFile();

        if (!baselineFileName) {
            return {} as BaselineInfo;
        }

        return { baselineFileName, baselineEvaluation };
    }

    private outputResultsMarkdownToBuildSummary(
        artifactName: string | null,
        combinedReportResult: CombinedReportParameters,
        baselineInfo?: BaselineInfo,
    ): void {
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult, 'ADO', undefined, baselineInfo);
        const outDirectory = this.taskConfig.getReportOutDir();

        const summaryFilePath = this.pathObj.join(outDirectory, this.summaryMarkdownFileName(artifactName));

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.fileSystemObj.writeFileSync(summaryFilePath, reportMarkdown);
        this.logger.logInfo(`##vso[task.uploadsummary]${summaryFilePath}`);
    }

    // The file name we use is user-facing; ADO uses it as the section header for the summary
    // as it appears in the Extensions tab of a Pipeline's results.
    private summaryMarkdownFileName(artifactName: string | null): string {
        const isArtifactNameCustom = artifactName !== 'accessibility-reports';
        const shouldIncludeArtifactNameSuffix = artifactName != null && isArtifactNameCustom;

        const artifactNameSuffix = shouldIncludeArtifactNameSuffix ? ` (${artifactName})` : '';

        return `Accessibility Insights scan summary${artifactNameSuffix}.md`;
    }

    private getArtifactName(): string | null {
        const uploadOutputArtifactEnabled: boolean = this.taskConfig.getUploadOutputArtifact();
        if (!uploadOutputArtifactEnabled) {
            return null;
        }

        const jobAttemptBuildVariable = this.taskConfig.getVariable('System.JobAttempt');
        const artifactNameInput = this.taskConfig.getOutputArtifactName();

        if (jobAttemptBuildVariable !== undefined) {
            const jobAttemptNumber = parseInt(jobAttemptBuildVariable);
            if (jobAttemptNumber > 1) {
                return `${artifactNameInput}-${jobAttemptBuildVariable}`;
            }
        }

        return artifactNameInput;
    }

    private uploadOutputArtifact(artifactName: string | null): void {
        if (artifactName != null) {
            const outputDirectory = this.taskConfig.getReportOutDir();
            const baselineInputFilePath = this.taskConfig.getBaselineFile();

            const reportFilePath = this.pathObj.join(outputDirectory, 'index.html');
            const baselineFilePath = baselineInputFilePath
                ? this.pathObj.join(outputDirectory, this.pathObj.basename(baselineInputFilePath))
                : undefined;

            this.logger.logInfo(`##vso[artifact.upload artifactname=${artifactName}]${reportFilePath}`);

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (baselineFilePath !== undefined && this.fileSystemObj.existsSync(baselineFilePath)) {
                this.logger.logInfo(`##vso[artifact.upload artifactname=${artifactName}]${baselineFilePath}`);
            }
        }
    }

    private logResultsToConsole(combinedReportResult: CombinedReportParameters, baselineInfo?: BaselineInfo): void {
        const reportMarkdown = this.reportConsoleLogConvertor.convert(combinedReportResult, undefined, baselineInfo);

        this.logger.logInfo(reportMarkdown);
    }
}
