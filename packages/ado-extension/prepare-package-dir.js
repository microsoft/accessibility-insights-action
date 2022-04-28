// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// run from root folder, this scripts prepares the dist folder

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const packageJson = require(process.cwd() + '/package.json');
const sharedPackageJson = require(path.resolve(process.cwd(), '../shared/package.json'));
const rootPackageJson = require(path.resolve(process.cwd(), '../../package.json'));
const getWebpackConfig = require(process.cwd() + '/webpack.config');

// This is for forward compat; the latter was deprecated in favor of the former in Node 14
const rmdirSync = fs.rmSync || fs.rmdirSync;

// We allow overrides of extension/task identifiers so we can deploy
// different versions of the extension with the same YAML
const taskJson = JSON.parse(fs.readFileSync('task.json'));
const extensionJson = JSON.parse(fs.readFileSync('ado-extension.json'));

const overrideExtensionName = process.env.ADO_EXTENSION_NAME;
if (overrideExtensionName && overrideExtensionName.length > 0) {
    taskJson.name = overrideExtensionName;
    taskJson.friendlyName = overrideExtensionName;
    extensionJson.name = overrideExtensionName;
}

const overrideExtensionId = process.env.ADO_EXTENSION_ID;
if (overrideExtensionId && overrideExtensionId.length > 0) {
    extensionJson.id = overrideExtensionId;
}

const overrideTaskId = process.env.ADO_TASK_ID;
if (overrideTaskId && overrideTaskId.length > 0) {
    taskJson.id = overrideTaskId;
}

const packageDependencies = packageJson.dependencies;
const webpackConfig = getWebpackConfig();
const webpackExternals = webpackConfig.externals ? webpackConfig.externals : [];
const imagePackageDependencies = {};

webpackExternals.forEach((packageName) => {
    if (packageDependencies.hasOwnProperty(packageName)) {
        imagePackageDependencies[packageName] = packageDependencies[packageName];
    } else if (sharedPackageJson.dependencies.hasOwnProperty(packageName)) {
        imagePackageDependencies[packageName] = sharedPackageJson.dependencies[packageName];
    } else {
        throw new Error(`Package '${packageName}' is not declared in package.json dependencies{} section.`);
    }
});

const newPackageJson = {
    ...packageJson,
    scripts: undefined,
    dependencies: imagePackageDependencies,
    devDependencies: undefined,
    resolutions: rootPackageJson.resolutions,
};

fs.writeFileSync('dist/pkg/package.json', JSON.stringify(newPackageJson, undefined, 4));
console.log('wrote package.json to dist/pkg/package.json');

console.log(JSON.stringify(extensionJson, null, 4));
fs.writeFileSync('dist/ado-extension.json', JSON.stringify(extensionJson));
console.log('copied ado-extension.json to dist/pkg/ado-extension.json with any overrides');

console.log(JSON.stringify(taskJson, null, 4));
fs.writeFileSync('dist/pkg/task.json', JSON.stringify(taskJson));
console.log('copied task.json to dist/pkg/task.json with any overrides');

fs.copyFileSync('../../docs/ado-extension-overview.md', 'dist/overview.md');
console.log('copied ado-extension-overview.md to dist/overview.md');

fs.copyFileSync('../../icons/brand-blue-48px.png', 'dist/pkg/extension-icon.png');
console.log('copied brand-blue-48px.png to dist/pkg/extension-icon.png');

fs.copyFileSync('../../yarn.lock', 'dist/pkg/yarn.lock');
console.log('copied yarn.lock to dist/pkg/yarn.lock');

console.log('updating yarn.lock based on prepared package.json');
// This intentionally uses execSync rather than the normally-preferred execFileSync
// because it relies on shell behavior to pick whether to invoke yarn, yarn.exe,
// yarn.bat, or yarn.cmd (any of these are possible depending on OS + how Yarn is
// installed). This doesn't create a shell injection concern because the command
// is a fixed string.
execSync('yarn install --prod --ignore-engines --ignore-scripts', {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'dist', 'pkg'),
});

console.log('removing node_modules left behind by yarn.lock update');
rmdirSync('dist/pkg/node_modules', { recursive: true });

console.log('prepare-package-dir complete');
