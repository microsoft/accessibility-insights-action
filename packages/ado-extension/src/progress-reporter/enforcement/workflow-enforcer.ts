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
        //await this.failIfStaticSiteDirAndUrlAreSetAtTheSameTime();
        await this.failIfUrlIsConfiguredInStaticSiteMode();
        await this.failIfStaticSiteDirIsConfiguredInDynamicMode();
        await this.failIfStaticSitePortIsConfiguredInDynamicMode();
        await this.failIfStaticSiteUrlRelativePathIsConfiguredInDynamicMode();
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

    private async failIfStaticSiteDirAndUrlAreSetAtTheSameTime(): Promise<boolean> {
        if (this.adoTaskConfig.getUrl() !== undefined && this.adoTaskConfig.getStaticSiteDir() !== undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.logger.logError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `A configuration error has occurred, Url and staticSiteDir inputs cannot be set at the same time`,
            );
            await this.failRun();
            return true;
        }
        return false;
    }

    private async failIfUrlIsConfiguredInStaticSiteMode(): Promise<boolean> {
        if (this.adoTaskConfig.getHostingMode() === 'staticSite' && typeof this.adoTaskConfig.getUrl() !== 'undefined') {
            this.logger.logError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `A configuration error has occurred url cannot be set in staticSite mode`,
            );
            await this.failRun();
            return true;
        }
        return false;
    }

    private async failIfStaticSiteDirIsConfiguredInDynamicMode(): Promise<boolean> {
        if (this.adoTaskConfig.getHostingMode() === 'dynamicSite' && typeof this.adoTaskConfig.getStaticSiteDir() !== 'undefined') {
            this.logger.logError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `A configuration error has occurred staticSiteDir cannot be set in dynamicSite mode`,
            );
            await this.failRun();
            return true;
        }
        return false;
    }

    private async failIfStaticSitePortIsConfiguredInDynamicMode(): Promise<boolean> {
        if (this.adoTaskConfig.getHostingMode() === 'dynamicSite' && typeof this.adoTaskConfig.getStaticSitePort() !== 'undefined') {
            this.logger.logError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `A configuration error has occurred staticSitePort cannot be set in dynamicSite mode`,
            );
            await this.failRun();
            return true;
        }
        return false;
    }

    private async failIfStaticSiteUrlRelativePathIsConfiguredInDynamicMode(): Promise<boolean> {
        if (
            this.adoTaskConfig.getHostingMode() === 'dynamicSite' &&
            typeof this.adoTaskConfig.getStaticSiteUrlRelativePath() !== 'undefined'
        ) {
            this.logger.logError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `A configuration error has occurred staticSiteUrlRelativePath cannot be set in dynamicSite mode`,
            );
            await this.failRun();
            return true;
        }
        return false;
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
