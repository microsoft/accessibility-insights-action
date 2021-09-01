// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Container } from 'inversify';
import { setupIocContainer } from './setup-ioc-container';
import { iocTypes } from '@accessibility-insights-action/shared';

describe(setupIocContainer, () => {
    let testSubject: Container;

    beforeEach(() => {
        testSubject = setupIocContainer();
    });

    test.each([iocTypes.TaskConfig])('verify singleton resolution %p', (key: any) => {
        verifySingletonDependencyResolution(testSubject, key);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});
