// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execFileSync } from 'child_process';
import { argv } from 'process';
import { readdirSync } from 'fs';
import { join } from 'path';

export function installRuntimeDependencies(): void {
    console.log('##[group]Installing runtime dependencies');

    // It's very important that we use the same node binary here as
    // we're already executing under. Some transitive dependencies
    // involve native build steps that are node-version-dependent
    // and will throw runtime errors if "yarn install" is run with
    // a different node version than we execute under.
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
