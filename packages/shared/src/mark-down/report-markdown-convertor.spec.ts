// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReportMarkdownConvertor } from './report-markdown-convertor';
import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';

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

    describe('convert', () => {
        it('report', () => {
            resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, undefined, undefined)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult);
        });

        it('report with title', () => {
            const title = 'some title';
            resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, title, undefined, undefined)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, title);
        });

        it('report with baseline', () => {
            const baselineInfo = {
                baselineFileName: 'some filename',
                baselineEvaluationStub: {} as BaselineEvaluation,
            };
            resultMarkdownBuilderMock.setup((o) => o.buildContent(combinedReportResult, undefined, baselineInfo, undefined)).verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, undefined, baselineInfo);
        });

        it('report with artifactsInfoProvider', () => {
            const artifactsInfoProviderMock = Mock.ofType<ArtifactsInfoProvider>();
            resultMarkdownBuilderMock
                .setup((o) => o.buildContent(combinedReportResult, undefined, undefined, artifactsInfoProviderMock.object))
                .verifiable();

            reportMarkdownConvertor.convert(combinedReportResult, undefined, undefined, artifactsInfoProviderMock.object);
        });
    });

    it('get error markdown', () => {
        resultMarkdownBuilderMock.setup((o) => o.buildErrorContent()).verifiable();

        reportMarkdownConvertor.getErrorMarkdown();
    });
});
