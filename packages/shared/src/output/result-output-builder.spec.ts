// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { CombinedReportParameters } from 'accessibility-insights-report';
import * as axe from 'axe-core';
import * as path from 'path';
import { BaselineEvaluation, CountsByRule } from 'accessibility-insights-scan';
import { BaselineInfo } from '../baseline-info';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { Mock, MockBehavior } from 'typemoq';
import { ResultOutputBuilder } from './result-output-builder';
import { MarkdownOutputFormatter } from '../mark-down/markdown-output-formatter';
import { ConsoleLogOutputFormatter } from '../console-log/console-log-output-formatter';

describe(ResultOutputBuilder, () => {
    let combinedReportResult: CombinedReportParameters;
    let markdownFormatterResultOutputBuilder: ResultOutputBuilder;
    let consoleFormatterResultOutputBuilder: ResultOutputBuilder;
    const outputFormatters = [
        ['markdown', createMarkdownFormatterResultsOutputBuilder()],
        ['console', createConsoleFormatterResultsOutputBuilder()],
    ];

    it.each(outputFormatters)('builds %s error content', (_, builder: ResultOutputBuilder) => {
        expect(builder.buildErrorContent()).toMatchSnapshot();
    });

    it.each(outputFormatters)('builds %s content with failures', (_, builder: ResultOutputBuilder) => {
        setCombinedReportResultWithFailures();

        const actualContent = builder.buildContent(combinedReportResult);

        expect(actualContent).toMatchSnapshot();
    });

    it.each(outputFormatters)('builds %s content with no failures', (_, builder: ResultOutputBuilder) => {
        setCombinedReportResultWithNoFailures();

        const actualContent = builder.buildContent(combinedReportResult);

        expect(actualContent).toMatchSnapshot();
    });

    it.each(outputFormatters)(
        '%s formatter escapes content for all possible axe rules',
        (outputFormatterName: string, builder: ResultOutputBuilder) => {
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

            const actualContent = builder.buildContent(combinedReportResult);

            const snapshotFile = path.join(__dirname, '__custom-snapshots__', `${outputFormatterName}-axe-descriptions.snap.md`);
            expect(actualContent).toMatchFile(snapshotFile);
        },
    );

    it.each(outputFormatters)('builds %s content with title', (_, builder: ResultOutputBuilder) => {
        const title = 'some title';
        setCombinedReportResultWithNoFailures();

        const actualContent = builder.buildContent(combinedReportResult, title);

        expect(actualContent).toMatchSnapshot();
    });

    describe('with baseline', () => {
        let baselineFileName = 'baseline file';

        it.each(outputFormatters)(
            'builds %s content when there are baseline failures and new failures',
            (_, builder: ResultOutputBuilder) => {
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

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when baseline failures and scanned failures are the same (no new failures)',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 6,
                    totalNewViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when some baseline failures have been fixed and some still occur',
            (_, builder: ResultOutputBuilder) => {
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

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when some baseline failures have been fixed and some new ones have been introduced',
            (_, builder: ResultOutputBuilder) => {
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

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when there are baseline failures and no additional failures',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 1,
                    totalNewViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when there are no baseline failures and no new failures',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation = {
                    totalBaselineViolations: 0,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when there are new failures and no baseline failures',
            (_, builder: ResultOutputBuilder) => {
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

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when there are no new failures and no baseline detected',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation: BaselineEvaluation = undefined;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)(
            'builds %s content when there are new failures and no baseline detected',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation: BaselineEvaluation = undefined;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
            },
        );

        it.each(outputFormatters)('builds %s content when there is no baseline configured', (_, builder: ResultOutputBuilder) => {
            baselineFileName = undefined;
            const baselineEvaluation: BaselineEvaluation = undefined;
            const baselineInfo: BaselineInfo = {
                baselineFileName,
                baselineEvaluation,
            };
            setCombinedReportResultWithFailures();

            const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

            expect(actualContent).toMatchSnapshot();
        });

        it.each(outputFormatters)(
            'builds %s content when there are no new failures and baseline failures are undefined',
            (_, builder: ResultOutputBuilder) => {
                const baselineEvaluation = {
                    totalBaselineViolations: undefined,
                } as BaselineEvaluation;
                const baselineInfo: BaselineInfo = {
                    baselineFileName,
                    baselineEvaluation,
                };
                setCombinedReportResultWithNoFailures();

                const actualContent = builder.buildContent(combinedReportResult, undefined, baselineInfo);

                expect(actualContent).toMatchSnapshot();
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

    function createMarkdownFormatterResultsOutputBuilder(): ResultOutputBuilder {
        const artifactsInfoProviderMock = Mock.ofType<ArtifactsInfoProvider>(undefined, MockBehavior.Strict);
        artifactsInfoProviderMock.setup((aip) => aip.getArtifactsUrl()).returns(() => 'artifacts-url');
        markdownFormatterResultOutputBuilder = new ResultOutputBuilder(artifactsInfoProviderMock.object);
        markdownFormatterResultOutputBuilder.setOutputFormatter(new MarkdownOutputFormatter());
        return markdownFormatterResultOutputBuilder;
    }

    function createConsoleFormatterResultsOutputBuilder(): ResultOutputBuilder {
        const artifactsInfoProviderMock = Mock.ofType<ArtifactsInfoProvider>(undefined, MockBehavior.Strict);
        artifactsInfoProviderMock.setup((aip) => aip.getArtifactsUrl()).returns(() => 'artifacts-url');
        consoleFormatterResultOutputBuilder = new ResultOutputBuilder(artifactsInfoProviderMock.object);
        consoleFormatterResultOutputBuilder.setOutputFormatter(new ConsoleLogOutputFormatter());
        return consoleFormatterResultOutputBuilder;
    }
});
