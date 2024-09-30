// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { execFileSync } from 'child_process';
import { argv } from 'process';
import { readdirSync } from 'fs';
import { join } from 'path';
import * as adoTask from 'azure-pipelines-task-lib/task';
import * as npmRegistryUtil from './npm-registry-util';

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

    const registryUrl: string = adoTask.getInput('npmRegistryUrl') || 'https://registry.yarnpkg.com';

    console.log(`Using registry URL: ${registryUrl}`);

    // Ignore environment variables starting with YARN_, Yarn_, or yarn_
    const filteredEnv = getFilteredEnv();

    // Set the Yarn registry URL
    execFileSync(nodePath, [yarnPath, 'config', 'set', 'npmRegistryServer', registryUrl], {
        stdio: 'inherit',
        cwd: __dirname,
        env: {
            ...filteredEnv, // Use the filtered environment variable
        },
    });

    if (registryUrl != 'https://registry.yarnpkg.com') {
        const serviceConnectionName: string | undefined = adoTask.getInput('npmRegistryCredential');

        if (!serviceConnectionName) {
            execFileSync(nodePath, [yarnPath, 'config', 'set', 'npmAuthToken', npmRegistryUtil.getSystemAccessToken()], {
                stdio: 'inherit',
                cwd: __dirname,
                env: {
                    ...filteredEnv, // Use the filtered environment variable
                },
            });
        } else {
            execFileSync(
                nodePath,
                [yarnPath, 'config', 'set', 'npmAuthIdent', npmRegistryUtil.getTokenFromServiceConnection(serviceConnectionName ?? '')],
                {
                    stdio: 'inherit',
                    cwd: __dirname,
                    env: {
                        ...filteredEnv, // Use the filtered environment variable
                    },
                },
            );
        }
        execFileSync(nodePath, [yarnPath, 'config', 'set', 'npmAlwaysAuth', 'true'], {
            stdio: 'inherit',
            cwd: __dirname,
            env: {
                ...filteredEnv, // Use the filtered environment variable
            },
        });
    }

    execFileSync(nodePath, [yarnPath, 'install', '--immutable'], {
        stdio: 'inherit',
        cwd: __dirname,
        env: {
            ...filteredEnv, // Use the filtered environment variable
        },
    });

    console.log('##[endgroup]');
}

// Function to filter environment variables
function getFilteredEnv(): Record<string, string> {
    const filteredEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.toLowerCase().startsWith('yarn_')) {
            filteredEnv[key] = value;
        } else {
            console.log(`filtered environment variable ${key}`);
        }
    }

    return filteredEnv;
}
