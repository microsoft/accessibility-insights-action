// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const tmrm = require('azure-pipelines-task-lib/mock-run');
const path = require('path');
const fs = require('fs');

// Prepare the task:
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

tmr.setInput('url', 'https://www.washington.edu/accesscomputing/AU/before.html');
tmr.setInput('maxUrls', 1);
tmr.setInput('scanTimeout', 50000);

tmr.run(true);
