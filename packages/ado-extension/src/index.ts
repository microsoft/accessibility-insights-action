// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execSync } from 'child_process';

export function installRuntimeDependencies() {
    console.log('installing runtime dependencies...');
    execSync('yarn install --prod --ignore-engines --frozen-lockfile', {
        stdio: 'inherit',
        cwd: __dirname,
    });
}

installRuntimeDependencies();

import('azure-pipelines-task-lib/task').then((adoTask) => {
    const url = adoTask.getInput('url', true);
    console.log('running the accessibility scans ...');
    execSync(`node ado-extension.js ${url}`, {
        stdio: 'inherit',
        cwd: __dirname,
    });
});
