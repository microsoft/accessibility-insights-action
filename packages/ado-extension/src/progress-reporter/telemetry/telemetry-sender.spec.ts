// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, IMock, MockBehavior, It, Times } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters, HowToFixData, AxeRuleData, FailuresGroup } from 'accessibility-insights-report';
import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { TelemetrySender } from './telemetry-sender';
import { TelemetryClient } from '@accessibility-insights-action/shared';

describe(TelemetrySender, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let telemetryClientMock: IMock<TelemetryClient>;
    let telemetrySender: TelemetrySender;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        telemetryClientMock = Mock.ofType<TelemetryClient>(undefined, MockBehavior.Strict);

        adoTaskConfigMock.setup((x) => x.getTeamProject()).returns(() => 'test-team-project');
        adoTaskConfigMock.setup((x) => x.getRunId()).returns(() => 7);

        telemetryClientMock.setup((x) => x.trackEvent(It.isAny())).verifiable(Times.once());
    });

    describe('constructor', () => {
        it('initializes', () => {
            telemetrySender = buildTelemetrySenderWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('logs correct error if accessibility error occurred', async () => {
            const reportStub = {
                results: {
                    resultsByRule: {
                        failed: [makeFailuresGroup('failed-rule-1'), makeFailuresGroup('failed-rule-2')],
                    },
                },
            } as unknown as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            const telemetrySender = buildTelemetrySenderWithMocks();

            await telemetrySender.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('logs correct error if baseline needs to be updated', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;

            const telemetrySender = buildTelemetrySenderWithMocks();

            await telemetrySender.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds in happy path (baseline enabled)', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            const telemetrySender = buildTelemetrySenderWithMocks();

            await telemetrySender.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds in happy path (baselineEvaluation not provided)', async () => {
            const reportStub = {} as CombinedReportParameters;
            telemetrySender = buildTelemetrySenderWithMocks();
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
    });

    const buildTelemetrySenderWithMocks = () => new TelemetrySender(adoTaskConfigMock.object, telemetryClientMock.object);

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        telemetryClientMock.verifyAll();
    };
});
