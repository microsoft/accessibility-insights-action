// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes, Logger, ProgressReporter, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { GHTaskConfig } from '../task-config/gh-task-config';

@injectable()
export class JobSummaryCreator extends ProgressReporter {
    private scanSucceeded = true;

    constructor(
        @inject(iocTypes.TaskConfig) private readonly taskConfig: GHTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
    ) {
        super();
    }

    public start(): Promise<void> {
        this.logger.logDebug('job summary creator started');
        return Promise.resolve();
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult, true);
        return await this.taskConfig.writeJobSummary(reportMarkdown);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(): Promise<void> {
        this.scanSucceeded = false;
    }

    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(this.scanSucceeded);
    }
}
