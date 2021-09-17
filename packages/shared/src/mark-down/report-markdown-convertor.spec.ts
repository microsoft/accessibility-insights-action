// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReportMarkdownConvertor } from './report-markdown-convertor';
import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';

describe(ReportMarkdownConvertor, () => {
    let resultMarkdownBuilderMock: IMock<ResultMarkdownBuilder>;
    let reportMarkdownConvertor: ReportMarkdownConvertor;
    let combinedReportResult: CombinedReportParameters;

    beforeEach(() => {
        resultMarkdownBuilderMock = Mock.ofType(ResultMarkdownBuilder);
        combinedReportResult = {
            results: {
                urlResults: {
                    failedUrls: 3,
                    passedUrls: 5,
                },
            },
        } as CombinedReportParameters;

        reportMarkdownConvertor = new ReportMarkdownConvertor(resultMarkdownBuilderMock.object);
    });

    afterEach(() => {
        resultMarkdownBuilderMock.verifyAll();
    });

    it('should create instance', () => {
        expect(reportMarkdownConvertor).not.toBeNull();
    });

    it('convert report', () => {
        resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined)).verifiable();

        reportMarkdownConvertor.convert(combinedReportResult);
    });

    it('convert report with title', () => {
        const title = 'some title';
        resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, title)).verifiable();

        reportMarkdownConvertor.convert(combinedReportResult, title);
    });

    it('get error markdown', () => {
        resultMarkdownBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportMarkdownConvertor.getErrorMarkdown();
    });
});
