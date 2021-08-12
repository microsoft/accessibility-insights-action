// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('url', 'https://www.washington.edu/accesscomputing/AU/before.html');

tmr.run();
