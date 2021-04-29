// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import { AllProgressReporter } from './all-progress-reporter';
import { CheckRunCreator } from './check-run/check-run-creator';
import { ProgressReporter } from './progress-reporter';
import { PullRequestCommentCreator } from './pull-request/pull-request-comment-creator';
import { Logger } from '../logger/logger';

describe(AllProgressReporter, () => {
    let testSubject: AllProgressReporter;
    let pullRequestCommentCreator: IMock<PullRequestCommentCreator>;
    let checkRunCreatorMock: IMock<CheckRunCreator>;
    let loggerMock: IMock<Logger>;

    beforeEach(() => {
        checkRunCreatorMock = Mock.ofType(CheckRunCreator);
        pullRequestCommentCreator = Mock.ofType(PullRequestCommentCreator);
        loggerMock = Mock.ofType(Logger);

        testSubject = new AllProgressReporter(pullRequestCommentCreator.object, checkRunCreatorMock.object, loggerMock.object);
    });

    it('start should invoke all reporters', async () => {
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.start())
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.start();
    });

    it('complete should invoke all reporters', async () => {
        const axeResults = 'axe results' as any;
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.completeRun(axeResults))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.completeRun(axeResults);
    });

    it('failRun should invoke all reporters', async () => {
        const error = 'scan error';
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.failRun(error))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.failRun(error);
    });

    afterEach(() => {
        checkRunCreatorMock.verifyAll();
        pullRequestCommentCreator.verifyAll();
    });

    function executeOnReporter(callback: (reporter: IMock<ProgressReporter>) => void): void {
        callback(checkRunCreatorMock);
        callback(pullRequestCommentCreator);
    }
});
