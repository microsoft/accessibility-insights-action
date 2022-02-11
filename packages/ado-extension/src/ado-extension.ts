// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import './module-name-mapper';

import { ExitCode, hookStderr, hookStdout, Logger, Scanner } from '@accessibility-insights-action/shared';
import { setupIocContainer } from './ioc/setup-ioc-container';

export function runScan(): void {
    (async () => {
        hookStderr();
        hookStdout();

        const container = setupIocContainer();
        const logger = container.get(Logger);
        await logger.setup();

        const scanner = container.get(Scanner);
        process.exit((await scanner.scan()) ? ExitCode.ScanCompletedNoUserActionIsNeeded : ExitCode.ScanCompletedUserActionIsNeeded);
    })().catch((error) => {
        console.log('##[error][Exception] Exception thrown in extension: ', error);
        process.exit(ExitCode.ScanFailedToComplete);
    });
}
