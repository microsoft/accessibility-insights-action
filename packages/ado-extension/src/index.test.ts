import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import 'reflect-metadata';

describe('Sample task tests', function () {
    it('should succeed with simple inputs', function (done: Mocha.Done) {
        let tp = path.join(__dirname, 'run.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
        assert.equal(tr.errorIssues.length, 0, 'should have no errors');
        console.log('STDOUT' + tr.stdout);
        assert.equal(tr.stdOutContained('Hello World'), true, 'should display Hello World');
        done();
    });
});
