// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as NodeApi from 'azure-devops-node-api';
import * as AppInsights from 'applicationinsights';
import { Container } from 'inversify';
import { setupIocContainer } from './setup-ioc-container';
import { iocTypes, NullTelemetryClient, TelemetryClient } from '@accessibility-insights-action/shared';
import { AdoIocTypes } from './ado-ioc-types';
import { AdoConsoleCommentCreator } from '../progress-reporter/console/ado-console-comment-creator';
import { TelemetryClientFactory } from '../telemetry/telemetry-client-factory';

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
        testSubject.bind(TelemetryClientFactory).to(StubTelemetryClientFactory);
        verifySingletonDependencyResolution(testSubject, iocTypes.ProgressReporters);
    });

    test('verify singleton TelemetryClient resolution using TelemetryClientFactory', () => {
        testSubject.bind(TelemetryClientFactory).to(StubTelemetryClientFactory);

        expect(testSubject.get(iocTypes.TelemetryClient)).toBeInstanceOf(StubTelemetryClient);

        verifySingletonDependencyResolution(testSubject, iocTypes.TelemetryClient);
    });

    test.each([
        { key: AdoIocTypes.AdoTask, value: AdoTask },
        { key: AdoIocTypes.NodeApi, value: NodeApi },
        { key: AdoIocTypes.AppInsights, value: AppInsights },
    ])('verify constant value resolution %s', (pair: { key: string; value: any }) => {
        expect(testSubject.get(pair.key)).toEqual(pair.value);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});

class StubTelemetryClient extends NullTelemetryClient {}
class StubTelemetryClientFactory extends TelemetryClientFactory {
    public createTelemetryClient(): TelemetryClient {
        return new StubTelemetryClient();
    }
}
