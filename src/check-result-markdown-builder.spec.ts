// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import { AxeScanResults } from 'accessibility-insights-scan';

import { CheckResultMarkdownBuilder } from './check-result-markdown-builder';

// tslint:disable: no-unsafe-any no-null-keyword no-object-literal-type-assertion
describe(CheckResultMarkdownBuilder, () => {
    let checkResultMarkdownBuilder: CheckResultMarkdownBuilder;
    let axeScanResults: AxeScanResults;

    beforeEach(() => {
        checkResultMarkdownBuilder = new CheckResultMarkdownBuilder();
    });

    it('getFailureDetails', () => {
        axeScanResults = {
            results: {
                testEngine: {
                    version: '1.0.1',
                },
                violations: [
                    {
                        id: 'color-contrast',
                        nodes: [{ html: 'html1' }, { html: 'html2' }],
                        description: 'color-contrast is important',
                    },
                    {
                        id: 'duplicate-id',
                        nodes: [{ html: 'html3' }, { html: 'html4' }, { html: 'html5' }],
                        description: 'duplicate-id is even more important',
                    },
                ],
                passes: [{ html: 'passed' }],
                inapplicable: [{ html: 'inapplicable' }],
            },
            browserSpec: 'browserSpec',
        } as any;

        expect(checkResultMarkdownBuilder.getFailureDetails(axeScanResults)).toMatchSnapshot();
    });

    it('errorContent', () => {
        expect(checkResultMarkdownBuilder.errorContent()).toMatchSnapshot();
    });

    it('congratsContent', () => {
        axeScanResults = {
            browserSpec: 'browserSpec',
            results: {
                testEngine: {
                    version: '1.0.1',
                },
                violations: [],
                passes: [{ html: 'passed' }],
                inapplicable: [{ html: 'inapplicable' }],
            },
        } as any;

        const res = checkResultMarkdownBuilder.congratsContent(axeScanResults);

        expect(res).toMatchSnapshot();
    });
});
