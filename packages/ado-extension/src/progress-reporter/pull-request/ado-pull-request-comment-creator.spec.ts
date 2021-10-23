// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as nodeApi from 'azure-devops-node-api';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import {
    AdoPullRequestCommentCreator as ADOPullRequestCommentCreator,
    AdoPullRequestCommentCreator,
} from './ado-pull-request-comment-creator';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { BaselineEvaluation, BaselineFileContent } from '@accessibility-insights-action/shared/dist/baseline-types';
import { BaselineInfo } from '@accessibility-insights-action/shared/dist/baseline-info';
import { ADOArtifactsInfoProvider } from '../../task-config/ado-artifacts-info-provider';

describe(ADOPullRequestCommentCreator, () => {
    let adoTaskMock: IMock<typeof adoTask>;
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let gitApiMock: IMock<GitApi.IGitApi>;
    let loggerMock: IMock<Logger>;
    let nodeApiMock: IMock<typeof nodeApi>;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let webApiMock: IMock<nodeApi.WebApi>;
    let artifactsInfoProviderMock: IMock<ADOArtifactsInfoProvider>;
    let prCommentCreator: ADOPullRequestCommentCreator;

    const handlerStub = {
        prepareRequest: () => {
            return;
        },
        canHandleAuthentication: () => false,
        handleAuthentication: () => Promise.reject(),
    };

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
            setupIsSupportedReturnsTrue();
            setupInitializeWithTokenServiceConnection();
            setupInitializeMissingVariable();

            expect(() => buildPrCommentCreatorWithMocks()).toThrow('Unable to find System.TeamFoundationCollectionUri');

            verifyAllMocks();
        });

        it('should not initialize if serviceConnection uses unsupported auth', () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithUnsupportedServiceConnection();

            expect(() => buildPrCommentCreatorWithMocks()).toThrow('Unsupported auth scheme. Please use token or basic auth.');

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnection uses basic auth', () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithBasicServiceConnection();
            setupInitializeSetConnection(webApiMock.object);

            prCommentCreator = buildPrCommentCreatorWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnection uses token auth', () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithTokenServiceConnection();
            setupInitializeSetConnection(webApiMock.object);

            prCommentCreator = buildPrCommentCreatorWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnectionName is not set', () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);

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

        const reportMd = '#markdown';
        const prId = 11; // arbitrary number
        const repoId = 'repo-id';
        const reportStub: CombinedReportParameters = {
            results: {
                urlResults: {
                    failedUrls: 1,
                },
            },
        } as CombinedReportParameters;
        const threadId = 9; // arbitrary number
        const commentId = 7; // arbitrary number
        const contentWithMatchingString =
            AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE +
            '![Accessibility Insights](https://accessibilityinsights.io/img/a11yinsights-blue.svg) Accessibility Insights Action: A comment from Accessibility Insights';
        const expectedComment = {
            parentCommentId: 0,
            content: ADOPullRequestCommentCreator.CURRENT_COMMENT_TITLE + reportMd,
            commentType: GitInterfaces.CommentType.Text,
        };

        const commentWithIdWithoutMatch = {
            parentCommentId: 0,
            content: 'Not accessibility insights related',
            commentType: GitInterfaces.CommentType.Text,
            id: commentId,
        };
        const commentWithoutIdWithMatch = {
            parentCommentId: 0,
            content: contentWithMatchingString,
            commentType: GitInterfaces.CommentType.Text,
        };
        const commentWithIdWithMatch = {
            parentCommentId: 0,
            content: contentWithMatchingString,
            commentType: GitInterfaces.CommentType.Text,
            id: commentId,
        };
        const prevCommentWithIdWithMatch = {
            parentCommentId: commentId,
            content: contentWithMatchingString.replace(
                AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE,
                AdoPullRequestCommentCreator.PREVIOUS_COMMENT_TITLE,
            ),
            commentType: GitInterfaces.CommentType.Text,
            id: commentId + 1,
        };
        const makeThreadWithoutId = (comments: GitInterfaces.Comment[]) => {
            return {
                comments: comments,
            };
        };
        const makeThreadWithId = (comments: GitInterfaces.Comment[]) => {
            return {
                comments: comments,
                id: threadId,
            };
        };

        it.each`
            thread                                              | condition
            ${makeThreadWithId([commentWithIdWithoutMatch])}    | ${`no matching comment found`}
            ${makeThreadWithoutId([commentWithoutIdWithMatch])} | ${`matching comment missing id`}
            ${makeThreadWithoutId([commentWithIdWithMatch])}    | ${`matching thread missing id`}
        `(`should create new thread if $condition`, async ({ thread }) => {
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [thread as GitInterfaces.GitPullRequestCommentThread];
            const newThread = {
                comments: [expectedComment],
                status: GitInterfaces.CommentThreadStatus.Active,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            loggerMock.setup((o) => o.logInfo(`Didn't find an existing thread, making a new thread`)).verifiable(Times.once());
            gitApiMock.setup((o) => o.createThread(newThread, repoId, prId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterDoesNotExist();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            prCommentCreator = buildPrCommentCreatorWithMocks();

            await prCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });

        it('should comment on an existing thread if one exists, no previous runs', async () => {
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [makeThreadWithId([commentWithIdWithMatch])];
            const newComment = {
                parentCommentId: 0,
                content: commentWithIdWithMatch.content?.replace('Results from Current Run', 'Results from Previous Run'),
                commentType: GitInterfaces.CommentType.Text,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            loggerMock.setup((o) => o.logInfo('Already found a thread from us, no previous runs')).verifiable(Times.once());

            gitApiMock.setup((o) => o.updateComment(expectedComment, repoId, prId, threadId, commentId)).verifiable(Times.once());
            gitApiMock.setup((o) => o.createComment(newComment, repoId, prId, threadId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(true);
            setupBaselineFileParameterDoesNotExist();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            prCommentCreator = buildPrCommentCreatorWithMocks();

            await expect(prCommentCreator.completeRun(reportStub)).rejects.toThrowError('Failed Accessibility Error');

            verifyAllMocks();
        });

        it('should comment on an existing thread if one exists, previous runs', async () => {
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [
                makeThreadWithId([commentWithIdWithMatch, prevCommentWithIdWithMatch]),
            ];

            const newPrevComment = {
                parentCommentId: prevCommentWithIdWithMatch.parentCommentId,
                content: commentWithIdWithMatch.content?.replace('Results from Current Run', 'Results from Previous Run'),
                commentType: GitInterfaces.CommentType.Text,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            loggerMock.setup((o) => o.logInfo('Already found a thread from us, found previous runs')).verifiable(Times.once());

            gitApiMock.setup((o) => o.updateComment(newPrevComment, repoId, prId, threadId, commentId + 1)).verifiable(Times.once());
            gitApiMock.setup((o) => o.updateComment(expectedComment, repoId, prId, threadId, commentId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(true);
            setupBaselineFileParameterDoesNotExist();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            prCommentCreator = buildPrCommentCreatorWithMocks();

            await expect(prCommentCreator.completeRun(reportStub)).rejects.toThrowError('Failed Accessibility Error');

            verifyAllMocks();
        });

        it('should throw error if baseline needs to be updated', async () => {
            const threadsStub: GitInterfaces.GitPullRequestCommentThread[] = [commentWithIdWithoutMatch];
            const newThread = {
                comments: [expectedComment],
                status: GitInterfaces.CommentThreadStatus.Active,
            };

            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;
            const baselineInfo: BaselineInfo = {
                baselineFileName: 'baseline-file',
                baselineEvaluation: baselineEvaluationStub,
            };

            setupReturnPrThread(repoId, prId, reportStub, reportMd, threadsStub);
            reportMarkdownConvertorMock.reset();
            reportMarkdownConvertorMock
                .setup((o) => o.convert(reportStub, ADOPullRequestCommentCreator.CURRENT_COMMENT_TITLE, baselineInfo))
                .returns(() => ADOPullRequestCommentCreator.CURRENT_COMMENT_TITLE + reportMd)
                .verifiable(Times.once());
            loggerMock.setup((o) => o.logInfo(`Didn't find an existing thread, making a new thread`)).verifiable(Times.once());
            gitApiMock.setup((o) => o.createThread(newThread, repoId, prId)).verifiable(Times.once());
            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);

            prCommentCreator = buildPrCommentCreatorWithMocks();

            await expect(prCommentCreator.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
                'Failed: The baseline file needs to be updated. See the PR comments for more details.',
            );

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('do nothing if isSupported returns false', async () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            setupIsSupportedReturnsFalse();

            prCommentCreator = buildPrCommentCreatorWithMocks();
            await prCommentCreator.failRun('message');

            verifyAllMocks();
        });

        it('reject promise with matching error', async () => {
            setupIsSupportedReturnsTrue();
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            setupIsSupportedReturnsTrue();

            prCommentCreator = buildPrCommentCreatorWithMocks();

            await expect(prCommentCreator.failRun('message')).rejects.toMatch('message');
            verifyAllMocks();
        });
    });

    const buildPrCommentCreatorWithMocks = () =>
        new ADOPullRequestCommentCreator(
            adoTaskConfigMock.object,
            artifactsInfoProviderMock.object,
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

    const setupFailOnAccessibilityError = (fail: boolean) => {
        adoTaskConfigMock
            .setup((o) => o.getFailOnAccessibilityError())
            .returns(() => fail)
            .verifiable(Times.atLeastOnce());
    };

    const setupBaselineFileParameterExists = () => {
        adoTaskConfigMock
            .setup((o) => o.getBaselineFile())
            .returns(() => 'baseline-file')
            .verifiable(Times.atLeastOnce());
    };

    const setupBaselineFileParameterDoesNotExist = () => {
        adoTaskConfigMock
            .setup((o) => o.getBaselineFile())
            .returns(() => undefined)
            .verifiable(Times.atLeastOnce());
    };

    const setupIsSupportedReturnsFalse = () => {
        adoTaskMock
            .setup((o) => o.getVariable('Build.Reason'))
            .returns(() => 'CI')
            .verifiable(Times.atLeastOnce());
    };

    const setupInitializeWithoutServiceConnectionName = () => {
        const apitoken = 'token';

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => '')
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false))
            .returns(() => apitoken)
            .verifiable(Times.once());
        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithTokenServiceConnection = () => {
        const apitoken = 'token';

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
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => 'Token')
            .verifiable(Times.once());
        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithBasicServiceConnection = () => {
        const serviceConnection = 'service-connection',
            //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="Fake creds")]
            username = 'user',
            //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="Fake creds")]
            password = 'secret';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {
                username,
                password,
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
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => 'UsernamePassword')
            .verifiable(Times.once());

        nodeApiMock
            .setup((o) => o.getBasicHandler(username, password))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithUnsupportedServiceConnection = () => {
        const serviceConnection = 'service-connection';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {},
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
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => undefined)
            .verifiable(Times.once());
    };

    const setupInitializeSetConnection = (connection: nodeApi.WebApi) => {
        const url = 'url';

        adoTaskMock
            .setup((o) => o.getVariable('System.TeamFoundationCollectionUri'))
            .returns(() => url)
            .verifiable(Times.atLeastOnce());
        nodeApiMock
            .setup((o) => new o.WebApi(url, handlerStub))
            .returns(() => connection)
            .verifiable(Times.once());
    };

    const setupInitializeMissingVariable = () => {
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
        const baselineInfoStub = {};
        reportMarkdownConvertorMock
            .setup((o) => o.convert(reportStub, ADOPullRequestCommentCreator.CURRENT_COMMENT_TITLE, baselineInfoStub))
            .returns(() => ADOPullRequestCommentCreator.CURRENT_COMMENT_TITLE + reportMd)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getVariable('System.PullRequest.PullRequestId'))
            .returns(() => prId.toString())
            .verifiable(Times.atLeastOnce());
        adoTaskMock
            .setup((o) => o.getVariable('Build.Repository.ID'))
            .returns(() => repoId)
            .verifiable(Times.atLeastOnce());
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
