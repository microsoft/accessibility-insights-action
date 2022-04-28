// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execSync } from 'child_process';

export function installRuntimeDependencies(): void {
    console.log('##[group]Installing runtime dependencies');

    // This intentionally uses execSync rather than the normally-preferred execFileSync
    // because it relies on shell behavior to pick whether to invoke yarn, yarn.exe,
    // yarn.bat, or yarn.cmd (any of these are possible depending on OS + how Yarn is
    // installed). This doesn't create a shell injection concern because the command
    // is a fixed string.
    execSync('yarn install --prod --ignore-engines --frozen-lockfile', {
        stdio: 'inherit',
        cwd: __dirname,
    });

    console.log('##[endgroup]');
}
