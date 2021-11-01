// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdoIocTypes } from '../../ioc/ado-ioc-types';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';

@injectable()
export class WorkflowEnforcer extends ProgressReporter {
    constructor(@inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for workflow enforcement
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        this.failIfAccessibilityErrorExists(combinedReportResult);
        this.failIfBaselineNeedsUpdating(baselineEvaluation);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(message: string): Promise<void> {
        throw new Error(message);
    }

    private failIfAccessibilityErrorExists(combinedReportResult: CombinedReportParameters): void {
        if (this.adoTaskConfig.getFailOnAccessibilityError() && combinedReportResult.results.urlResults.failedUrls > 0) {
            throw new Error('Failed Accessibility Error');
        }
    }

    private failIfBaselineNeedsUpdating(baselineEvaluation?: BaselineEvaluation): void {
        if (baselineEvaluation && this.adoTaskConfig.getBaselineFile() && baselineEvaluation.suggestedBaselineUpdate) {
            throw new Error('Failed: The baseline file does not match scan results. If this is a PR, check the PR comments.');
        }
    }
}
