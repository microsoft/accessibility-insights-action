// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as github from '@actions/github';
import { Container } from 'inversify';
import { setupIocContainer } from './setup-ioc-container';
import { iocTypes } from '@accessibility-insights-action/shared';
import { GitHubIocTypes } from './gh-ioc-types';
import { ConsoleCommentCreator } from '../console/console-comment-creator';
import { GHWorkflowEnforcer } from '../workflow-enforcer/gh-workflow-enforcer';

describe(setupIocContainer, () => {
    let testSubject: Container;

    beforeEach(() => {
        testSubject = setupIocContainer();
    });

    test.each([GHWorkflowEnforcer, ConsoleCommentCreator, iocTypes.TaskConfig, iocTypes.ProgressReporters, iocTypes.ArtifactsInfoProvider])(
        'verify singleton resolution %p',
        (key: any) => {
            verifySingletonDependencyResolution(testSubject, key);
        },
    );
    test.each([{ key: GitHubIocTypes.Github, value: github }])(
        'verify constant value resolution %s',
        (pair: { key: string; value: any }) => {
            expect(testSubject.get(pair.key)).toEqual(pair.value);
        },
    );

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});