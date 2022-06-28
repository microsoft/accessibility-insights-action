// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes, Logger, ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { GHTaskConfig } from '../task-config/gh-task-config';

@injectable()
export class GHWorkflowEnforcer extends ProgressReporter {
    private scanSucceeded = true;

    constructor(@inject(iocTypes.TaskConfig) private readonly ghTaskConfig: GHTaskConfig, @inject(Logger) private readonly logger: Logger) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for workflow enforcement
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        await this.failIfAccessibilityErrorExists(combinedReportResult);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(): Promise<void> {
        this.scanSucceeded = false;
    }

    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(this.scanSucceeded);
    }

    private async failIfAccessibilityErrorExists(combinedReportResult: CombinedReportParameters): Promise<void> {
        if (this.ghTaskConfig.getFailOnAccessibilityError() && combinedReportResult.results.urlResults.failedUrls > 0) {
            this.logger.logError('Accessibility error(s) were found');
            this.logger.logInfo(
                [
                    'To prevent accessibility errors from failing your build, you can:',
                    '* Set the fail-on-accessibility-error input to false to avoid failing for all issues',
                ].join('\n'),
            );

            await this.failRun();
        }
    }
}
