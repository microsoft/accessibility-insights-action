// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as inversify from 'inversify';
import * as NodeApi from 'azure-devops-node-api';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { ADOTaskConfig } from '../task-config/ado-task-config';
import { AdoPullRequestCommentCreator } from '../progress-reporter/pull-request/ado-pull-request-comment-creator';
import { AdoIocTypes } from './ado-ioc-types';
import * as process from 'process';
import { ADOArtifactsInfoProvider } from '../ado-artifacts-info-provider';
import { WorkflowEnforcement } from '../progress-reporter/workflow/workflow-enforcement';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(AdoIocTypes.AdoTask).toConstantValue(AdoTask);
    container.bind(AdoIocTypes.NodeApi).toConstantValue(NodeApi);
    container.bind(iocTypes.TaskConfig).to(ADOTaskConfig).inSingletonScope();
    container.bind(AdoPullRequestCommentCreator).toSelf().inSingletonScope();
    container.bind(WorkflowEnforcement).toSelf().inSingletonScope();
    container
        .bind(iocTypes.ProgressReporters)
        .toDynamicValue((context) => {
            switch (process.env.BUILD_REPOSITORY_PROVIDER) {
                case 'TfsGit': {
                    const pullRequestCommentCreator = context.container.get(AdoPullRequestCommentCreator);
                    return [pullRequestCommentCreator];
                }
                default: {
                    return [context.container.get(WorkflowEnforcement)];
                }
            }
        })
        .inSingletonScope();
    container.bind(iocTypes.ArtifactsInfoProvider).to(ADOArtifactsInfoProvider).inSingletonScope();

    return container;
}
