// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';

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
});
