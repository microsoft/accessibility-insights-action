// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// run from root folder, this scripts prepares the dist folder

const fs = require('fs-extra');

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
fs.writeJSONSync('dist/ado-extension.json', extensionJson);
console.log('copied ado-extension.json to dist/pkg/ado-extension.json with any overrides');

console.log(JSON.stringify(taskJson, null, 4));
fs.writeJSONSync('dist/pkg/task.json', taskJson);
console.log('copied task.json to dist/pkg/task.json with any overrides');

fs.copyFileSync('external-package.json', 'dist/pkg/package.json');
console.log('copied external-package.json to dist/pkg/package.json');

fs.copyFileSync('../../yarn.lock', 'dist/pkg/yarn.lock');
console.log('copied yarn.lock to dist/pkg/yarn.lock');

fs.copyFileSync('../../icons/brand-blue-48px.png', 'dist/pkg/extension-icon.png');
console.log('copied brand-blue-48px.png to dist/pkg/extension-icon.png');
