// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdoIocTypes } from '../../ioc/ado-ioc-types';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger } from '@accessibility-insights-action/shared';
import { ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as NodeApi from 'azure-devops-node-api';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';

@injectable()
export class AdoConsoleCommentCreator extends ProgressReporter {
    private connection: NodeApi.WebApi;
    public static readonly CURRENT_COMMENT_TITLE = 'Results from Current Run';
    public static readonly PREVIOUS_COMMENT_TITLE = 'Results from Previous Run';

    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
        @inject(AdoIocTypes.AdoTask) private readonly adoTask: typeof AdoTask,
        @inject(AdoIocTypes.NodeApi) private readonly nodeApi: typeof NodeApi,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for pull request flow
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        const reportMarkdown = this.reportMarkdownConvertor.convert(
            combinedReportResult,
            AdoConsoleCommentCreator.CURRENT_COMMENT_TITLE,
            this.getBaselineInfo(baselineEvaluation),
        );
        this.logMessage(reportMarkdown);

        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async failRun(message: string): Promise<void> {
        // This gets handled in the WorkflowEnforcer
    }

    private getBaselineInfo(baselineEvaluation?: BaselineEvaluation): BaselineInfo {
        const baselineFileName = this.adoTaskConfig.getBaselineFile();

        if (!baselineFileName) {
            return {} as BaselineInfo;
        }

        return { baselineFileName, baselineEvaluation };
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }
}
