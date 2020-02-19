// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

// import * as core from '@actions/core';
//import * as github from '@actions/github';
import { setupIocContainer } from './ioc/setup-ioc-container';
import { Logger } from './logger/logger';
import { Scanner } from './scanner/scanner';

(async () => {
    const container = setupIocContainer();
    const logger = container.get(Logger);
    await logger.setup();

    const scanner = container.get(Scanner);
    await scanner.scan();
})().catch(error => {
    console.log('Exception thrown in action: ', error);
    process.exit(1);
});
