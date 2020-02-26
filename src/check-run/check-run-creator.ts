// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { stripIndent } from 'common-tags';
import { inject, injectable } from 'inversify';

import { AxeMarkdownConvertor } from '../axe-markdown-convertor';
import { iocTypes } from '../ioc/ioc-types';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';

const A11Y_CHECK_NAME = 'Accessibility Checks';
const A11Y_REPORT_TITLE = 'Accessibility Checks Report';

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
                name: A11Y_CHECK_NAME,
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
            name: A11Y_CHECK_NAME,
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
            name: A11Y_CHECK_NAME,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: A11Y_REPORT_TITLE,
                summary: `Unable to scan`,
                annotations: [],
                text: this.axeMarkdownConvertor.getErrorMarkdown(),
            },
        });
    }

    private getScanOutput(axeScanResults: AxeScanResults): Octokit.ChecksUpdateParamsOutput {
        return {
            title: A11Y_REPORT_TITLE,
            summary: `Scan completed with failed rules count - ${axeScanResults.results.violations.length}`,
            text: this.axeMarkdownConvertor.convert(axeScanResults),
        };
    }
}
