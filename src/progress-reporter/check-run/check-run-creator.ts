// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';

import { isNil } from 'lodash';
import { disclaimerText } from '../../content/mark-down-strings';
import { checkRunDetailsTitle, checkRunName } from '../../content/strings';
import { iocTypes } from '../../ioc/ioc-types';
import { Logger } from '../../logger/logger';
import { AxeMarkdownConvertor } from '../../mark-down/axe-markdown-convertor';
import { ProgressReporter } from '../progress-reporter';

type UpdateCheckOutputParameter = RestEndpointMethodTypes['checks']['update']['parameters']['output'];
type CreateCheckResponseData = RestEndpointMethodTypes['checks']['create']['response']['data'];

@injectable()
export class CheckRunCreator implements ProgressReporter {
    private a11yCheck: CreateCheckResponseData;

    constructor(
        @inject(AxeMarkdownConvertor) private readonly axeMarkdownConvertor: AxeMarkdownConvertor,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(iocTypes.Github) private readonly githubObj: typeof github,
        @inject(Logger) private readonly logger: Logger,
    ) {}

    public async start(): Promise<void> {
        this.logMessage('Creating check run with status as in_progress');
        this.a11yCheck = (
            await this.octokit.checks.create({
                owner: this.githubObj.context.repo.owner,
                repo: this.githubObj.context.repo.repo,
                name: checkRunName,
                status: 'in_progress',
                head_sha: isNil(this.githubObj.context.payload.pull_request)
                    ? this.githubObj.context.sha
                    : // tslint:disable-next-line: no-unsafe-any
                      this.githubObj.context.payload.pull_request.head.sha,
            })
        ).data;
    }

    public async completeRun(axeScanResults: AxeScanResults): Promise<void> {
        this.logMessage('Updating check run with status as completed');
        await this.octokit.checks.update({
            owner: this.githubObj.context.repo.owner,
            repo: this.githubObj.context.repo.repo,
            check_run_id: this.a11yCheck.id,
            name: checkRunName,
            status: 'completed',
            conclusion: axeScanResults.results.violations.length === 0 ? 'success' : 'failure',
            output: this.getScanOutput(axeScanResults),
        });
    }

    public async failRun(message: string): Promise<void> {
        this.logMessage('Updating check run with status as failed');
        await this.octokit.checks.update({
            owner: this.githubObj.context.repo.owner,
            repo: this.githubObj.context.repo.repo,
            check_run_id: this.a11yCheck.id,
            name: checkRunName,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: checkRunDetailsTitle,
                summary: disclaimerText,
                annotations: [],
                text: this.axeMarkdownConvertor.getErrorMarkdown(),
            },
        });
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`[CheckRunCreator] ${message}`);
    }

    private getScanOutput(axeScanResults: AxeScanResults): UpdateCheckOutputParameter {
        return {
            title: checkRunDetailsTitle,
            summary: disclaimerText,
            text: this.axeMarkdownConvertor.convert(axeScanResults),
        };
    }
}
