// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('url', 'https://www.washington.edu/accesscomputing/AU/before.html');

tmr.run();
