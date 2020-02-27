// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';

import { iocTypes } from './ioc/ioc-types';
import { AxeMarkdownConvertor } from './mark-down/axe-markdown-convertor';

@injectable()
export class PullRequestCommentCreator {
    constructor(
        @inject(AxeMarkdownConvertor) private readonly axeMarkdownConvertor: AxeMarkdownConvertor,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(iocTypes.Github) private readonly githubObj: typeof github,
    ) {}

    public async createComment(axeScanResults: AxeScanResults): Promise<void> {
        const pullRequest = this.githubObj.context.payload.pull_request;
        const params: Octokit.RequestOptions & Octokit.IssuesCreateCommentParams = {
            owner: this.githubObj.context.repo.owner,
            repo: this.githubObj.context.repo.repo,
            body: this.axeMarkdownConvertor.convert(axeScanResults),
            issue_number: pullRequest.number,
        };

        await this.octokit.issues.createComment(params);
    }
}
