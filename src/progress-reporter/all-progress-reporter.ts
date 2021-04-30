// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { AxeScanResults } from 'accessibility-insights-scan';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';
import { Logger } from '../logger/logger';

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

    public async completeRun(axeScanResults: AxeScanResults): Promise<void> {
        this.logger.logInfo("completing run");
        await this.execute((r) => r.completeRun(axeScanResults));
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
            this.logger.logInfo('completing progress callback');
            await callback(this.progressReporters[pos]);
        }
    }
}
