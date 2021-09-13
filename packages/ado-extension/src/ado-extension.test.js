// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var path = require('path');
var assert = require('assert');
var ttm = require('azure-pipelines-task-lib/mock-test');
describe('Sample task tests', function () {
    it('should succeed with simple inputs', function (done) {
        var compiledSourcePath = path.join(__dirname, 'run.js');
        var testSubject = new ttm.MockTestRunner(compiledSourcePath);
        testSubject.run();
        console.log(testSubject.stdout);
        assert.strictEqual(testSubject.succeeded, true, 'should have succeeded');
        assert.strictEqual(testSubject.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(testSubject.errorIssues.length, 0, 'should have no errors');
        assert.strictEqual(testSubject.stdOutContained('installing runtime dependencies'), true, 'should install run time dependencies');
        assert.strictEqual(
            testSubject.stdOutContained('Found 4 accessibility issues on page http://localhost:'),
            true,
            'should find accessibility issues',
        );
        done();
    });
});
