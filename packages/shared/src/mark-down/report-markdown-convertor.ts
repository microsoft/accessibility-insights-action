// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { ExecutionEnvironment, ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineInfo } from '../baseline-info';

@injectable()
export class ReportMarkdownConvertor {
    constructor(@inject(ResultMarkdownBuilder) private readonly checkResultMarkdownBuilder: ResultMarkdownBuilder) {}

    public convert(
        combinedReportResult: CombinedReportParameters,
        executionEnvironment: ExecutionEnvironment,
        title?: string,
        baselineInfo?: BaselineInfo,
    ): string {
        return this.checkResultMarkdownBuilder.buildContent(combinedReportResult, executionEnvironment, title, baselineInfo);
    }

    public getErrorMarkdown(): string {
        return this.checkResultMarkdownBuilder.buildErrorContent();
    }
}
