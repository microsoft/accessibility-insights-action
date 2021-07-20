// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as axe from 'axe-core';
import * as path from 'path';

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
        } as any;

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
        } as any;

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
        } as any;

        const actualContent = checkResultMarkdownBuilder.buildContent(combinedReportResult);

        const snapshotFile = path.join(__dirname, '__custom-snapshots__', 'axe-descriptions.snap.md');
        expect(actualContent).toMatchFile(snapshotFile);
    });
});
