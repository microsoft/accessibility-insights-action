// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';

import { checkRunDetailsTitle, checkRunName, checkRunSummaryMd } from '../content/strings';
import { iocTypes } from '../ioc/ioc-types';
import { AxeMarkdownConvertor } from '../mark-down/axe-markdown-convertor';

@injectable()
export class CheckRunCreator {
    private a11yCheck: Octokit.ChecksCreateResponse;

    constructor(
        @inject(AxeMarkdownConvertor) private readonly axeMarkdownConvertor: AxeMarkdownConvertor,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(iocTypes.Github) private readonly githubObj: typeof github,
    ) {}

    public async createRun(): Promise<Octokit.ChecksCreateResponse> {
        this.a11yCheck = (
            await this.octokit.checks.create({
                owner: this.githubObj.context.repo.owner,
                repo: this.githubObj.context.repo.repo,
                name: checkRunName,
                status: 'in_progress',
                head_sha: this.githubObj.context.sha,
            })
        ).data;

        return this.a11yCheck;
    }

    public async completeRun(axeScanResults: AxeScanResults): Promise<void> {
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
        await this.octokit.checks.update({
            owner: this.githubObj.context.repo.owner,
            repo: this.githubObj.context.repo.repo,
            check_run_id: this.a11yCheck.id,
            name: checkRunName,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: checkRunDetailsTitle,
                summary: checkRunSummaryMd,
                annotations: [],
                text: this.axeMarkdownConvertor.getErrorMarkdown(),
            },
        });
    }

    private getScanOutput(axeScanResults: AxeScanResults): Octokit.ChecksUpdateParamsOutput {
        return {
            title: checkRunDetailsTitle,
            summary: checkRunSummaryMd,
            text: this.axeMarkdownConvertor.convert(axeScanResults),
        };
    }
}
