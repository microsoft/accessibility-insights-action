// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as adoTask from 'azure-pipelines-task-lib/task';

export function runScan() {
    try {
        const url = adoTask.getInput('url', true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        console.log(`Scanning ${url!}`);
    } catch (error) {
        console.log('Exception thrown in action: ', error);
        process.exit(1);
    }
}
