// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/*
This script runs the ADO extension task locally. It uses the
default inputs defined in task.json and allows for custom
overrides. To add or change task inputs, add key-value
pairs inside local-overrides.json. For instance:

[
    {
        name: "url",
        value: "https://accessibilityinsights.io"
    },
    {
        name: "singleWorker",
        value: true
    }
]

Valid names include any input name in task.json, e.g.
outputDir, siteDir, etc. Boolean values can be provided
without quotes, like singleWorker above.
*/

const mockRunner = require('azure-pipelines-task-lib/mock-run');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const taskExecutablePath = path.join(__dirname, '..', 'dist', 'pkg', 'index.js');
const tmr = new mockRunner.TaskMockRunner(taskExecutablePath);

const taskConfigPath = path.join(__dirname, '..', 'dist', 'pkg', 'task.json');
const taskConfig = require(taskConfigPath);

const inputs = {};

// Apply default input values from task configuration
for (const inputConfig of taskConfig['inputs']) {
    if (inputConfig.defaultValue) {
        inputs[inputConfig.name] = inputConfig.defaultValue;
    }
}

// Apply any input overrides
const localOverrides = require(path.join(__dirname, 'local-overrides.json'));
for (const override of localOverrides) {
    const validName = taskConfig['inputs'].some((input) => input.name === override.name);
    if (!validName) {
        console.log(`input override ${override.name} is not defined in task.json`);
        exit(1);
    }

    inputs[override.name] = override.value;
}

for (const name of Object.keys(inputs)) {
    console.log(`run-locally.js is setting up input ${name} to value ${inputs[name]}`);
    tmr.setInput(name, inputs[name]);
}

const srcAdoExtensionMetadata = path.join(__dirname, 'local-ado-extension-metadata.json');
const destAdoExtensionMetadata = path.join(__dirname, '..', 'dist', 'pkg', 'ado-extension-metadata.json');
console.log(`run-locally.js is copying ${srcAdoExtensionMetadata} to ${destAdoExtensionMetadata}`);
fs.copyFileSync(srcAdoExtensionMetadata, destAdoExtensionMetadata);

console.log('beginning task execution below');
console.log();

tmr.run(true);
