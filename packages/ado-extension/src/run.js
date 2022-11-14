// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const tmrm = require('azure-pipelines-task-lib/mock-run');
const path = require('path');
const fs = require('fs');

const srcAdoExtensionMetadata = path.join(__dirname, '..', 'scripts', 'local-ado-extension-metadata.json');
const destAdoExtensionMetadata = path.join(__dirname, '..', 'dist', 'pkg', 'ado-extension-metadata.json');
console.log(`run-locally.js is copying ${srcAdoExtensionMetadata} to ${destAdoExtensionMetadata}`);

fs.copyFileSync(srcAdoExtensionMetadata, destAdoExtensionMetadata);

const tempPath = path.join(__dirname, '..', 'dist', 'tmp');

if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
}

process.env['AGENT_TEMPDIRECTORY'] = tempPath;

const taskExecutablePath = path.join(__dirname, '..', 'dist', 'pkg', 'index.js');

const tmr = new tmrm.TaskMockRunner(taskExecutablePath);

tmr.setInput('url', 'https://www.washington.edu/accesscomputing/AU/before.html');

console.log('ANTES DEL RUN');
tmr.run(true);
console.log('DESPUES DEL RUN');
