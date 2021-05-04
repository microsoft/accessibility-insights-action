// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';
import { Logger } from '../logger/logger';
import { CombinedReportParameters } from 'accessibility-insights-report';

@injectable()
export class AllProgressReporter implements ProgressReporter {
    private readonly progressReporters: ProgressReporter[];

    constructor(
        @inject(PullRequestCommentCreator) pullRequestCommentCreator: PullRequestCommentCreator,
        @inject(CheckRunCreator) checkRunCreator: CheckRunCreator,
        @inject(Logger) private readonly logger: Logger,
    ) {
        this.progressReporters = [checkRunCreator, pullRequestCommentCreator];
    }

    public async start(): Promise<void> {
        await this.execute((r) => r.start());
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        await this.execute((r) => r.completeRun(combinedReportResult));
    }

    public async failRun(message: string): Promise<void> {
        await this.execute((r) => r.failRun(message));
    }

    private async execute(callback: (reporter: ProgressReporter) => Promise<void>): Promise<void> {
        if (process.env['ACT'] === 'true') {
            this.logger.logInfo(`Detected local act environment. Skip running progress reporters.`);

            return;
        }

        const length = this.progressReporters.length;
        for (let pos = 0; pos < length; pos += 1) {
            await callback(this.progressReporters[pos]);
        }
    }
}
