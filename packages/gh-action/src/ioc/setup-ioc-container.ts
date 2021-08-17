// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import * as inversify from 'inversify';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { GitHubIocTypes } from './gh-ioc-types';
import { GHTaskConfig } from '../task-config/gh-task-config';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    // container.bind(GitHubIocTypes.Github).toConstantValue(github);
    container.bind(iocTypes.TaskConfig).toConstantValue(GHTaskConfig);
    // container
    //     .bind(Octokit)
    //     .toDynamicValue((context) => {
    //         const taskConfig = context.container.get(GHTaskConfig);

    //         return new Octokit({ auth: taskConfig.getToken() });
    //     })
    //     .inSingletonScope();

    return container;
}
