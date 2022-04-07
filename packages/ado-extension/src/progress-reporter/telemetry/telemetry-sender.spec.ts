// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, IMock, MockBehavior, It, Times } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters, HowToFixData, AxeRuleData, FailuresGroup } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { TelemetrySender } from './telemetry-sender';
import { TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';

describe(TelemetrySender, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let telemetryClientMock: IMock<TelemetryClient>;
    let telemetrySender: TelemetrySender;
    const teamProjectIdentifier = 'test-team-project';
    const runId = 7;
    const baselineFailuresFixed = 3;
    const baselineNewFailures = 1;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        telemetryClientMock = Mock.ofType<TelemetryClient>(undefined, MockBehavior.Strict);

        adoTaskConfigMock
            .setup((x) => x.getTeamProject())
            .returns(() => teamProjectIdentifier)
            .verifiable(Times.once());
        adoTaskConfigMock
            .setup((x) => x.getRunId())
            .returns(() => runId)
            .verifiable(Times.once());
    });

    describe('constructor', () => {
        it('initializes', () => {
            telemetrySender = buildTelemetrySenderWithMocks();
        });
    });

    describe('completeRun', () => {
        it('succeeds with baseline enabled', async () => {
            const reportStub = createCombinedReportParamsStub();
            const baselineEvaluationStub = {
                totalNewViolations: baselineNewFailures,
                totalFixedViolations: baselineFailuresFixed,
            } as BaselineEvaluation;
            const telemetrySender = buildTelemetrySenderWithMocks();
            setupTelemetryClientWithEvent(true);

            await telemetrySender.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds without baselineEvaluation provided', async () => {
            const reportStub = createCombinedReportParamsStub();
            telemetrySender = buildTelemetrySenderWithMocks();
            setupTelemetryClientWithEvent(false);

            await telemetrySender.completeRun(reportStub);

            verifyAllMocks();
        });

        function makeFailuresGroup(ruleId: string): FailuresGroup {
            return {
                key: ruleId,
                failed: [
                    {
                        rule: makeRule(ruleId),
                        elementSelector: `.${ruleId}-selector-1`,
                        fix: makeHowToFixData(ruleId, 1),
                        snippet: `<div>snippet 1</div>`,
                        urls: [`https://example.com/${ruleId}/only-violation`],
                    },
                    {
                        rule: makeRule(ruleId),
                        elementSelector: `.${ruleId}-selector-2`,
                        fix: makeHowToFixData(ruleId, 2),
                        snippet: `<div>snippet 2</div>`,
                        urls: [
                            `https://example.com/${ruleId}/violations/1`,
                            `https://example.com/${ruleId}/violations/2`,
                            `https://example.com/${ruleId}/violations/3`,
                        ],
                    },
                ],
            };
        }

        function makeHowToFixData(ruleId: string, failureId: number): HowToFixData {
            return {
                any: [],
                all: [],
                none: [],
                failureSummary: `Violation ${failureId} of rule ${ruleId}`,
            };
        }

        function makeRule(ruleId: string): AxeRuleData {
            return {
                ruleId,
                description: `${ruleId} description`,
                ruleUrl: `https://example.com/rules/${ruleId}`,
                tags: ['common-tag', `${ruleId}-specific-tag`],
            };
        }

        function createCombinedReportParamsStub(): CombinedReportParameters {
            const combinedReportParamsStub = {
                results: {
                    resultsByRule: {
                        failed: [makeFailuresGroup('failed-rule-1'), makeFailuresGroup('failed-rule-2')],
                    },
                },
            } as unknown as CombinedReportParameters;

            return combinedReportParamsStub;
        }

        function setupTelemetryClientWithEvent(generateWithBaselineEnabled: boolean): void {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eventProperties: { [key: string]: any } = {};
            eventProperties.teamProject = teamProjectIdentifier;
            eventProperties.runId = runId;

            eventProperties.rulesFailedListWithCounts = [
                { ruleId: 'failed-rule-1', failureCount: 4 },
                { ruleId: 'failed-rule-2', failureCount: 4 },
            ];

            eventProperties.baselineIsEnabled = generateWithBaselineEnabled;
            if (generateWithBaselineEnabled) {
                eventProperties.baselineFailuresFixed = baselineFailuresFixed;
                eventProperties.baselineNewFailures = baselineNewFailures;
            }

            telemetryClientMock
                .setup((x) =>
                    x.trackEvent({
                        name: 'ScanCompleted',
                        properties: eventProperties,
                    } as TelemetryEvent),
                )
                .verifiable(Times.once());
        }
    });

    const buildTelemetrySenderWithMocks = () => new TelemetrySender(adoTaskConfigMock.object, telemetryClientMock.object);

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        telemetryClientMock.verifyAll();
    };
});
