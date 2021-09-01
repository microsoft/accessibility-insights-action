// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as inversify from 'inversify';
import { iocTypes, setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { ADOTaskConfig } from '../task-config/ado-task-config';

export function setupIocContainer(container = new inversify.Container({ autoBindInjectable: true })): inversify.Container {
    container = setupSharedIocContainer(container);
    container.bind(iocTypes.TaskConfig).to(ADOTaskConfig).inSingletonScope();
    return container;
}
