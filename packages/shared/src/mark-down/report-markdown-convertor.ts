// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { BaselineEvaluation } from '../baseline-types';
import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';

@injectable()
export class ReportMarkdownConvertor {
    constructor(@inject(ResultMarkdownBuilder) private readonly checkResultMarkdownBuilder: ResultMarkdownBuilder) {}

    public convert(
        combinedReportResult: CombinedReportParameters,
        title?: string,
        baselineFileName?: string,
        baselineEvaluation?: BaselineEvaluation,
    ): string {
        return this.checkResultMarkdownBuilder.buildContent(combinedReportResult, title, baselineFileName, baselineEvaluation);
    }

    public getErrorMarkdown(): string {
        return this.checkResultMarkdownBuilder.buildErrorContent();
    }
}
