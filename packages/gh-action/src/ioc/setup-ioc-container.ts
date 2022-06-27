// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import * as inversify from 'inversify';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { GHTaskConfig } from '../task-config/gh-task-config';
import { GitHubIocTypes } from './gh-ioc-types';
import { GitHubArtifactsInfoProvider } from '../gh-artifacts-info-provider';
import { ConsoleCommentCreator } from '../console/console-comment-creator';
import { JobSummaryCreator } from '../job-summary/job-summary-creator';
import { GHWorkflowEnforcer } from '../workflow-enforcer/gh-workflow-enforcer';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(GitHubIocTypes.Github).toConstantValue(github);
    container.bind(iocTypes.TaskConfig).to(GHTaskConfig).inSingletonScope();
    container.bind(JobSummaryCreator).toSelf().inSingletonScope();
    container.bind(ConsoleCommentCreator).toSelf().inSingletonScope();
    container.bind(GHWorkflowEnforcer).toSelf().inSingletonScope();
    container
        .bind(iocTypes.ProgressReporters)
        .toDynamicValue((context) => {
            const consoleCommentCreator = context.container.get(ConsoleCommentCreator);
            const jobSummaryCreator = context.container.get(JobSummaryCreator);
            const ghWorkflowEnforcer = context.container.get(GHWorkflowEnforcer);

            return [consoleCommentCreator, jobSummaryCreator, ghWorkflowEnforcer];
        })
        .inSingletonScope();

    container
        .bind(Octokit)
        .toDynamicValue((context) => {
            const taskConfig = context.container.get(GHTaskConfig);

            return new Octokit({ auth: taskConfig.getToken() });
        })
        .inSingletonScope();
    container.bind(iocTypes.ArtifactsInfoProvider).to(GitHubArtifactsInfoProvider).inSingletonScope();

    return container;
}
