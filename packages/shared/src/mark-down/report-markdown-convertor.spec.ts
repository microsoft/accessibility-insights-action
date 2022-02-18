// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReportMarkdownConvertor } from './report-markdown-convertor';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { OutputFormatter } from '../output/output-formatter';
import { ResultOutputBuilder } from '../output/result-output-builder';
import { MarkdownOutputFormatter } from './markdown-output-formatter';

describe(ReportMarkdownConvertor, () => {
    let reportMarkdownConvertor: ReportMarkdownConvertor;
    let combinedReportResult: CombinedReportParameters;
    let resultOutputBuilderFactoryMock: IMock<(formatter: OutputFormatter) => ResultOutputBuilder>;
    let markdownOutputFormatterMock: IMock<MarkdownOutputFormatter>;
    let resultOutputBuilderMock: IMock<ResultOutputBuilder>;

    beforeEach(() => {
        resultOutputBuilderFactoryMock = Mock.ofType<(formatter: OutputFormatter) => ResultOutputBuilder>();
        markdownOutputFormatterMock = Mock.ofType<OutputFormatter>();
        resultOutputBuilderMock = Mock.ofType<ResultOutputBuilder>();
        combinedReportResult = {
            results: {
                urlResults: {
                    failedUrls: 3,
                    passedUrls: 5,
                },
            },
        } as CombinedReportParameters;

        resultOutputBuilderFactoryMock.setup((o) => o(markdownOutputFormatterMock.object)).returns(() => resultOutputBuilderMock.object);

        reportMarkdownConvertor = new ReportMarkdownConvertor(resultOutputBuilderFactoryMock.object, markdownOutputFormatterMock.object);
    });

    afterEach(() => {
        resultOutputBuilderMock.verifyAll();
    });

    it('should create instance', () => {
        expect(reportMarkdownConvertor).not.toBeNull();
    });

    describe('convert', () => {
        it('report', () => {
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, undefined, false)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult);
        });

        it('report with title', () => {
            const title = 'some title';
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, title, undefined, false)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, title);
        });

        it('report with baseline', () => {
            const baselineInfo = {
                baselineFileName: 'some filename',
                baselineEvaluationStub: {} as BaselineEvaluation,
            };
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, baselineInfo, false)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, undefined, baselineInfo);
        });
    });

    it('get error markdown', () => {
        resultOutputBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportMarkdownConvertor.getErrorMarkdown();
    });
});
