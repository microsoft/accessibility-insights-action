// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { AxeScanResults } from 'accessibility-insights-scan';
import { IMock, Mock, Times } from 'typemoq';

import { AxeMarkdownConvertor } from './axe-markdown-convertor';
import { CheckResultMarkdownBuilder } from './check-result-markdown-builder';

describe(AxeMarkdownConvertor, () => {
    let axeMarkdownConvertor: AxeMarkdownConvertor;
    let markdownBuilderMock: IMock<CheckResultMarkdownBuilder>;
    let axeScanResults: AxeScanResults;

    beforeEach(() => {
        markdownBuilderMock = Mock.ofType(CheckResultMarkdownBuilder);
        axeMarkdownConvertor = new AxeMarkdownConvertor(markdownBuilderMock.object);
        axeScanResults = {
            results: {
                violations: [],
            },
        } as AxeScanResults;
    });

    it('should create instance', () => {
        expect(axeMarkdownConvertor).not.toBeNull();
    });

    describe('convert', () => {
        it('returns congrats message when no failure found', () => {
            markdownBuilderMock.setup((mm) => mm.congratsContent(axeScanResults)).verifiable(Times.once());

            axeMarkdownConvertor.convert(axeScanResults);

            markdownBuilderMock.verifyAll();
        });

        it('returns failure details', () => {
            axeScanResults.results = {
                violations: [
                    {
                        id: 'color-contrast',
                        nodes: [{ html: 'html1' }, { html: 'html2' }],
                    },
                    {
                        id: 'duplicate-id',
                        nodes: [{ html: 'html3' }, { html: 'html4' }, { html: 'html5' }],
                    },
                ],
                passes: [{ html: 'passed' }],
                inapplicable: [{ html: 'inapplicable' }],
            } as any;
            markdownBuilderMock.setup((mm) => mm.failureDetails(axeScanResults)).verifiable(Times.once());

            axeMarkdownConvertor.convert(axeScanResults);

            markdownBuilderMock.verifyAll();
        });
    });

    it('getErrorMarkdown', () => {
        markdownBuilderMock.setup((mm) => mm.errorContent()).verifiable(Times.once());

        axeMarkdownConvertor.getErrorMarkdown();

        markdownBuilderMock.verifyAll();
    });
});
