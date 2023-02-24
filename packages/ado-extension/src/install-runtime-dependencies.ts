// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execFileSync } from 'child_process';
import { argv } from 'process';
import { readdirSync } from 'fs';
import { join } from 'path';

export function installRuntimeDependencies(): void {
    console.log('##[group]Installing runtime dependencies');

    const nodePath = argv[0];

    const yarnReleasesPath = join(__dirname, '.yarn', 'releases');
    const yarnFilename = readdirSync(yarnReleasesPath)[0];
    const yarnPath = join(yarnReleasesPath, yarnFilename);

    console.log(`##[debug]Using node from ${nodePath}`);
    console.log(`##[debug]Using bundled yarn from ${yarnPath}`);

    execFileSync(nodePath, [yarnPath, 'install', '--immutable'], {
        stdio: 'inherit',
        cwd: __dirname,
    });

    console.log('##[endgroup]');
}
