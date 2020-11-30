// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as github from '@actions/github';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { AxeScanResults } from 'accessibility-insights-scan';
import { stripIndent } from 'common-tags';
import { IMock, Mock, Times } from 'typemoq';

import { disclaimerText } from '../../content/mark-down-strings';
import { checkRunDetailsTitle } from '../../content/strings';
import { Logger } from '../../logger/logger';
import { AxeMarkdownConvertor } from '../../mark-down/axe-markdown-convertor';
import { CheckRunCreator } from './check-run-creator';

type CreateCheckParams = RestEndpointMethodTypes['checks']['create']['parameters'];
type CreateCheckResponse = RestEndpointMethodTypes['checks']['create']['response'];
type CreateCheck = (params: CreateCheckParams) => Promise<CreateCheckResponse>;

type UpdateCheckParams = RestEndpointMethodTypes['checks']['update']['parameters'];
type UpdateCheckResponse = RestEndpointMethodTypes['checks']['update']['response'];
type UpdateCheck = (params: UpdateCheckParams) => Promise<UpdateCheckResponse>;

describe(CheckRunCreator, () => {
    let octokitStub: Octokit;
    let createCheckMock: IMock<CreateCheck>;
    let updateCheckMock: IMock<UpdateCheck>;
    let checkRunCreator: CheckRunCreator;
    let githubStub: typeof github;
    let checkStub: CreateCheckResponse['data'];
    let convertorMock: IMock<AxeMarkdownConvertor>;
    let loggerMock: IMock<Logger>;
    let sha: string;

    const owner = 'owner';
    const repo = 'repo';
    const a11yCheckName = 'Accessibility Checks';

    beforeEach(() => {
        sha = 'sha';
        convertorMock = Mock.ofType(AxeMarkdownConvertor);
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
        } as Octokit;
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
        } as CreateCheckResponse['data'];

        checkRunCreator = new CheckRunCreator(convertorMock.object, octokitStub, githubStub, loggerMock.object);
    });

    it('should create instance', () => {
        expect(checkRunCreator).not.toBeNull();
    });

    it('createRun', async () => {
        setupMocksForCreateCheck();

        await checkRunCreator.start();

        verifyMocks();
    });

    it('createRun for pull request', async () => {
        sha = 'pull request sha';
        githubStub.context.payload.pull_request = {
            number: 1,
            head: {
                sha: sha,
            },
        };

        setupMocksForCreateCheck();

        await checkRunCreator.start();

        verifyMocks();
    });

    it('failRun', async () => {
        const stubErrorMarkdown = 'something went wrong';
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
                text: stubErrorMarkdown,
            },
        };

        setupMocksForCreateCheck();
        convertorMock
            .setup((cm) => cm.getErrorMarkdown())
            .returns(() => stubErrorMarkdown)
            .verifiable(Times.once());
        updateCheckMock.setup((um) => um(expectedParam)).verifiable(Times.once());

        await checkRunCreator.start();
        await checkRunCreator.failRun();

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
            .setup((cm) => cm.convert(axeScanResults))
            .returns(() => markdown)
            .verifiable(Times.once());
        updateCheckMock.setup((um) => um(expectedUpdateParam)).verifiable(Times.once());

        await checkRunCreator.start();
        await checkRunCreator.completeRun(axeScanResults);

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
            .setup((cm) => cm.convert(axeScanResults))
            .returns(() => markdown)
            .verifiable(Times.once());
        updateCheckMock.setup((um) => um(expectedUpdateParam)).verifiable(Times.once());

        await checkRunCreator.start();
        await checkRunCreator.completeRun(axeScanResults);

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
        const response = { data: checkStub } as CreateCheckResponse;

        createCheckMock
            .setup((cm) => cm(expectedParam))
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
