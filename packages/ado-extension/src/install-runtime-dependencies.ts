// @ts-nocheck
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
    //
    // This is why we don't just invoke "yarn" - that would use whatever
    // node version the user's pipeline happens to have installed globally,
    // which might differ from the version that the build agent is
    // running our task with.
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

    if (process.platform === 'win32') {
        // #1575: Windows Server Core and Nano Server do not have the needed
        // dependencies to run Chrome. Try to detect this case and warn
        // the user.
        const wmi = require('node-wmi');
        wmi.Query(
            {
                class: 'Win32_OptionalFeature',
                where: "name = 'Server-Media-Foundation'",
            },
            function (err, features) {
                const INSTALLSTATE_INSTALLED = 1;
                if (features)
                    for (const feat of features) {
                        if (feat['InstallState'] !== INSTALLSTATE_INSTALLED)
                            console.log(
                                `[warning]${feat['Caption']} is not installed! Verify that you are using a supported image (Server Core and Nano Server are not supported).`,
                            );
                    }
            },
        );
    }
}
