// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as inversify from 'inversify';
import * as NodeApi from 'azure-devops-node-api';
import * as AppInsights from 'applicationinsights';
import { iocTypes, Logger, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { ADOTaskConfig } from '../task-config/ado-task-config';
import { AdoIocTypes } from './ado-ioc-types';
import { ADOArtifactsInfoProvider } from '../ado-artifacts-info-provider';
import { WorkflowEnforcer } from '../progress-reporter/enforcement/workflow-enforcer';
import { AdoConsoleCommentCreator } from '../progress-reporter/console/ado-console-comment-creator';
import { TelemetryClientFactory } from '../telemetry/telemetry-client-factory';
import { TelemetrySender } from '../progress-reporter/telemetry/telemetry-sender';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(AdoIocTypes.AdoTask).toConstantValue(AdoTask);
    container.bind(AdoIocTypes.NodeApi).toConstantValue(NodeApi);
    container.bind(AdoIocTypes.AppInsights).toConstantValue(AppInsights);
    container.bind(iocTypes.TaskConfig).to(ADOTaskConfig).inSingletonScope();
    container.bind(AdoConsoleCommentCreator).toSelf().inSingletonScope();
    container.bind(WorkflowEnforcer).toSelf().inSingletonScope();
    container.bind(TelemetrySender).toSelf().inSingletonScope();
    container
        .bind(iocTypes.ProgressReporters)
        .toDynamicValue((context) => {
            return [
                context.container.get(AdoConsoleCommentCreator),
                context.container.get(TelemetrySender),
                context.container.get(WorkflowEnforcer),
            ];
        })
        .inSingletonScope();
    container.bind(iocTypes.ArtifactsInfoProvider).to(ADOArtifactsInfoProvider).inSingletonScope();
    container
        .rebind(iocTypes.TelemetryClient)
        .toDynamicValue((context) => {
            return context.container.get(TelemetryClientFactory).createTelemetryClient();
        })
        .inSingletonScope();

    return container;
}
