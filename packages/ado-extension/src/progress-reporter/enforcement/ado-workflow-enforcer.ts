// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { iocTypes, Logger, ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';

@injectable()
export class AdoWorkflowEnforcer extends ProgressReporter {
    private scanSucceeded = true;

    constructor(
        @inject(iocTypes.TaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(Logger) private readonly logger: Logger,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for workflow enforcement
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        const baselineFileInput = this.adoTaskConfig.getBaselineFile();

        if (baselineFileInput != null) {
            await this.failIfBaselineNeedsUpdating(baselineFileInput, baselineEvaluation);
        } else {
            await this.failIfAccessibilityErrorExists(combinedReportResult);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(): Promise<void> {
        this.scanSucceeded = false;
    }

    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(this.scanSucceeded);
    }

    private async failIfAccessibilityErrorExists(combinedReportResult: CombinedReportParameters): Promise<void> {
        if (this.adoTaskConfig.getFailOnAccessibilityError() && combinedReportResult.results.urlResults.failedUrls > 0) {
            this.logger.logError(
                'Accessibility error(s) were found. To see all failures and scan details, visit the Extensions tab to download the accessibility report.',
            );
            this.logger.logInfo(
                [
                    'To prevent accessibility errors from failing your build, you can:',
                    '* Use a baseline file to avoid failing for known issues, or',
                    '* Set the failOnAccessibilityError task input to false to avoid failing for all issues',
                ].join('\n'),
            );

            await this.failRun();
        }
    }

    private async failIfBaselineNeedsUpdating(baselineFileInput: string, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        if (baselineEvaluation?.suggestedBaselineUpdate) {
            this.logger.logInfo(
                `##vso[task.logissue type=error;sourcepath=${baselineFileInput}] The baseline file does not match scan results.`,
            );
            await this.failRun();
        }
    }
}
