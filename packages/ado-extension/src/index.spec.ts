// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import fs from 'fs';
const cp = require('child_process');

describe('Sample task tests', () => {
    it('should succeed with simple inputs', () => {
        const compiledSourcePath = path.join(__dirname, '../dist/pkg/run.js');

        // test need a yarn build run before
        expect(fs.existsSync(compiledSourcePath)).toBe(true);

        const testSubject: ttm.MockTestRunner = new ttm.MockTestRunner(compiledSourcePath);

        console.log(cp.execSync(`node ${compiledSourcePath}`, { env: process.env }).toString());

        testSubject.run();
        expect(testSubject.succeeded).toBe(true);
        expect(testSubject.warningIssues.length).toBe(0);
        expect(testSubject.errorIssues.length).toBe(0);
        expect(testSubject.stdOutContained('https://www.washington.edu/accesscomputing/AU/before.html')).toBe(true);
    });
});
