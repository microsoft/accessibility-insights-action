// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { OutputFormatter } from '../output/output-formatter';
import { ResultOutputBuilder } from '../output/result-output-builder';
import { ReportConsoleLogConvertor } from './report-console-log-convertor';
import { ConsoleLogOutputFormatter } from './console-log-output-formatter';

describe(ReportConsoleLogConvertor, () => {
    let reportConsoleLogConvertor: ReportConsoleLogConvertor;
    let combinedReportResult: CombinedReportParameters;
    let resultOutputBuilderFactoryMock: IMock<(formatter: OutputFormatter) => ResultOutputBuilder>;
    let consoleLogOutputFormatterMock: IMock<ConsoleLogOutputFormatter>;
    let resultOutputBuilderMock: IMock<ResultOutputBuilder>;

    beforeEach(() => {
        resultOutputBuilderFactoryMock = Mock.ofType<(formatter: OutputFormatter) => ResultOutputBuilder>();
        consoleLogOutputFormatterMock = Mock.ofType<OutputFormatter>();
        resultOutputBuilderMock = Mock.ofType<ResultOutputBuilder>();
        combinedReportResult = {
            results: {
                urlResults: {
                    failedUrls: 3,
                    passedUrls: 5,
                },
            },
        } as CombinedReportParameters;

        resultOutputBuilderFactoryMock.setup((o) => o(consoleLogOutputFormatterMock.object)).returns(() => resultOutputBuilderMock.object);

        reportConsoleLogConvertor = new ReportConsoleLogConvertor(
            resultOutputBuilderFactoryMock.object,
            consoleLogOutputFormatterMock.object,
        );
    });

    afterEach(() => {
        resultOutputBuilderMock.verifyAll();
    });

    it('should create instance', () => {
        expect(reportConsoleLogConvertor).not.toBeNull();
    });

    describe('convert', () => {
        it('report', () => {
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, undefined, true)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult);
        });

        it('report with title', () => {
            const title = 'some title';
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, title, undefined, true)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult, title);
        });

        it('report with baseline', () => {
            const baselineInfo = {
                baselineFileName: 'some filename',
                baselineEvaluationStub: {} as BaselineEvaluation,
            };
            resultOutputBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, baselineInfo, true)).verifiable();

            reportConsoleLogConvertor.convert(combinedReportResult, undefined, baselineInfo);
        });
    });

    it('get error markdown', () => {
        resultOutputBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportConsoleLogConvertor.getErrorMarkdown();
    });
});
