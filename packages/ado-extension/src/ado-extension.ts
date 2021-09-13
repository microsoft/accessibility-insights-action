// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import './module-name-mapper';

import { Logger } from '@accessibility-insights-action/shared';
import { Scanner } from '@accessibility-insights-action/shared';
import { setupIocContainer } from './ioc/setup-ioc-container';

export function runScan() {
    (async () => {
        const container = setupIocContainer();
        const logger = container.get(Logger);
        await logger.setup();

        const scanner = container.get(Scanner);
        await scanner.scan();
    })().catch((error) => {
        console.log('Exception thrown in extension: ', error);
        process.exit(1);
    });
}
