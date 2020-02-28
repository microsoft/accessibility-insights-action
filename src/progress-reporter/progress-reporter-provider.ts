// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { inject, injectable } from 'inversify';

import { iocTypes } from '../ioc/ioc-types';
import { Logger } from '../logger/logger';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';

@injectable()
export class ProgressReporterProvider {
    constructor(
        @inject(PullRequestCommentCreator) private readonly pullRequestCommentCreator: PullRequestCommentCreator,
        @inject(CheckRunCreator) private readonly checkRunCreator: CheckRunCreator,
        @inject(iocTypes.Github) private readonly githubObj: typeof github,
        @inject(Logger) private readonly logger: Logger,
    ) {}

    public getInstance(): ProgressReporter {
        if (this.isPullRequest()) {
            return this.pullRequestCommentCreator;
        }

        return this.checkRunCreator;
    }

    private isPullRequest(): boolean {
        this.logMessage(`event name - ${this.githubObj.context.eventName}`);

        return this.githubObj.context.eventName === 'pull_request';
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`[ProgressReporterProvider] ${message}`);
    }
}
