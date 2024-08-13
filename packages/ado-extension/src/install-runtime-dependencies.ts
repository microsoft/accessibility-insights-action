// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execFileSync } from 'child_process';
import { argv } from 'process';
import { readdirSync } from 'fs';
import { join } from 'path';
import * as adoTask from 'azure-pipelines-task-lib/task';
import * as fs from 'fs';

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
    const tempNpmrcPath = join(__dirname, '.npmrc');

    console.log(`##[debug]Using node from ${nodePath}`);
    console.log(`##[debug]Using bundled yarn from ${yarnPath}`);

    const registryUrl: string = adoTask.getInput('npmRegistryUrl') || 'https://registry.yarnpkg.com';

    if (registryUrl != 'https://registry.yarnpkg.com') {
        const npmrcPath = adoTask.getInput('npmrcfilePath') || '';
        // Ensure the npmrc file path is provided
        if (npmrcPath === '') {
            console.error(`.npmrc file path is required for authenticating registry Url ${registryUrl}`);
            process.exit(1);
        }

        // Copy .npmrc to the Yarn working directory
        try {
            fs.copyFileSync(npmrcPath, tempNpmrcPath);
            console.log(`Copied .npmrc to ${tempNpmrcPath}`);
        } catch (err) {
            console.error(`Failed to copy .npmrc: ${err}`);
            process.exit(1);
        }
    }

    // Set the Yarn registry URL
    execFileSync(nodePath, [yarnPath, 'cache', 'clean'], {
        stdio: 'inherit',
        cwd: __dirname,
    });

    console.log(`Using registry URL: ${registryUrl}`);
    // Set the Yarn registry URL
    execFileSync(nodePath, [yarnPath, 'config', 'set', 'npmRegistryServer', registryUrl], {
        stdio: 'inherit',
        cwd: __dirname,
    });
    // Set the Yarn registry URL
    execFileSync(nodePath, [yarnPath, 'config', 'set', 'npmAlwaysAuth', 'true'], {
        stdio: 'inherit',
        cwd: __dirname,
    });

    execFileSync(nodePath, [yarnPath, 'install', '--immutable'], {
        stdio: 'inherit',
        cwd: __dirname,
    });

    console.log('##[endgroup]');
}
