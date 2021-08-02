// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';
import { CombinedReportParameters } from 'accessibility-insights-report';

@injectable()
export class AllProgressReporter extends ProgressReporter {
    private readonly progressReporters: ProgressReporter[];

    constructor(
        @inject(PullRequestCommentCreator) pullRequestCommentCreator: PullRequestCommentCreator,
        @inject(CheckRunCreator) checkRunCreator: CheckRunCreator,
    ) {
        super();
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
        const length = this.progressReporters.length;
        for (let pos = 0; pos < length; pos += 1) {
            await callback(this.progressReporters[pos]);
        }
    }
}
