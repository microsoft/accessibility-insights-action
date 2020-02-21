// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import { AxeScanResults } from 'accessibility-insights-scan';

import { AxeMarkdownConvertor } from './axe-markdown-convertor';

// tslint:disable: no-unsafe-any no-null-keyword no-object-literal-type-assertion
describe(AxeMarkdownConvertor, () => {
    let axeMarkdownConvertor: AxeMarkdownConvertor;
    let axeScanResults: AxeScanResults;

    beforeEach(() => {
        axeMarkdownConvertor = new AxeMarkdownConvertor();
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
        it('returns congrats message when no failure found', async () => {
            const res = axeMarkdownConvertor.convert(axeScanResults);

            expect(res).toMatchSnapshot();
        });

        it('returns failure details', async () => {
            axeScanResults.results.violations = [
                {
                    id: 'color-contrast',
                    nodes: [{ html: 'html1' }],
                },
                {
                    id: 'duplicate-id',
                    nodes: [{ html: 'html2' }],
                },
            ] as any;

            const res = axeMarkdownConvertor.convert(axeScanResults);

            expect(res).toMatchSnapshot();
        });
    });
});
