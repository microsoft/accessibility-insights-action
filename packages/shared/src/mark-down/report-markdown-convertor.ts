// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { MarkdownOutputFormatter } from './markdown-output-formatter';
import { OutputFormatter } from '../output/output-formatter';
import { ResultOutputBuilder } from '../output/result-output-builder';
import { BaselineInfo } from '../baseline-info';
import { iocTypes } from '..';

@injectable()
export class ReportMarkdownConvertor {
    private resultOutputBuilder: ResultOutputBuilder;
    constructor(
        @inject(iocTypes.ResultOutputBuilderFactory) resultOutputBuilderFactory: (formatter: OutputFormatter) => ResultOutputBuilder,
        @inject(MarkdownOutputFormatter) private readonly markdownOutputFormatter: MarkdownOutputFormatter,
    ) {
        this.resultOutputBuilder = resultOutputBuilderFactory(this.markdownOutputFormatter);
    }

    public convert(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        const addMargin = false;
        return this.resultOutputBuilder.buildContent(combinedReportResult, title, baselineInfo, false);
    }

    public getErrorMarkdown(): string {
        return this.resultOutputBuilder.buildErrorContent();
    }
}
