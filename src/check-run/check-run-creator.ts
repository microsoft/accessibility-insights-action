// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { stripIndent } from 'common-tags';
import { inject, injectable } from 'inversify';
import * as util from 'util';

import { Logger } from '../logger/logger';
import { AxeScanResults } from '../scanner/axe-scan-results';
import { TaskConfig } from '../task-config';

@injectable()
export class CheckRunCreator {
    private check: Octokit.Response<Octokit.ChecksCreateResponse>;

    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(Octokit) private readonly octokit: Octokit,
        @inject(Logger) private readonly logger: Logger,
    ) {}

    public async createRun(): Promise<void> {
        this.check = await this.octokit.checks.create({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            name: 'Accessibility Checks',
            status: 'in_progress',
            head_sha: github.context.sha,
            external_id: `${this.taskConfig.getRunId()}`,
        });
    }

    public async completeRun(axeScanResults: AxeScanResults): Promise<void> {
        const response = await this.octokit.actions.listWorkflowRunArtifacts({
            run_id: this.taskConfig.getRunId(),
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });

        const artifacts = response.data;
        this.logger.logInfo(`Fetch artifacts - ${util.inspect(artifacts)}`);
        
        this.octokit.checks.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            check_run_id: this.check.data.id,
            name: 'Accessibility Checks',
            status: 'completed',
            conclusion: axeScanResults.results.violations.length == 0 ? 'success' : 'failure',
            output: {
                title: 'Accessibility Checks Report',
                summary: `Scan completed with failed rules count - ${axeScanResults.results.violations.length}`,
                annotations: [
                    // {
                    //     title: 'sample annotation without path - warn',
                    //     message: 'fix1',
                    //     annotation_level: 'warning',
                    //     end_line: 0,
                    //     path: '',
                    //     start_line: 0,
                    // },
                    {
                        title: 'sample annotation with some unknown path - error',
                        message: 'fix2',
                        annotation_level: 'failure',
                        end_line: 12,
                        path: '/sample/path',
                        start_line: 1,
                    },
                ],
                text: stripIndent`
                    ARTIFACTS:
                    ${util.inspect(artifacts)}   
                   
                    FAILED RULES:
                   
                    ${this.printRuleCount(axeScanResults, 16)}
                   
                `,
            },
        });
    }

    public async failRun(message: string): Promise<void> {
        this.octokit.checks.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            check_run_id: this.check.data.id,
            name: 'Accessibility Checks',
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: 'Accessibility Checks Report',
                summary: `Unable to scan`,
                annotations: [],
                text: stripIndent`
                ${message}`,
            },
        });
    }
    private printRuleCount(axeScanResults: AxeScanResults, totalSpace: number) {
        let tableContent: string[][] = [['Rule', 'Count']];

        const violations = axeScanResults.results.violations;
        for (var i = 0; i < violations.length; i++) {
            const row: string[] = [violations[i].id, violations[i].nodes.length.toString()];
            tableContent.push(row);
        }

        return (tableContent);
    }
}
