// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import './module-name-mapper';

import { ExitCode, hookStderr, hookStdout, Logger, Scanner } from '@accessibility-insights-action/shared';
import { setupIocContainer } from './ioc/setup-ioc-container';
import { adoStdoutTransformer } from './output-hooks/ado-stdout-transformer';

export function runScan(): void {
    (async () => {
        hookStderr();
        hookStdout(adoStdoutTransformer);

        const container = setupIocContainer();
        const logger = container.get(Logger);
        await logger.setup();

        const scanner = container.get(Scanner);
        const completedWithNoUserActionNeeded = await scanner.scan();

        logger.logDebug(`Waiting 5s for telemetry to flush...`);
        const delay = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));
        await delay(5000); // for telemetry flush

        process.exit(
            completedWithNoUserActionNeeded ? ExitCode.ScanCompletedNoUserActionIsNeeded : ExitCode.ScanCompletedUserActionIsNeeded,
        );
    })().catch((error) => {
        console.log('##[error][Exception] Exception thrown in extension: ', error);
        process.exit(ExitCode.ScanFailedToComplete);
    });
}
