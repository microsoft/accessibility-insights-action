// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdoIocTypes } from '../../ioc/ado-ioc-types';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as AdoTask from 'azure-pipelines-task-lib/task';
import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';

@injectable()
export class WorkflowEnforcer extends ProgressReporter {
    public static readonly CURRENT_COMMENT_TITLE = 'Results from Current Run';
    public static readonly PREVIOUS_COMMENT_TITLE = 'Results from Previous Run';

    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(AdoIocTypes.AdoTask) private readonly adoTask: typeof AdoTask,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for workflow enforcement
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        this.failOnAccessibilityError(combinedReportResult);
        if (baselineEvaluation) {
            this.failOnBaselineNotUpdated(baselineEvaluation.suggestedBaselineUpdate);
        }
        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(message: string): Promise<void> {
        throw new Error(message);
    }

    private failOnAccessibilityError(combinedReportResult: CombinedReportParameters): void {
        if (this.adoTaskConfig.getFailOnAccessibilityError() && combinedReportResult.results.urlResults.failedUrls > 0) {
            throw new Error('Failed Accessibility Error');
        }
    }

    private failOnBaselineNotUpdated(suggestedBaselineUpdate: null | BaselineFileContent): void {
        if (this.adoTaskConfig.getBaselineFile() && suggestedBaselineUpdate) {
            throw new Error('Failed: The baseline file needs to be updated. See the PR comments for more details.');
        }
    }
}
