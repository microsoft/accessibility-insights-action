// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { inject, injectable } from 'inversify';
import { isNil } from 'lodash';
import {
    Logger,
    ProgressReporter,
    ReportMarkdownConvertor,
    checkRunDetailsTitle,
    checkRunName,
} from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { GitHubIocTypes } from '../ioc/gh-ioc-types';

// Pulling these types from RestEndpointMethodTypes would be better, but we can't do so until
// https://github.com/octokit/rest.js/issues/2000 is resolved. The better versions would be:
//
// type UpdateCheckOutputParameter = RestEndpointMethodTypes['checks']['update']['parameters']['output'];
// type CreateCheckResponseData = RestEndpointMethodTypes['checks']['create']['response']['data'];
//
// In the meantime, we have these temporary types (these are not complete type descriptions of the GitHub
// APIs, just the subsets we use).
type CreateCheckResponseData = {
    id: number;
};

type UpdateCheckOutputParameter = {
    title?: string;
    summary: string;
    text?: string;
};

@injectable()
export class CheckRunCreator extends ProgressReporter {
    private a11yCheck: CreateCheckResponseData;

    constructor(
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(GitHubIocTypes.Github) private readonly githubObj: typeof github,
        @inject(Logger) private readonly logger: Logger,
        @inject(DisclaimerTextGenerator) private readonly disclaimerTextGenerator: DisclaimerTextGenerator,
    ) {
        super();
    }

    public async start(): Promise<void> {
        this.logMessage('Creating check run with status as in progress');
        const response = await this.invoke(
            async () =>
                await this.octokit.checks.create({
                    owner: this.githubObj.context.repo.owner,
                    repo: this.githubObj.context.repo.repo,
                    name: checkRunName,
                    status: 'in_progress',
                    head_sha: isNil(this.githubObj.context.payload.pull_request)
                        ? this.githubObj.context.sha
                        : (this.githubObj.context.payload.pull_request.head as { sha: string }).sha,
                }),
        );

        this.a11yCheck = response?.data;
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        this.logMessage('Updating check run with status as completed');
        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult);
        this.traceMarkdown(reportMarkdown);

        await this.invoke(
            async () =>
                await this.octokit.checks.update({
                    owner: this.githubObj.context.repo.owner,
                    repo: this.githubObj.context.repo.repo,
                    check_run_id: this.a11yCheck.id,
                    name: checkRunName,
                    status: 'completed',
                    conclusion: combinedReportResult.results.urlResults.failedUrls > 0 ? 'failure' : 'success',
                    output: this.getScanOutput(reportMarkdown),
                }),
        );
    }

    public async failRun(): Promise<void> {
        this.logMessage('Updating check run with status as failed');
        const reportMarkdown = this.reportMarkdownConvertor.getErrorMarkdown();
        this.traceMarkdown(reportMarkdown);

        await this.invoke(
            async () =>
                await this.octokit.checks.update({
                    owner: this.githubObj.context.repo.owner,
                    repo: this.githubObj.context.repo.repo,
                    check_run_id: this.a11yCheck.id,
                    name: checkRunName,
                    status: 'completed',
                    conclusion: 'failure',
                    output: {
                        title: checkRunDetailsTitle,
                        summary: this.disclaimerTextGenerator.generateDisclaimerText(),
                        annotations: [],
                        text: reportMarkdown,
                    },
                }),
        );
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }

    private getScanOutput(text: string): UpdateCheckOutputParameter {
        return {
            title: checkRunDetailsTitle,
            summary: this.disclaimerTextGenerator.generateDisclaimerText(),
            text,
        };
    }
}
