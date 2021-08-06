// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { inject, injectable } from 'inversify';
import { isEmpty, isNil } from 'lodash';
import { iocTypes } from '../../ioc/ioc-types';
import { Logger } from '../../logger/logger';
import { ReportMarkdownConvertor } from '../../mark-down/report-markdown-convertor';
import { productTitle } from '../../mark-down/markdown-formatter';
import { ProgressReporter } from '../progress-reporter';
import { CombinedReportParameters } from 'accessibility-insights-report';

type ListCommentsResponseItem = RestEndpointMethodTypes['issues']['listComments']['response']['data'][0];

@injectable()
export class PullRequestCommentCreator extends ProgressReporter {
    constructor(
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(iocTypes.Github) private readonly githubObj: typeof github,
        @inject(Logger) private readonly logger: Logger,
    ) {
        super();
    }

    public async start(): Promise<void> {
        // We don't do anything for pull request flow
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        const pullRequest = this.githubObj.context.payload.pull_request;
        const existingComment = await this.findComment(pullRequest.number);
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult);
        this.traceMarkdown(reportMarkdown);

        if (isNil(existingComment)) {
            this.logMessage('Creating new comment');
            await this.invoke(
                async () =>
                    await this.octokit.issues.createComment({
                        owner: this.githubObj.context.repo.owner,
                        repo: this.githubObj.context.repo.repo,
                        body: "placeholder markdown",
                        issue_number: pullRequest.number,
                    }),
            );
        } else {
            this.logMessage('Updating existing comment');
            await this.invoke(
                async () =>
                    await this.octokit.issues.updateComment({
                        owner: this.githubObj.context.repo.owner,
                        repo: this.githubObj.context.repo.repo,
                        body: "placeholder markdown update",
                        comment_id: existingComment.id,
                    }),
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(message: string): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        throw message;
    }

    private isSupported(): boolean {
        return this.githubObj.context.eventName === 'pull_request';
    }

    private async findComment(pullRequestNumber: number): Promise<ListCommentsResponseItem> {
        const commentsResponse = await this.invoke(
            async () =>
                await this.octokit.issues.listComments({
                    issue_number: pullRequestNumber,
                    owner: this.githubObj.context.repo.owner,
                    repo: this.githubObj.context.repo.repo,
                }),
        );

        const comments = commentsResponse.data;

        return comments.find(
            (c) => !isEmpty(c.body) && !isEmpty(c.user) && c.user.login === 'github-actions[bot]' && c.body.includes(productTitle()),
        );
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }
}
