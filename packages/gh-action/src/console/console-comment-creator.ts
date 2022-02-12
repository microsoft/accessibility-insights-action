// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { Logger, ProgressReporter, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';

@injectable()
export class ConsoleCommentCreator extends ProgressReporter {
    private scanSucceeded = true;

    constructor(
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
    ) {
        super();
    }

    public start(): Promise<void> {
        // We don't do anything for pull request flow
        this.logger.logDebug('console comment creator started');
        return Promise.resolve();
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult);
        this.logger.logInfo(reportMarkdown);
        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(): Promise<void> {
        this.scanSucceeded = false;
    }

    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(this.scanSucceeded);
    }
}
