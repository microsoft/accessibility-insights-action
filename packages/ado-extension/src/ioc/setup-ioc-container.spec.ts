// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as NodeApi from 'azure-devops-node-api';
import { Container } from 'inversify';
import { setupIocContainer } from './setup-ioc-container';
import { iocTypes } from '@accessibility-insights-action/shared';
import { AdoIocTypes } from './ado-ioc-types';
import { AdoConsoleCommentCreator } from '../progress-reporter/console/ado-console-comment-creator';

describe(setupIocContainer, () => {
    let testSubject: Container;

    beforeEach(() => {
        testSubject = setupIocContainer();
    });

    test.each([iocTypes.TaskConfig, AdoConsoleCommentCreator, iocTypes.ArtifactsInfoProvider])(
        'verify singleton resolution %p',
        (key: any) => {
            verifySingletonDependencyResolution(testSubject, key);
        },
    );

    test('verify progress reporter resolution', () => {
        verifySingletonDependencyResolution(testSubject, iocTypes.ProgressReporters);
    });

    test.each([
        { key: AdoIocTypes.AdoTask, value: AdoTask },
        { key: AdoIocTypes.NodeApi, value: NodeApi },
    ])('verify constant value resolution %s', (pair: { key: string; value: any }) => {
        expect(testSubject.get(pair.key)).toEqual(pair.value);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});
