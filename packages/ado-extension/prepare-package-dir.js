// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const fs = require('fs');
const path = require('path');
const packageJson = require(process.cwd() + '/package.json');
const getWebpackConfig = require(process.cwd() + '/webpack.config');
const { buildRuntimePackageMetadata } = require('../shared/build-runtime-package-metadata');

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

console.log(JSON.stringify(extensionJson, null, 4));
fs.writeFileSync('dist/ado-extension.json', JSON.stringify(extensionJson));
console.log('copied ado-extension.json to dist/pkg/ado-extension.json with any overrides');

console.log(JSON.stringify(taskJson, null, 4));
fs.writeFileSync('dist/pkg/task.json', JSON.stringify(taskJson));
console.log('copied task.json to dist/pkg/task.json with any overrides');

fs.copyFileSync('../../docs/ado-extension-overview.md', 'dist/overview.md');
console.log('copied ado-extension-overview.md to dist/overview.md');

fs.copyFileSync('../../icons/brand-blue-128px.png', 'dist/extension-icon.png');
console.log('copied brand-blue-128px.png to dist/extension-icon.png');

// "icon.png" is the the icon image that will be shown in the task list for classic pipelines
// While the documentation recommends 32x32, it works with 128x128 and prevents the image from appearing blurry
// https://learn.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task?view=azure-devops#traditional-extension-layout
fs.copyFileSync('../../icons/brand-blue-128px.png', 'dist/pkg/icon.png');
console.log('copied brand-blue-128px.png to dist/pkg/icon.png');

buildRuntimePackageMetadata({
    packageJson,
    webpackConfig: getWebpackConfig(),
    outputDirectory: path.join('.', 'dist', 'pkg'),
});

console.log('prepare-package-dir complete');
