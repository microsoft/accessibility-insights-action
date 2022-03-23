// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as inversify from 'inversify';
import * as NodeApi from 'azure-devops-node-api';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { ADOTaskConfig } from '../task-config/ado-task-config';
import { AdoIocTypes } from './ado-ioc-types';
import { ADOArtifactsInfoProvider } from '../ado-artifacts-info-provider';
import { WorkflowEnforcer } from '../progress-reporter/enforcement/workflow-enforcer';
import { AdoConsoleCommentCreator } from '../progress-reporter/console/ado-console-comment-creator';
import { readAdoExtensionMetadata } from '../ado-extension-metadata';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(AdoIocTypes.AdoTask).toConstantValue(AdoTask);
    container.bind(AdoIocTypes.NodeApi).toConstantValue(NodeApi);
    container.bind(iocTypes.TaskConfig).to(ADOTaskConfig).inSingletonScope();
    container.bind(AdoConsoleCommentCreator).toSelf().inSingletonScope();
    container.bind(WorkflowEnforcer).toSelf().inSingletonScope();
    container
        .bind(iocTypes.ProgressReporters)
        .toDynamicValue((context) => {
            return [context.container.get(AdoConsoleCommentCreator), context.container.get(WorkflowEnforcer)];
        })
        .inSingletonScope();
    container.bind(iocTypes.ArtifactsInfoProvider).to(ADOArtifactsInfoProvider).inSingletonScope();
    container
        .bind(AdoIocTypes.AdoExtensionMetadata)
        .toDynamicValue(() => readAdoExtensionMetadata())
        .inSingletonScope();

    return container;
}
