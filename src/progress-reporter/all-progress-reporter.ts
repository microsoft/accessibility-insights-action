// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { inject, injectable } from 'inversify';

import { AxeScanResults } from 'accessibility-insights-scan';
import { iocTypes } from '../ioc/ioc-types';
import { Logger } from '../logger/logger';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';

@injectable()
export class AllProgressReporter implements ProgressReporter {
    private readonly progressReporters: ProgressReporter[];

    constructor(
        @inject(PullRequestCommentCreator) pullRequestCommentCreator: PullRequestCommentCreator,
        @inject(CheckRunCreator) checkRunCreator: CheckRunCreator,
    ) {
        this.progressReporters = [checkRunCreator, pullRequestCommentCreator];
    }

    public async start(): Promise<void> {
        await this.execute(r => r.start());
    }

    public async completeRun(axeScanResults: AxeScanResults): Promise<void> {
        await this.execute(r => r.completeRun(axeScanResults));
    }

    public async failRun(message: string): Promise<void> {
        await this.execute(r => r.failRun(message));
    }

    private async execute(callback: (reporter: ProgressReporter) => Promise<void>): Promise<void> {
        const length = this.progressReporters.length;
        for (let pos = 0; pos < length; pos += 1) {
            await callback(this.progressReporters[pos]);
        }
    }
}
