// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReportConsoleLogConvertor } from './report-console-log-convertor';
import { ResultConsoleLogBuilder } from './result-console-log-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';

describe(ReportConsoleLogConvertor, () => {
    let resultConsoleLogBuilderMock: IMock<ResultConsoleLogBuilder>;
    let reportConsoleLogConvertor: ReportConsoleLogConvertor;
    let combinedReportResult: CombinedReportParameters;

    beforeEach(() => {
        resultConsoleLogBuilderMock = Mock.ofType(ResultConsoleLogBuilder);
        combinedReportResult = {
            results: {
                urlResults: {
                    failedUrls: 3,
                    passedUrls: 5,
                },
            },
        } as CombinedReportParameters;

        reportConsoleLogConvertor = new ReportConsoleLogConvertor(resultConsoleLogBuilderMock.object);
    });

    afterEach(() => {
        resultConsoleLogBuilderMock.verifyAll();
    });

    it('should create instance', () => {
        expect(reportConsoleLogConvertor).not.toBeNull();
    });

    describe('convert', () => {
        it('report', () => {
            resultConsoleLogBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, undefined)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult);
        });

        it('report with title', () => {
            const title = 'some title';
            resultConsoleLogBuilderMock.setup((o) => o.buildContent(combinedReportResult, title, undefined)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult, title);
        });

        it('report with baseline', () => {
            const baselineInfo = {
                baselineFileName: 'some filename',
                baselineEvaluationStub: {} as BaselineEvaluation,
            };
            resultConsoleLogBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, baselineInfo)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult, undefined, baselineInfo);
        });
    });

    it('get error output', () => {
        resultConsoleLogBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportConsoleLogConvertor.getErrorMarkdown();
    });
});
