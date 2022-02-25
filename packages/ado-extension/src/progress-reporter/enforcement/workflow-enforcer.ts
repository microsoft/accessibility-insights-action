// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger, ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';

@injectable()
export class WorkflowEnforcer extends ProgressReporter {
    private scanSucceeded = true;

    constructor(@inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig, @inject(Logger) private readonly logger: Logger) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for workflow enforcement
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        if (!(await this.failIfAccessibilityErrorExists(combinedReportResult))) {
            await this.failIfBaselineNeedsUpdating(baselineEvaluation);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(): Promise<void> {
        this.scanSucceeded = false;
    }

    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(this.scanSucceeded);
    }

    private async failIfAccessibilityErrorExists(combinedReportResult: CombinedReportParameters): Promise<boolean> {
        if (this.adoTaskConfig.getFailOnAccessibilityError() && combinedReportResult.results.urlResults.failedUrls > 0) {
            this.logger.logError('An accessibility error was found and you specified the "failOnAccessibilityError" flag.');
            await this.failRun();
            return true;
        }
        return false;
    }

    private async failIfBaselineNeedsUpdating(baselineEvaluation?: BaselineEvaluation): Promise<boolean> {
        if (baselineEvaluation && this.adoTaskConfig.getBaselineFile() && baselineEvaluation.suggestedBaselineUpdate) {
            this.logger.logInfo(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `##vso[task.logissue type=error;sourcepath=${this.adoTaskConfig.getBaselineFile()}] The baseline file does not match scan results.`,
            );
            await this.failRun();
            return true;
        }
        return false;
    }
}
