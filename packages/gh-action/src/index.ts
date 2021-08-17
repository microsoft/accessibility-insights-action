// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import './module-name-mapper';

import { setupSharedIocContainer } from '@accessibility-insights-action/shared';
import { Logger } from '@accessibility-insights-action/shared';
import { Scanner } from '@accessibility-insights-action/shared';

(async () => {
    const container = setupSharedIocContainer();
    const logger = container.get(Logger);
    await logger.setup();

    const scanner = container.get(Scanner);
    await scanner.scan();
})().catch((error) => {
    console.log('Exception thrown in action: ', error);
    process.exit(1);
});
