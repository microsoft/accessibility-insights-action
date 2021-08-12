// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import fs from 'fs';

describe('Sample task tests', function () {
    it('should succeed with simple inputs', function (done: Mocha.Done) {
        const compiledSourcePath = path.join(__dirname, 'run.js');

        // test need a yarn build run before
        expect(fs.existsSync(compiledSourcePath)).toBe(true);

        const testSubject: ttm.MockTestRunner = new ttm.MockTestRunner(compiledSourcePath);

        testSubject.run();
        console.log(testSubject.succeeded);
        assert.equal(testSubject.succeeded, true, 'should have succeeded');
        assert.equal(testSubject.warningIssues.length, 0, 'should have no warnings');
        assert.equal(testSubject.errorIssues.length, 0, 'should have no errors');
        assert.equal(
            testSubject.stdOutContained('https://www.washington.edu/accesscomputing/AU/before.html'),
            true,
            'should display the input url',
        );
        done();
    });
});
