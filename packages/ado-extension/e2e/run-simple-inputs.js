// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const tmrm = require('azure-pipelines-task-lib/mock-run');
const path = require('path');
const fs = require('fs');

// Prepare the task:
// Apply default input values from task configuration
const taskConfigPath = path.join(__dirname, '..', 'dist', 'pkg', 'task.json');
const taskConfig = require(taskConfigPath);
const inputs = {};
for (const inputConfig of taskConfig['inputs']) {
    if (inputConfig.defaultValue) {
        inputs[inputConfig.name] = inputConfig.defaultValue;
    }
}
// Make sure the task can access ado-extension-metadata.json
const srcAdoExtensionMetadata = path.join(__dirname, '..', 'scripts', 'local-ado-extension-metadata.json');
const destAdoExtensionMetadata = path.join(__dirname, '..', 'dist', 'pkg', 'ado-extension-metadata.json');
console.log(`e2e test is copying ${srcAdoExtensionMetadata} to ${destAdoExtensionMetadata}`);
fs.copyFileSync(srcAdoExtensionMetadata, destAdoExtensionMetadata);
// Create a temp directory
const tempPath = path.join(__dirname, '..', 'dist', 'tmp');
if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
}
process.env['AGENT_TEMPDIRECTORY'] = tempPath;

// Run the task:
const taskExecutablePath = path.join(__dirname, '..', 'dist', 'pkg', 'index.js');
const tmr = new tmrm.TaskMockRunner(taskExecutablePath);

for (const name of Object.keys(inputs)) {
    console.log(`e2e tests is applying input ${name} to value ${inputs[name]}`);
    tmr.setInput(name, inputs[name]);
}

tmr.setInput('url', 'https://www.washington.edu/accesscomputing/AU/before.html');

tmr.run(true); // Requires true bypass `retrieveSecret` error https://github.com/microsoft/azure-pipelines-task-lib/issues/794
