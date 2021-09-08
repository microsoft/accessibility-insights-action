// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as nodeApi from 'azure-devops-node-api';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { AdoPullRequestCommentCreator as ADOPullRequestCommentCreator } from './ado-pull-request-comment-creator';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';

describe(ADOTaskConfig, () => {
    let adoTaskMock: IMock<typeof adoTask>;
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let gitApiMock: IMock<GitApi.IGitApi>;
    let loggerMock: IMock<Logger>;
    let nodeApiMock: IMock<typeof nodeApi>;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let webApiMock: IMock<nodeApi.WebApi>;
    let prCommentCreator: ADOPullRequestCommentCreator;

    beforeEach(() => {
        adoTaskMock = Mock.ofType<typeof adoTask>(undefined, MockBehavior.Strict);
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        gitApiMock = Mock.ofType<GitApi.IGitApi>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
        nodeApiMock = Mock.ofType<typeof nodeApi>(undefined, MockBehavior.Strict);
        webApiMock = Mock.ofType<nodeApi.WebApi>(undefined, MockBehavior.Strict);
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('should not initialize if isSupported returns false', () => {
            setupIsSupportedReturnsFalse();

            prCommentCreator = buildPrCommentCreatorWithMocks();

            verifyAllMocks();
        });

        it('should not initialize if missing required variable', () => {
            const apitoken = 'token';
            setupIsSupportedReturnsTrue();
            setupInitializeWithServiceConnectionName(apitoken);
            setupInitializeMissingVariable(apitoken);

            expect(() => buildPrCommentCreatorWithMocks()).toThrow('Unable to find System.TeamFoundationCollectionUri');

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnectionName is set', () => {
            const apitoken = 'token';
            setupIsSupportedReturnsTrue();
            setupInitializeWithServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);

            prCommentCreator = buildPrCommentCreatorWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnectionName is not set', () => {
            const apitoken = 'token';
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);

            prCommentCreator = buildPrCommentCreatorWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('should do nothing if isSupported returns false', async () => {
            const reportStub: CombinedReportParameters = {} as CombinedReportParameters;

            setupIsSupportedReturnsFalse();

            prCommentCreator = buildPrCommentCreatorWithMocks();
            await prCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });

        it('should create a new thread if none exists', async () => {
            const apitoken = 'token';
            const reportMd = '#markdown';
            const prId = 11; // arbitrary number
            const repoId = 'repo-id';
            const reportStub: CombinedReportParameters = {} as CombinedReportParameters;
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [];
            const newThread = {
                comments: [
                    {
                        parentCommentId: 0,
                        content: reportMd,
                        commentType: GitInterfaces.CommentType.Text,
                    },
                ],
                status: GitInterfaces.CommentThreadStatus.Active,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            loggerMock.setup((o) => o.logInfo(`Didn't find an existing thread, making a new thread`)).verifiable(Times.once());
            gitApiMock.setup((o) => o.createThread(newThread, repoId, prId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);
            prCommentCreator = buildPrCommentCreatorWithMocks();

            await prCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });

        it('should comment on an existing thread if one exists', async () => {
            const apitoken = 'token';
            const reportMd = '#markdown';
            const prId = 11; // arbitrary number
            const threadId = 9; // arbitrary number
            const repoId = 'repo-id';
            const reportStub: CombinedReportParameters = {} as CombinedReportParameters;
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [
                {
                    comments: [
                        {
                            content: 'A comment from Accessibility Insights',
                        },
                    ],
                    id: threadId,
                },
            ];
            const newComment = {
                parentCommentId: 0,
                content: 'Ran again',
                commentType: GitInterfaces.CommentType.Text,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            loggerMock.setup((o) => o.logInfo('Already found a thread from us')).verifiable(Times.once());

            gitApiMock.setup((o) => o.createComment(newComment, repoId, prId, threadId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);
            prCommentCreator = buildPrCommentCreatorWithMocks();

            await prCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('do nothing if isSupported returns false', async () => {
            const apitoken = 'token';
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);
            setupIsSupportedReturnsFalse();

            prCommentCreator = buildPrCommentCreatorWithMocks();
            await prCommentCreator.failRun('message');

            verifyAllMocks();
        });

        it('reject promise with matching error', async () => {
            const apitoken = 'token';
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName(apitoken);
            setupInitializeSetConnection(apitoken, webApiMock.object);
            setupIsSupportedReturnsTrue();

            prCommentCreator = buildPrCommentCreatorWithMocks();

            await expect(prCommentCreator.failRun('message')).rejects.toMatch('message');
            verifyAllMocks();
        });
    });

    const buildPrCommentCreatorWithMocks = () =>
        new ADOPullRequestCommentCreator(
            adoTaskConfigMock.object,
            reportMarkdownConvertorMock.object,
            loggerMock.object,
            adoTaskMock.object,
            nodeApiMock.object,
        );

    const verifyAllMocks = () => {
        adoTaskMock.verifyAll();
        adoTaskConfigMock.verifyAll();
        loggerMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        webApiMock.verifyAll();
    };

    const setupIsSupportedReturnsTrue = () => {
        adoTaskMock
            .setup((o) => o.getVariable('Build.Reason'))
            .returns(() => 'PullRequest')
            .verifiable(Times.atLeastOnce());
    };

    const setupIsSupportedReturnsFalse = () => {
        adoTaskMock
            .setup((o) => o.getVariable('Build.Reason'))
            .returns(() => 'CI')
            .verifiable(Times.atLeastOnce());
    };

    const setupInitializeWithoutServiceConnectionName = (apitoken: string) => {
        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => '')
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false))
            .returns(() => apitoken)
            .verifiable(Times.once());
    };

    const setupInitializeWithServiceConnectionName = (apitoken: string) => {
        const serviceConnection = 'service-connection';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {
                apitoken,
            },
            scheme: '',
        };

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => serviceConnection)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorization(serviceConnection, false))
            .returns(() => endpointAuthorizationStub)
            .verifiable(Times.once());
    };

    const setupInitializeSetConnection = (apitoken: string, connection: nodeApi.WebApi) => {
        const url = 'url';
        const handlerStub = {
            prepareRequest: () => {
                return;
            },
            canHandleAuthentication: () => false,
            handleAuthentication: () => Promise.reject(),
        };

        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getVariable('System.TeamFoundationCollectionUri'))
            .returns(() => url)
            .verifiable(Times.once());
        nodeApiMock
            .setup((o) => new o.WebApi(url, handlerStub))
            .returns(() => connection)
            .verifiable(Times.once());
    };

    const setupInitializeMissingVariable = (apitoken: string) => {
        const handlerStub = {
            prepareRequest: () => {
                return;
            },
            canHandleAuthentication: () => false,
            handleAuthentication: () => Promise.reject(),
        };

        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getVariable('System.TeamFoundationCollectionUri'))
            .returns(() => undefined)
            .verifiable(Times.once());
    };

    const makeGitApiMockThenable = () => {
        // Configuration to allow returning mock from a promise
        // see https://github.com/florinn/typemoq#dynamic-mocks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        gitApiMock.setup((o: any) => o.then).returns(() => undefined);
    };

    const setupReturnPrThread = (
        repoId: string,
        prId: number,
        reportStub: CombinedReportParameters,
        reportMd: string,
        threadsStub: GitInterfaces.GitPullRequestCommentThread[],
    ) => {
        makeGitApiMockThenable();
        reportMarkdownConvertorMock
            .setup((o) => o.convert(reportStub))
            .returns(() => reportMd)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getVariable('System.PullRequest.PullRequestId'))
            .returns(() => prId.toString())
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getVariable('Build.Repository.ID'))
            .returns(() => repoId)
            .verifiable(Times.once());
        loggerMock.setup((o) => o.logInfo(`PR is ${prId}, repo is ${repoId}`)).verifiable(Times.once());

        webApiMock
            .setup((o) => o.getGitApi())
            .returns(() => Promise.resolve(gitApiMock.object))
            .verifiable(Times.once());
        gitApiMock
            .setup((o) => o.getThreads(repoId, prId))
            .returns(() => Promise.resolve(threadsStub))
            .verifiable(Times.once());
    };
});
