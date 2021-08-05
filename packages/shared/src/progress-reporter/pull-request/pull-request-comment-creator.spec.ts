// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as github from '@actions/github';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { IMock, Mock, MockBehavior, Times } from 'typemoq';
import { Logger } from '../../logger/logger';
import { ReportMarkdownConvertor } from '../../mark-down/report-markdown-convertor';
import { productTitle } from '../../mark-down/markdown-formatter';
import { PullRequestCommentCreator } from './pull-request-comment-creator';
import { CombinedReportParameters } from 'accessibility-insights-report';

type CreateCommentParams = RestEndpointMethodTypes['issues']['createComment']['parameters'];
type CreateCommentResponse = RestEndpointMethodTypes['issues']['createComment']['response'];
type CreateComment = (params: CreateCommentParams) => Promise<CreateCommentResponse>;

type UpdateCommentParams = RestEndpointMethodTypes['issues']['updateComment']['parameters'];
type UpdateCommentResponse = RestEndpointMethodTypes['issues']['updateComment']['response'];
type UpdateComment = (params: UpdateCommentParams) => Promise<UpdateCommentResponse>;

type ListCommentsParams = RestEndpointMethodTypes['issues']['listComments']['parameters'];
type ListCommentsResponse = RestEndpointMethodTypes['issues']['listComments']['response'];
type ListComments = (params: ListCommentsParams) => Promise<ListCommentsResponse>;

type ListCommentsResponseItem = ListCommentsResponse['data'][0];

describe(PullRequestCommentCreator, () => {
    let testSubject: PullRequestCommentCreator;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let createCommentMock: IMock<CreateComment>;
    let updateCommentMock: IMock<UpdateComment>;
    let listCommentsMock: IMock<ListComments>;
    let loggerMock: IMock<Logger>;
    let octokitStub: Octokit;
    let githubStub: typeof github;

    const pullRequestNumber = 362;
    const repoName = 'test repo';
    const ownerName = 'test owner';
    const markdownContent = 'test markdown content';
    const combinedReportResult = { serviceName: 'combinedReportResult' } as CombinedReportParameters;

    beforeEach(() => {
        reportMarkdownConvertorMock = Mock.ofType(ReportMarkdownConvertor);
        createCommentMock = Mock.ofInstance(
            (() => {
                /* noop */
            }) as any,
            MockBehavior.Strict,
        );
        listCommentsMock = Mock.ofInstance(
            (() => {
                /* noop */
            }) as any,
            MockBehavior.Strict,
        );
        updateCommentMock = Mock.ofInstance(
            (() => {
                /* noop */
            }) as any,
            MockBehavior.Strict,
        );
        loggerMock = Mock.ofType(Logger);

        octokitStub = {
            issues: {
                createComment: createCommentMock.object,
                listComments: listCommentsMock.object,
                updateComment: updateCommentMock.object,
            },
        } as Octokit;

        githubStub = {
            context: {
                payload: {
                    pull_request: {
                        number: pullRequestNumber,
                    },
                },
                repo: {
                    owner: ownerName,
                    repo: repoName,
                },
                eventName: 'pull_request',
            },
        } as typeof github;

        reportMarkdownConvertorMock.setup((a) => a.convert(combinedReportResult)).returns(() => markdownContent);

        testSubject = new PullRequestCommentCreator(reportMarkdownConvertorMock.object, octokitStub, githubStub, loggerMock.object);
    });

    afterEach(() => {
        createCommentMock.verifyAll();
        listCommentsMock.verifyAll();
        updateCommentMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        loggerMock.verifyAll();
    });

    describe('start', () => {
        it('does nothing', async () => {
            await expect(testSubject.start()).resolves.toBeUndefined();
        });
    });

    describe('failRun', () => {
        it('throws error', async () => {
            const errorMessage = 'some error message';
            await expect(testSubject.failRun(errorMessage)).rejects.toBe(errorMessage);
        });

        it('does nothing if not supported', async () => {
            githubStub.context.eventName = 'push';
            const errorMessage = 'some error message';
            await testSubject.failRun(errorMessage);
        });
    });

    describe('completeRun', () => {
        it('does nothing if not supported', async () => {
            githubStub.context.eventName = 'push';
            await testSubject.completeRun(combinedReportResult);
        });

        test.each([
            {
                values: [] as ListCommentsResponseItem[],
            },
            {
                values: [
                    {
                        id: 12,
                        body: 'some content',
                    },
                    {
                        id: 13,
                        body: `existing action comment ${productTitle()} not created by github actions bot user`,
                        user: {
                            login: 'unknown user',
                        },
                    },
                    {
                        id: 14,
                        body: `existing action comment without user context ${productTitle()}`,
                    },
                ] as ListCommentsResponseItem[],
            },
        ])('creates new comment, when existing comments - %j', async (testCase) => {
            const response = {
                data: testCase.values,
                headers: undefined,
                status: undefined,
            } as ListCommentsResponse;

            listCommentsMock
                .setup((l) => l({ issue_number: pullRequestNumber, owner: ownerName, repo: repoName }))
                .returns(() => Promise.resolve(response))
                .verifiable(Times.once());

            createCommentMock
                .setup((c) =>
                    c({
                        owner: ownerName,
                        repo: repoName,
                        body: markdownContent,
                        issue_number: pullRequestNumber,
                    }),
                )
                .returns(() => Promise.resolve({} as CreateCommentResponse))
                .verifiable(Times.once());

            await testSubject.completeRun(combinedReportResult);
        });

        it('update existing comment', async () => {
            const existingActionComment = {
                id: 34,
                body: `existing action comment ${productTitle()} with previous data`,
                user: {
                    login: 'github-actions[bot]',
                },
            } as ListCommentsResponseItem;
            const allExistingComments = [
                {
                    id: 12,
                    body: `some content with Accessibility Insights Action text`,
                },
                existingActionComment,
                {
                    ...existingActionComment,
                    id: existingActionComment.id + 1,
                },
            ] as ListCommentsResponseItem[];
            const response = {
                data: allExistingComments,
                headers: undefined,
                status: undefined,
            } as ListCommentsResponse;

            listCommentsMock
                .setup((l) => l({ issue_number: pullRequestNumber, owner: ownerName, repo: repoName }))
                .returns(() => Promise.resolve(response))
                .verifiable(Times.once());

            updateCommentMock
                .setup((u) =>
                    u({
                        owner: ownerName,
                        repo: repoName,
                        body: markdownContent,
                        comment_id: existingActionComment.id,
                    }),
                )
                .returns(() => Promise.resolve({} as UpdateCommentResponse))
                .verifiable(Times.once());

            await testSubject.completeRun(combinedReportResult);
        });
    });
});
