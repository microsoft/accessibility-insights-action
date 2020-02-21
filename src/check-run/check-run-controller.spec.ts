// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { stripIndent } from 'common-tags';
import * as table from 'markdown-table';
import { IMock, Mock, Times } from 'typemoq';
import * as util from 'util';

import { Logger } from '../logger/logger';
import { AxeScanResults } from '../scanner/axe-scan-results';
import { TaskConfig } from '../task-config';
import { CheckRunController } from './check-run-controller';

// tslint:disable: no-unsafe-any no-null-keyword no-object-literal-type-assertion
type CreateCheckParams = Octokit.RequestOptions & Octokit.ChecksCreateParams;
type UpdateCheckParams = Octokit.RequestOptions & Octokit.ChecksUpdateParams;
type ListArtifactsParams = Octokit.RequestOptions & Octokit.ActionsListWorkflowRunArtifactsParams;
type CreateCheck = (params: CreateCheckParams) => Promise<Octokit.Response<Octokit.ChecksCreateResponse>>;
type UpdateCheck = (params: UpdateCheckParams) => Promise<Octokit.Response<Octokit.ChecksUpdateResponse>>;
type ListArtifacts = (params: ListArtifactsParams) => Promise<Octokit.Response<Octokit.ActionsListWorkflowRunArtifactsResponse>>;

describe(CheckRunController, () => {
    let loggerMock: IMock<Logger>;
    let taskConfigMock: IMock<TaskConfig>;
    let octokitStub: Octokit;
    let createCheckMock: IMock<CreateCheck>;
    let updateCheckMock: IMock<UpdateCheck>;
    let listWorkflowRunArtifactsMock: IMock<ListArtifacts>;
    let checkRunController: CheckRunController;
    let githubStub: typeof github;
    let checkStub: Octokit.ChecksCreateResponse;
    const owner = 'owner';
    const repo = 'repo';
    const sha = 'sha';
    const runId = 1;
    const a11yCheckName = 'Accessibility Checks';
    const a11yReportTitle = 'Accessibility Checks Report';

    beforeEach(() => {
        loggerMock = Mock.ofType(Logger);
        taskConfigMock = Mock.ofType(TaskConfig);
        createCheckMock = Mock.ofInstance(() => {
            return null;
        });
        updateCheckMock = Mock.ofInstance(() => {
            return null;
        });
        listWorkflowRunArtifactsMock = Mock.ofInstance(() => {
            return null;
        });
        octokitStub = {
            checks: {
                create: createCheckMock.object,
                update: updateCheckMock.object,
            },
            actions: {
                listWorkflowRunArtifacts: listWorkflowRunArtifactsMock.object,
            },
        } as any;
        githubStub = {
            context: {
                repo: {
                    owner,
                    repo,
                },
                sha,
            },
        } as typeof github;
        checkStub = {
            id: 1234,
        } as Octokit.ChecksCreateResponse;
        checkRunController = new CheckRunController(taskConfigMock.object, loggerMock.object, octokitStub, githubStub);
    });

    it('should create instance', () => {
        expect(checkRunController).not.toBeNull();
    });

    it('createRun', async () => {
        setupMocksForCreateCheck();

        const res = await checkRunController.createRun();

        expect(res).toBe(checkStub);
        verifyMocks();
    });

    it('failRun', async () => {
        const message = 'something went wrong';
        const expectedParam: UpdateCheckParams = {
            owner: owner,
            repo: repo,
            name: a11yCheckName,
            check_run_id: checkStub.id,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: a11yReportTitle,
                summary: `Unable to scan`,
                annotations: [],
                text: stripIndent`
                ${message}`,
            },
        };

        setupMocksForCreateCheck();

        updateCheckMock.setup(um => um(expectedParam)).verifiable(Times.once());

        await checkRunController.createRun();
        await checkRunController.failRun(message);

        verifyMocks();
    });

    it('completeRun', async () => {
        const artifacts: Octokit.ActionsListWorkflowRunArtifactsResponse = {
            artifacts: [],
            total_count: 0,
        };
        const axeScanResults: AxeScanResults = {
            results: {
                violations: [
                    {
                        id: 'color-contrast',
                        nodes: [{ html: 'html' }],
                    },
                ],
            },
        } as AxeScanResults;
        const expectedListParam: ListArtifactsParams = {
            owner: owner,
            repo: repo,
            run_id: runId,
        };
        const expectedUpdateParam: UpdateCheckParams = {
            owner: owner,
            repo: repo,
            check_run_id: checkStub.id,
            name: a11yCheckName,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: a11yReportTitle,
                summary: `Scan completed with failed rules count - 1`,
                annotations: [
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

${table([
    ['Rule', 'Count'],
    ['color-contrast', '1'],
])}

                `,
            },
        };
        setupMocksForCreateCheck();
        taskConfigMock
            .setup(tcm => tcm.getRunId())
            .returns(() => runId)
            .verifiable(Times.once());
        listWorkflowRunArtifactsMock
            .setup(lm => lm(expectedListParam))
            .returns(async () => {
                return Promise.resolve({ data: artifacts } as any);
            })
            .verifiable(Times.once());
        loggerMock.setup(lm => lm.logInfo(`Fetch artifacts - ${util.inspect(artifacts)}`)).verifiable(Times.once());
        updateCheckMock.setup(um => um(expectedUpdateParam)).verifiable(Times.once());

        const res = await checkRunController.createRun();
        await checkRunController.completeRun(axeScanResults);

        expect(res).toBe(checkStub);
        verifyMocks();
    });

    function setupMocksForCreateCheck(): void {
        const expectedParam: CreateCheckParams = {
            owner: owner,
            repo: repo,
            name: a11yCheckName,
            status: 'in_progress',
            head_sha: sha,
        };
        const response: Octokit.Response<Octokit.ChecksCreateResponse> = { data: checkStub } as any;

        createCheckMock
            .setup(cm => cm(expectedParam))
            .returns(async () => {
                return Promise.resolve(response);
            })
            .verifiable(Times.once());
    }

    function verifyMocks(): void {
        taskConfigMock.verifyAll();
        createCheckMock.verifyAll();
        updateCheckMock.verifyAll();
        listWorkflowRunArtifactsMock.verifyAll();
        loggerMock.verifyAll();
    }
});
