// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as axe from 'axe-core';
import * as path from 'path';
import { BaselineEvaluation } from '../baseline-types';

describe(ResultMarkdownBuilder, () => {
    let combinedReportResult: CombinedReportParameters;
    let checkResultMarkdownBuilder: ResultMarkdownBuilder;

    beforeEach(() => {
        checkResultMarkdownBuilder = new ResultMarkdownBuilder();
    });

    it('builds error content', () => {
        expect(checkResultMarkdownBuilder.buildErrorContent()).toMatchSnapshot();
    });

    it('builds content with failures', () => {
        combinedReportResult = {
            axeVersion: 'axeVersion',
            userAgent: 'userAgent',
            results: {
                resultsByRule: {
                    failed: [
                        {
                            failed: [{ rule: { ruleId: 'rule id', description: 'rule description' } }, {}, {}],
                        },
                        {
                            failed: [{ rule: { ruleId: 'rule id 2', description: 'rule description 2' } }],
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

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult);

        expect(actualContent).toMatchSnapshot();
    });

    it('builds content with no failures', () => {
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

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult);

        expect(actualContent).toMatchSnapshot();
    });

    it('escapes content for all possible axe rules', () => {
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

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult);

        const snapshotFile = path.join(__dirname, '__custom-snapshots__', 'axe-descriptions.snap.md');
        expect(actualContent).toMatchFile(snapshotFile);
    });

    it('builds content with title', () => {
        const title = 'some title';
        combinedReportResult = {
            axeVersion: 'axeVersion',
            userAgent: 'userAgent',
            results: {
                resultsByRule: {
                    failed: [],
                    passed: [],
                    notApplicable: [],
                },
                urlResults: {
                    passedUrls: 0,
                    failedUrls: 0,
                    unscannableUrls: 0,
                },
            },
        } as CombinedReportParameters;

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, title);

        expect(actualContent).toMatchSnapshot();
    });

    describe('with baseline', () => {
        it('builds content when there are baseline failures and new failures', () => {
            const title = 'some title';
            const baselineFileName = 'baseline file';
            const baselineEvaluation = {
                totalBaselineViolations: 1,
            } as BaselineEvaluation;
            combinedReportResult = {
                axeVersion: 'axeVersion',
                userAgent: 'userAgent',
                results: {
                    resultsByRule: {
                        failed: [
                            {
                                failed: [{ rule: { ruleId: 'rule id', description: 'rule description' } }, {}, {}],
                            },
                            {
                                failed: [{ rule: { ruleId: 'rule id 2', description: 'rule description 2' } }],
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

            const actualContent = checkResultMarkdownBuilder.buildContent(
                combinedReportResult,
                title,
                baselineFileName,
                baselineEvaluation,
            );

            expect(actualContent).toMatchSnapshot();
        });

        it('builds content when there are baseline failures and no new failures', () => {
            const title = 'some title';
            const baselineFileName = 'baseline file';
            const baselineEvaluation = {
                totalBaselineViolations: 1,
            } as BaselineEvaluation;
            combinedReportResult = {
                axeVersion: 'axeVersion',
                userAgent: 'userAgent',
                results: {
                    resultsByRule: {
                        failed: [],
                        passed: [],
                        notApplicable: [],
                    },
                    urlResults: {
                        passedUrls: 0,
                        failedUrls: 0,
                        unscannableUrls: 0,
                    },
                },
            } as CombinedReportParameters;

            const actualContent = checkResultMarkdownBuilder.buildContent(
                combinedReportResult,
                title,
                baselineFileName,
                baselineEvaluation,
            );

            expect(actualContent).toMatchSnapshot();
        });

        it('builds content when there are no baseline failures and no new failures', () => {
            const title = 'some title';
            const baselineFileName = 'baseline file';
            const baselineEvaluation = {
                totalBaselineViolations: 0,
            } as BaselineEvaluation;
            combinedReportResult = {
                axeVersion: 'axeVersion',
                userAgent: 'userAgent',
                results: {
                    resultsByRule: {
                        failed: [],
                        passed: [],
                        notApplicable: [],
                    },
                    urlResults: {
                        passedUrls: 0,
                        failedUrls: 0,
                        unscannableUrls: 0,
                    },
                },
            } as CombinedReportParameters;

            const actualContent = checkResultMarkdownBuilder.buildContent(
                combinedReportResult,
                title,
                baselineFileName,
                baselineEvaluation,
            );

            expect(actualContent).toMatchSnapshot();
        });

        it('builds content when there was no baseline detected', () => {
            const title = 'some title';
            combinedReportResult = {
                axeVersion: 'axeVersion',
                userAgent: 'userAgent',
                results: {
                    resultsByRule: {
                        failed: [],
                        passed: [],
                        notApplicable: [],
                    },
                    urlResults: {
                        passedUrls: 0,
                        failedUrls: 0,
                        unscannableUrls: 0,
                    },
                },
            } as CombinedReportParameters;

            const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult, title, undefined, undefined);

            expect(actualContent).toMatchSnapshot();
        });
    });
});
