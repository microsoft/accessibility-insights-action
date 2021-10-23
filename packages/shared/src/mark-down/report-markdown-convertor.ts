// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { ResultMarkdownBuilder } from './result-markdown-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineInfo } from '../baseline-info';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';

@injectable()
export class ReportMarkdownConvertor {
    constructor(@inject(ResultMarkdownBuilder) private readonly checkResultMarkdownBuilder: ResultMarkdownBuilder) {}

    public convert(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo, artifactsInfoProvider?: ArtifactsInfoProvider): string {
        return this.checkResultMarkdownBuilder.buildContent(combinedReportResult, title, baselineInfo, artifactsInfoProvider);
    }

    public getErrorMarkdown(): string {
        return this.checkResultMarkdownBuilder.buildErrorContent();
    }
}
