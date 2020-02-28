// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';

import * as github from '@actions/github';

import { IMock, Mock } from 'typemoq';
import { Logger } from '../logger/logger';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporterProvider } from './progress-reporter-provider';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';

// tslint:disable: no-object-literal-type-assertion no-empty no-any no-unsafe-any

describe(ProgressReporterProvider, () => {
    let testSubject: ProgressReporterProvider;

    let githubStub: typeof github;

    let pullRequestCommentCreator: IMock<PullRequestCommentCreator>;
    let checkRunCreatorMock: IMock<CheckRunCreator>;
    let loggerMock: IMock<Logger>;

    beforeEach(() => {
        checkRunCreatorMock = Mock.ofType(CheckRunCreator);
        pullRequestCommentCreator = Mock.ofType(PullRequestCommentCreator);
        loggerMock = Mock.ofType(Logger);

        githubStub = {
            context: {},
        } as typeof github;

        testSubject = new ProgressReporterProvider(
            pullRequestCommentCreator.object,
            checkRunCreatorMock.object,
            githubStub,
            loggerMock.object,
        );
    });

    describe('getInstance', () => {
        it(`returns ${PullRequestCommentCreator.name}`, () => {
            githubStub.context.eventName = 'pull_request';

            expect(testSubject.getInstance()).toBe(pullRequestCommentCreator.object);
        });

        it(`returns ${PullRequestCommentCreator.name}`, () => {
            githubStub.context.eventName = 'push';

            expect(testSubject.getInstance()).toBe(checkRunCreatorMock.object);
        });
    });
});
