// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReportMarkdownConvertor } from './report-markdown-convertor';
import { ExecutionEnvironment, ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';

describe(ReportMarkdownConvertor, () => {
    let resultMarkdownBuilderMock: IMock<ResultMarkdownBuilder>;
    let reportMarkdownConvertor: ReportMarkdownConvertor;
    let combinedReportResult: CombinedReportParameters;
    const executionEnvArray = ['ADO', 'github'];

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

    describe('convert', () => {
        it.each(['ADO', 'github'])(
            'should convert with baseline and title undefined and execution env %s',
            (executionEnv: ExecutionEnvironment) => {
                resultMarkdownBuilderMock
                    .setup((o) => o.buildContent(combinedReportResult, executionEnv, undefined, undefined))
                    .verifiable();

                reportMarkdownConvertor.convert(combinedReportResult, executionEnv);
            },
        );

        it.each(['ADO', 'github'])(
            'should convert with baseline and title defined and execution env %s',
            (executionEnv: ExecutionEnvironment) => {
                const title = 'some title';
                resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, executionEnv, title, undefined)).verifiable();

                reportMarkdownConvertor.convert(combinedReportResult, executionEnv, title);
            },
        );

        it.each(['ADO', 'github'])('report with baseline, execution env %s', (executionEnv: ExecutionEnvironment) => {
            const baselineInfo = {
                baselineFileName: 'some filename',
                baselineEvaluationStub: {} as BaselineEvaluation,
            };
            resultMarkdownBuilderMock
                .setup((o) => o.buildContent(combinedReportResult, executionEnv, undefined, baselineInfo))
                .verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, executionEnv, undefined, baselineInfo);
        });
    });

    it('get error markdown', () => {
        resultMarkdownBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportMarkdownConvertor.getErrorMarkdown();
    });
});
