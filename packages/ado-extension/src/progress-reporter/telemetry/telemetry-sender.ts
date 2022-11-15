// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { iocTypes, ProgressReporter, TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { TelemetryErrorCollector } from './telemetry-error-collector';

@injectable()
export class TelemetrySender extends ProgressReporter {
    constructor(
        @inject(iocTypes.TaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(iocTypes.TelemetryClient) private readonly telemetryClient: TelemetryClient,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't send anything for telemetry
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eventProperties: { [key: string]: any } = {};
        const telemetryErrorCollector = new TelemetryErrorCollector('TelemetrySender');

        eventProperties.rulesFailedListWithCounts = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
            const failureCount = failuresGroup.failed.reduce(
                (total, currentFailedRule) => total + (currentFailedRule.urls ? currentFailedRule.urls.length : 0),
                0,
            );
            const ruleId = failuresGroup.failed[0].rule.ruleId;
            return { ruleId, failureCount };
        });

        eventProperties.baselineIsEnabled = false;

        if (baselineEvaluation !== undefined) {
            eventProperties.baselineIsEnabled = true;
            eventProperties.baselineFailuresFixed = baselineEvaluation.totalFixedViolations;
            eventProperties.baselineNewFailures = baselineEvaluation.totalNewViolations;
            eventProperties.baselineFailuresCount = baselineEvaluation.totalBaselineViolations;
        }

        this.telemetryClient.trackEvent({
            name: 'ScanCompleted',
            properties: eventProperties,
        } as TelemetryEvent);

        this.telemetryClient.trackEvent({
            name: 'ErrorFound',
            properties: telemetryErrorCollector.errorList,
        } as TelemetryEvent);
    }

    public async failRun(): Promise<void> {
        // We don't send anything for failed runs
    }
}
