// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import './module-name-mapper';

import { setupIocContainer } from 'shared';
import { Logger } from 'shared';
import { Scanner } from 'shared';

(async () => {
    const container = setupIocContainer();
    const logger = container.get(Logger);
    await logger.setup();

    const scanner = container.get(Scanner);
    await scanner.scan();
})().catch((error) => {
    console.log('Exception thrown in action: ', error);
    process.exit(1);
});
