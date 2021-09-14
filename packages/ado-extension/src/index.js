"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
exports.__esModule = true;
// import { installRuntimeDependencies } from './install-runtime-dependencies';
// installRuntimeDependencies();
// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// import('./ado-extension').then((adoExtension) => {
//     adoExtension.runScan();
// });
var adoTask = require("azure-pipelines-task-lib/task");
try {
    var siteDir = adoTask.getInput('siteDir', true);
    console.log("siteDir " + siteDir);
}
catch (error) {
    console.log('Exception thrown in action: ', error);
    process.exit(1);
}
