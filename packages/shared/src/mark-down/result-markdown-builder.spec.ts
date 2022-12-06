// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { ExecutionEnvironment, ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as axe from 'axe-core';
import * as path from 'path';
import { BaselineEvaluation, CountsByRule } from 'accessibility-insights-scan';
import { BaselineInfo } from '../baseline-info';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { IMock, Mock, MockBehavior, Times } from 'typemoq';

describe(ResultMarkdownBuilder, () => {
    let combinedReportResult: CombinedReportParameters;
    let checkResultMarkdownBuilder: ResultMarkdownBuilder;
    let artifactsInfoProviderMock: IMock<ArtifactsInfoProvider>;
    const executionEnvArray = ['ADO'];

    beforeEach(() => {
        artifactsInfoProviderMock = Mock.ofType<ArtifactsInfoProvider>(undefined, MockBehavior.Strict);
        checkResultMarkdownBuilder = new ResultMarkdownBuilder(artifactsInfoProviderMock.object);
    });

    it('builds error content', () => {
        expect(checkResultMarkdownBuilder.buildErrorContent()).toMatchSnapshot();
    });

    it.each(executionEnvArray)('builds content with failures, executionEnv: %s', (executionEnv: ExecutionEnvironment) => {
        setCombinedReportResultWithFailures();

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv);

        expect(actualContent).toMatchSnapshot();
    });

    it.each(executionEnvArray)('builds content with no failures, executionEnv: %s', (executionEnv: ExecutionEnvironment) => {
        setCombinedReportResultWithNoFailures();

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv);

        expect(actualContent).toMatchSnapshot();
    });

    it.each(executionEnvArray)('escapes content for all possible axe rules, executionEnv: %s', (executionEnv: ExecutionEnvironment) => {
        const failedRules = axe.getRules().map((r) => ({
            ruleId: r.ruleId,
            description: r.description,
        }));

        combinedReportResult = {
            axeVersion: 'axeVersion',
            userAgent: 'userAgent',
            results: {
                resultsByRule: {
                    failed: failedRules.map((rule) => ({
                        failed: [{ rule }],
                    })),
                    passed: [{}],
                    notApplicable: [{}, {}],
                },
                urlResults: {
                    passedUrls: 1,
                    failedUrls: 1,
                    unscannableUrls: 1,
                },
            },
        } as CombinedReportParameters;

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv);

        const snapshotFile = path.join(__dirname, '__custom-snapshots__', 'axe-descriptions.snap.md');
        expect(actualContent).toMatchFile(snapshotFile);
    });

    it.each(executionEnvArray)('builds content with title, executionEnv: %s', (executionEnv: ExecutionEnvironment) => {
        const title = 'some title';
        setCombinedReportResultWithNoFailures();

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, title);

        expect(actualContent).toMatchSnapshot();
    });

    describe('with baseline', () => {
        let baselineFileName = 'baseline file';

        beforeEach(() => {
            artifactsInfoProviderMock
                .setup((aip) => aip.getArtifactsUrl())
                .returns(() => 'artifacts-url')
                .verifiable(Times.atLeastOnce());
        });

        it.each(executionEnvArray)(
            'builds content when there are baseline failures and new failures, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    suggestedBaselineUpdate: {},
                    totalBaselineViolations: 2,
                    totalNewViolations: 4,
                    newViolationsByRule: { 'rule id': 3, 'rule id 2': 1 } as CountsByRule,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when baseline failures and scanned failures are the same (no new failures, executionEnv: %s)',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 6,
                    totalNewViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when some baseline failures have been fixed and some still occur, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    suggestedBaselineUpdate: {},
                    totalBaselineViolations: 9,
                    totalNewViolations: 0,
                    fixedViolationsByRule: { 'rule id': 2, 'rule id 2': 1 } as CountsByRule,
                    totalFixedViolations: 3,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when some baseline failures have been fixed and some new ones have been introduced, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    suggestedBaselineUpdate: {},
                    totalBaselineViolations: 9,
                    fixedViolationsByRule: { 'rule id': 2, 'rule id 2': 1 } as CountsByRule,
                    totalNewViolations: 1,
                    newViolationsByRule: { 'rule id': 1 } as CountsByRule,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are baseline failures and no additional failures, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 1,
                    totalNewViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are no baseline failures and no new failures, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are new failures and no baseline failures, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 0,
                    totalNewViolations: 6,
                    newViolationsByRule: { 'rule id': 5, 'rule id 2': 1 } as CountsByRule,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are no new failures and no baseline detected, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation: BaselineEvaluation = undefined;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are new failures and no baseline detected, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation: BaselineEvaluation = undefined;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there is no baseline configured, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                baselineFileName = undefined;
                const baselineEvaluation: BaselineEvaluation = undefined;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );

        it.each(executionEnvArray)(
            'builds content when there are no new failures and baseline failures are undefined, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                const baselineEvaluation = {
                    totalBaselineViolations: undefined,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );
    });

    describe('uploadOutputArtifact is false', () => {
        const baselineFileName = 'baseline file';
        it.each(executionEnvArray)(
            'skips artifact link line when artifactsUrl returns undefined, executionEnv: %s',
            (executionEnv: ExecutionEnvironment) => {
                artifactsInfoProviderMock
                    .setup((aip) => aip.getArtifactsUrl())
                    .returns(() => undefined)
                    .verifiable(Times.atLeastOnce());

                const baselineEvaluation = {
                    totalBaselineViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
                verifyAllMocks();
            },
        );
    });

    const setCombinedReportResultWithFailures = (): void => {
        const ruleInfo1 = { ruleId: 'rule id', description: 'rule description' };
        combinedReportResult = {
            axeVersion: 'axeVersion',
            userAgent: 'userAgent',
            results: {
                resultsByRule: {
                    failed: [
                        {
                            failed: [
                                { rule: ruleInfo1, urls: ['url 1', 'url 2'] },
                                { rule: ruleInfo1, urls: ['url 1'] },
                                { rule: ruleInfo1, urls: ['url 3', 'url 4'] },
                            ],
                        },
                        {
                            failed: [{ rule: { ruleId: 'rule id 2', description: 'rule description 2' }, urls: ['url 5'] }],
                        },
                    ],
                    passed: [{}],
                    notApplicable: [{}, {}],
                },
                urlResults: {
                    passedUrls: 1,
                    failedUrls: 5,
                    unscannableUrls: 7,
                },
            },
        } as CombinedReportParameters;
    };

    const setCombinedReportResultWithNoFailures = (): void => {
        combinedReportResult = {
            axeVersion: 'axeVersion',
            userAgent: 'userAgent',
            results: {
                resultsByRule: {
                    failed: [],
                    passed: [{}],
                    notApplicable: [{}, {}],
                },
                urlResults: {
                    passedUrls: 1,
                    failedUrls: 0,
                    unscannableUrls: 7,
                },
            },
        } as CombinedReportParameters;
    };

    const verifyAllMocks = (): void => {
        artifactsInfoProviderMock.verifyAll();
    };
});
