// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharedPackageJson = require('./package.json');
const rootPackageJson = require('../../package.json');
const rootDirectory = path.resolve(path.join(__dirname, '..', '..'));

// This is for forward compat; the latter was deprecated in favor of the former in Node 14
const rmdirSync = fs.rmSync || fs.rmdirSync;

// Produces a package.json and yarn.lock in outputDirectory suitable for runtime installation
// of the packages listed in the "externals" property of webpackConfig. The produced package
// metadata files will use the versions from the provided package's packageJson content, falling
// back to versions from this shared package, and will respect yarn resolutions present in the
// root package.json.
function buildRuntimePackageMetadata({ packageJson, webpackConfig, outputDirectory }) {
    console.log('building runtime package metadata in ${outputDirectory}');

    const packageDependencies = packageJson.dependencies;
    const sharedDependencies = sharedPackageJson.dependencies;

    const webpackExternals = webpackConfig.externals ? webpackConfig.externals : [];
    const runtimeDependencies = {};

    webpackExternals.forEach((packageName) => {
        if (packageDependencies.hasOwnProperty(packageName)) {
            runtimeDependencies[packageName] = packageDependencies[packageName];
        } else if (sharedDependencies.hasOwnProperty(packageName)) {
            runtimeDependencies[packageName] = sharedDependencies[packageName];
        } else {
            throw new Error(`Could not find any package.json entry for webpack external '${packageName}'`);
        }
    });

    const outPackageJsonPath = path.join(outputDirectory, 'package.json');
    const outPackageJsonContent = {
        ...packageJson,
        scripts: undefined,
        dependencies: runtimeDependencies,
        devDependencies: undefined,
        resolutions: rootPackageJson.resolutions,
    };

    fs.writeFileSync(outPackageJsonPath, JSON.stringify(outPackageJsonContent, undefined, 4));
    console.log(`built ${outPackageJsonPath}`);

    const rootYarnLockPath = path.join(rootDirectory, 'yarn.lock');
    const outYarnLockPath = path.join(outputDirectory, 'yarn.lock');
    fs.copyFileSync(rootYarnLockPath, outYarnLockPath);
    console.log(`seeded ${outYarnLockPath} from ${rootYarnLockPath}`);

    console.log('updating yarn.lock based on built package.json');
    // This intentionally uses execSync rather than the normally-preferred execFileSync
    // because it relies on shell behavior to pick whether to invoke yarn, yarn.exe,
    // yarn.bat, or yarn.cmd (any of these are possible depending on OS + how Yarn is
    // installed). This doesn't create a shell injection concern because the command
    // is a fixed string.
    execSync('yarn install --prod --ignore-engines --ignore-scripts', {
        stdio: 'inherit',
        cwd: outputDirectory,
    });

    const outNodeModulesPath = path.join(outputDirectory, 'node_modules');
    console.log(`removing ${outNodeModulesPath} left behind by yarn.lock update`);
    rmdirSync(outNodeModulesPath, { recursive: true });

    console.log('building runtime package metadata complete');
}

module.exports = { buildRuntimePackageMetadata };
