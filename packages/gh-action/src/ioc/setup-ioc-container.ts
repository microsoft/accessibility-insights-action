// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import * as inversify from 'inversify';
import { iocTypes, setupSharedIocContainer, ProgressReporter } from '@accessibility-insights-action/shared';
import { GHTaskConfig } from '../task-config/gh-task-config';
import { GitHubIocTypes } from './gh-ioc-types';
import { PullRequestCommentCreator } from '../pull-request/pull-request-comment-creator';
import { CheckRunCreator } from '../check-run/check-run-creator';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(GitHubIocTypes.Github).toConstantValue(github);
    container.bind(iocTypes.TaskConfig).to(GHTaskConfig).inSingletonScope();
    container.bind(CheckRunCreator).toSelf().inSingletonScope();
    container.bind(PullRequestCommentCreator).toSelf().inSingletonScope();
    container
        .bind(iocTypes.ProgressReporters)
        .toDynamicValue((context) => {
            const pullRequestCommentCreator = context.container.get(PullRequestCommentCreator);
            const checkRunCreator = context.container.get(CheckRunCreator);

            return { checkRunCreator, pullRequestCommentCreator };
        })
        .inSingletonScope();

    container
        .bind(Octokit)
        .toDynamicValue((context) => {
            const taskConfig = context.container.get(GHTaskConfig);

            return new Octokit({ auth: taskConfig.getToken() });
        })
        .inSingletonScope();

    return container;
}
