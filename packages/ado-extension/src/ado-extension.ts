// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';

import { hookStderr, hookStdout, Logger, Scanner } from '@accessibility-insights-action/shared';
import { setupIocContainer } from './ioc/setup-ioc-container';
import { adoStdoutTransformer } from './output-hooks/ado-stdout-transformer';
import * as adoTask from 'azure-pipelines-task-lib/task';

export function runScan(): void {
    (async () => {
        hookStderr();
        hookStdout(adoStdoutTransformer);

        const container = setupIocContainer();
        const logger = container.get(Logger);
        await logger.setup();

        const scanner = container.get(Scanner);
        const taskSucceeded = await scanner.scan();

        if (taskSucceeded) {
            adoTask.setResult(adoTask.TaskResult.Succeeded, 'Scan completed successfully');
        } else {
            adoTask.setResult(adoTask.TaskResult.Failed, logger.getAllErrors() || 'Scan failed');
        }
    })().catch((error: Error) => {
        adoTask.setResult(adoTask.TaskResult.Failed, `Exception thrown in extension: ${error.message}`);
    });
}
