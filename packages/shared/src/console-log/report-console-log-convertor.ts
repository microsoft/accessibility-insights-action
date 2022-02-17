// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { OutputFormatter } from '../output/output-formatter';
import { BaselineInfo } from '../baseline-info';
import { ConsoleLogOutputFormatter } from './console-log-output-formatter';
import { ResultOutputBuilder } from '../output/result-output-builder';

@injectable()
export class ReportConsoleLogConvertor {
    private resultOutputBuilder: ResultOutputBuilder;
    constructor(
        @inject('Factory<ResultOutputBuilder>') resultOutputBuilderFactory: (formatter: OutputFormatter) => ResultOutputBuilder,
        @inject(ConsoleLogOutputFormatter) private readonly consoleLogOutputFormatter: ConsoleLogOutputFormatter,
    ) {
        this.resultOutputBuilder = resultOutputBuilderFactory(this.consoleLogOutputFormatter);
    }

    public convert(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        const addMargin = true;
        return this.resultOutputBuilder.buildContent(combinedReportResult, title, baselineInfo, addMargin);
    }

    public getErrorMarkdown(): string {
        return this.resultOutputBuilder.buildErrorContent();
    }
}
