// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { ResultConsoleLogBuilder } from './result-console-log-builder';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineInfo } from '../baseline-info';

@injectable()
export class ReportConsoleLogConvertor {
    constructor(@inject(ResultConsoleLogBuilder) private readonly resultConsoleLogBuilder: ResultConsoleLogBuilder) {}

    public convert(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        return this.resultConsoleLogBuilder.buildContent(combinedReportResult, title, baselineInfo);
    }

    public getErrorMarkdown(): string {
        return this.resultConsoleLogBuilder.buildErrorContent();
    }
}
