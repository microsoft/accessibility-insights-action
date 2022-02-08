// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as inversify from 'inversify';
import * as NodeApi from 'azure-devops-node-api';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { ADOTaskConfig } from '../task-config/ado-task-config';
import { AdoIocTypes } from './ado-ioc-types';
import * as process from 'process';
import { ADOArtifactsInfoProvider } from '../ado-artifacts-info-provider';
import { WorkflowEnforcer } from '../progress-reporter/enforcement/workflow-enforcer';
import { AdoConsoleCommentCreator } from '../progress-reporter/console/ado-console-comment-creator';

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
            switch (process.env.BUILD_REPOSITORY_PROVIDER) {
                case 'TfsGit': {
                    // Note: Keep the WorkflowEnforcer creator last in the array!
                    return [context.container.get(AdoConsoleCommentCreator), context.container.get(WorkflowEnforcer)];
                }
                default: {
                    return [context.container.get(WorkflowEnforcer)];
                }
            }
        })
        .inSingletonScope();
    container.bind(iocTypes.ArtifactsInfoProvider).to(ADOArtifactsInfoProvider).inSingletonScope();

    return container;
}
