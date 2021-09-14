'use strict';
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
exports.__esModule = true;
var tmrm = require('azure-pipelines-task-lib/mock-run');
var path = require('path');
var taskPath = path.join(__dirname, '../dist/pkg/index.js');
var tmr = new tmrm.TaskMockRunner(taskPath);
tmr.setInput('siteDir', '../../../../dev/website-root');
tmr.setInput('scanUrlRelativePath', '/');
tmr.setInput('outputDir', '_accessibility-reports');
tmr.setInput('scanTimeout', '90000');
tmr.setInput('maxUrls', '100');
tmr.run();
