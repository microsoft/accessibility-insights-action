// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { stripIndent } from 'common-tags';
import { IMock, Mock, Times } from 'typemoq';

import { checkRunDetailsTitle, disclaimerText } from '../content/strings';
import { Logger } from '../logger/logger';
import { AxeMarkdownConvertor } from '../mark-down/axe-markdown-convertor';
import { PullRequestCommentCreator } from '../pull-request-comment-creator';
import { CheckRunCreator } from './check-run-creator';

// tslint:disable: no-unsafe-any no-null-keyword no-object-literal-type-assertion

type CreateCheckParams = Octokit.RequestOptions & Octokit.ChecksCreateParams;
type UpdateCheckParams = Octokit.RequestOptions & Octokit.ChecksUpdateParams;
type CreateCheck = (params: CreateCheckParams) => Promise<Octokit.Response<Octokit.ChecksCreateResponse>>;
type UpdateCheck = (params: UpdateCheckParams) => Promise<Octokit.Response<Octokit.ChecksUpdateResponse>>;

describe(CheckRunCreator, () => {
    let octokitStub: Octokit;
    let createCheckMock: IMock<CreateCheck>;
    let updateCheckMock: IMock<UpdateCheck>;
    let checkRunCreator: CheckRunCreator;
    let githubStub: typeof github;
    let checkStub: Octokit.ChecksCreateResponse;
    let convertorMock: IMock<AxeMarkdownConvertor>;
    let pullRequestCommentCreatorMock: IMock<PullRequestCommentCreator>;
    let loggerMock: IMock<Logger>;
    const owner = 'owner';
    const repo = 'repo';
    const sha = 'sha';
    const a11yCheckName = 'Accessibility Checks';

    beforeEach(() => {
        convertorMock = Mock.ofType(AxeMarkdownConvertor);
        pullRequestCommentCreatorMock = Mock.ofType(PullRequestCommentCreator);
        loggerMock = Mock.ofType(Logger);
        createCheckMock = Mock.ofInstance(() => {
            return null;
        });
        updateCheckMock = Mock.ofInstance(() => {
            return null;
        });

        octokitStub = {
            checks: {
                create: createCheckMock.object,
                update: updateCheckMock.object,
            },
        } as any;
        githubStub = {
            context: {
                repo: {
                    owner,
                    repo,
                },
                sha,
                payload: {},
            },
        } as typeof github;
        checkStub = {
            id: 1234,
        } as Octokit.ChecksCreateResponse;

        checkRunCreator = new CheckRunCreator(
            convertorMock.object,
            pullRequestCommentCreatorMock.object,
            octokitStub,
            githubStub,
            loggerMock.object,
        );
    });

    it('should create instance', () => {
        expect(checkRunCreator).not.toBeNull();
    });

    it('createRun', async () => {
        setupMocksForCreateCheck();

        const res = await checkRunCreator.createRun();

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
                title: checkRunDetailsTitle,
                summary: disclaimerText,
                annotations: [],
                text: stripIndent`
                ${message}`,
            },
        };

        setupMocksForCreateCheck();
        convertorMock
            .setup(cm => cm.getErrorMarkdown())
            .returns(() => message)
            .verifiable(Times.once());
        updateCheckMock.setup(um => um(expectedParam)).verifiable(Times.once());

        await checkRunCreator.createRun();
        await checkRunCreator.failRun(message);

        verifyMocks();
    });

    it('completeRun', async () => {
        const markdown = 'markdown';
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
        const expectedUpdateParam: UpdateCheckParams = getExpectedUpdateParam(markdown, axeScanResults);

        setupMocksForCreateCheck();
        convertorMock
            .setup(cm => cm.convert(axeScanResults))
            .returns(() => markdown)
            .verifiable(Times.once());
        updateCheckMock.setup(um => um(expectedUpdateParam)).verifiable(Times.once());

        const res = await checkRunCreator.createRun();
        await checkRunCreator.completeRun(axeScanResults);

        expect(res).toBe(checkStub);
        verifyMocks();
    });

    it('completeRun with no failed rules', async () => {
        const markdown = 'markdown';
        const axeScanResults: AxeScanResults = {
            results: {
                violations: [],
            },
        } as AxeScanResults;

        const expectedUpdateParam: UpdateCheckParams = getExpectedUpdateParam(markdown, axeScanResults);
        setupMocksForCreateCheck();
        convertorMock
            .setup(cm => cm.convert(axeScanResults))
            .returns(() => markdown)
            .verifiable(Times.once());
        updateCheckMock.setup(um => um(expectedUpdateParam)).verifiable(Times.once());

        const res = await checkRunCreator.createRun();
        await checkRunCreator.completeRun(axeScanResults);

        expect(res).toBe(checkStub);
        verifyMocks();
    });

    function getExpectedUpdateParam(markdown: string, axeScanResults: AxeScanResults): UpdateCheckParams {
        return {
            owner: owner,
            repo: repo,
            check_run_id: checkStub.id,
            name: a11yCheckName,
            status: 'completed',
            conclusion: axeScanResults.results.violations.length === 0 ? 'success' : 'failure',
            output: {
                title: checkRunDetailsTitle,
                summary: disclaimerText,
                text: markdown,
            },
        };
    }

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
        convertorMock.verifyAll();
        createCheckMock.verifyAll();
        updateCheckMock.verifyAll();
    }
});
