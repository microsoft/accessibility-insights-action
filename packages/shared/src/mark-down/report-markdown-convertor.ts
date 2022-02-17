// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineInfo } from '../baseline-info';
import { ResultOutputBuilder } from '../output/result-output-builder';
import { MarkdownOutputFormatter } from './markdown-formatter';
import { OutputFormatter } from '../output/output-formatter';

@injectable()
export class ReportMarkdownConvertor {
    private _resultOutputBuilder: ResultOutputBuilder;
    constructor(
        @inject('Factory<ResultOutputBuilder>') resultOutputBuilderFactory: (formatter: OutputFormatter) => ResultOutputBuilder,
        @inject(MarkdownOutputFormatter) private readonly markdownOutputFormatter: MarkdownOutputFormatter,
    ) {
        this._resultOutputBuilder = resultOutputBuilderFactory(this.markdownOutputFormatter);
    }

    public convert(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        return this._resultOutputBuilder.buildContent(combinedReportResult, title, baselineInfo);
    }

    public getErrorMarkdown(): string {
        return this._resultOutputBuilder.buildErrorContent();
    }
}
