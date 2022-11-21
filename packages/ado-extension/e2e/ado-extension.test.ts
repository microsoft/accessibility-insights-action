// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';
import * as ttm from './mock-test';

describe('Sample task tests', () => {
    let inputs: { [key: string]: string } = {};
    beforeEach(() => {
        inputs = {};
    });
    it('should succeed with simple inputs', () => {
        inputs = {
            url: 'https://www.washington.edu/accesscomputing/AU/before.html',
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(
            testSubject.stdOutContained(
                'Accessibility scanning of URL https://www.washington.edu/accesscomputing/AU/before.html completed',
            ),
        ).toBeTruthy();
        expect(testSubject.stdOutContained('Rules: 4 with failures, 14 passed, 35 not applicable')).toBeTruthy();
    });

    it('should succeed with staticSiteDir inputs', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(testSubject.stdOutContained('Accessibility scanning of URL http://localhost:39983/ completed')).toBeTruthy();
        expect(testSubject.stdOutContained('Rules: 4 with failures, 12 passed, 38 not applicable')).toBeTruthy();
    });

    it('limits the number of pages crawled and scanned when maxUrls input is set', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
            maxUrls: '2',
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(testSubject.stdOutContained('Accessibility scanning of URL http://localhost:39983/ completed')).toBeTruthy();
        expect(testSubject.stdOutContained('URLs: 1 with failures, 1 passed, 0 not scannable')).toBeTruthy();
    });

    it('only scans the inputUrls when maxUrls input matches number of inputUrls, (url input can be anything)', () => {
        inputs = {
            url: 'https://www.washington.edu', // this input must be set to something, but it is ignored
            inputUrls: 'https://www.washington.edu/accesscomputing/AU/before.html https://www.washington.edu/accesscomputing/AU/after.html',
            maxUrls: '2', //By setting `maxUrls` to 2, only the `inputUrls` will be scanned
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(testSubject.stdOutContained('Processing page https://www.washington.edu/accesscomputing/AU/after.html')).toBeTruthy();
        expect(testSubject.stdOutContained('Processing page https://www.washington.edu/accesscomputing/AU/before.html')).toBeTruthy();
        expect(testSubject.stdOutContained('URLs: 1 with failures, 1 passed, 0 not scannable')).toBeTruthy();
    });

    it('scans pages that are passed in as inputUrls', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
            inputUrls: 'http://localhost:39983/unlinked',
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(testSubject.stdOutContained('Processing page http://localhost:39983/unlinked/')).toBeTruthy();
        expect(testSubject.stdOutContained('Rules: 4 with failures, 12 passed, 38 not applicable')).toBeTruthy();
    });

    it('should fail if both URL and staticSiteDir are defined', () => {
        inputs = {
            url: 'https://www.washington.edu/accesscomputing/AU/before.html',
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toBeGreaterThan(0);
        expect(
            testSubject.stdOutContained(
                'A configuration error has occurred, only one of the following inputs can be set at a time: url or staticSiteDir',
            ),
        ).toBeTruthy();
    });

    it('should find no additional failures when a baseline is properly configured', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
            baselineFile: path.join(__dirname, '..', '..', '..', 'dev', 'website-baselines', 'e2e-baseline-1.baseline'),
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(0);
        expect(
            testSubject.stdOutContained('No failures were detected by automatic scanning except those which exist in the baseline.'),
        ).toBeTruthy();
        expect(testSubject.stdOutContained('8 failure instances in baseline')).toBeTruthy();
    });

    it('should find additional failures when the baseline does not cover all failures', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
            baselineFile: path.join(__dirname, '..', '..', '..', 'dev', 'website-baselines', 'e2e-baseline-2.baseline'),
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(testSubject.stdOutContained('2 failure instances not in baseline')).toBeTruthy();
        expect(testSubject.stdOutContained('6 failure instances in baseline')).toBeTruthy();
    });

    it('should fail scan and generate a baseline file if baselineFile input is specified and file does not exist', () => {
        inputs = {
            staticSiteDir: path.join(__dirname, '..', '..', '..', 'dev', 'website-root'),
            staticSitePort: '39983',
            baselineFile: path.join(__dirname, '..', '..', '..', 'dev', 'website-baselines', 'e2e-baseline-that-does-not-exist.baseline'),
        };
        const testSubject = runTestWithInputs(inputs);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues[0]).toEqual('Scan failed');
        expect(testSubject.stdOutContained('##[debug]Saved new baseline file at')).toBeTruthy();
        expect(testSubject.stdOutContained('8 failure instances')).toBeTruthy();
    });

    function runTestWithInputs(inputs?: { [key: string]: string }): ttm.MockTestRunner {
        const compiledSourcePath = path.join(__dirname, 'mock-test-runner.js');
        const testSubject: ttm.MockTestRunner = new ttm.MockTestRunner(compiledSourcePath, inputs);

        testSubject.run();

        formatStdout(testSubject.stdout);

        return testSubject;
    }
});

// Format stdout for ADO:
// Prevent errors from stdout from being marked as pipeline failures
function formatStdout(stdout: string) {
    console.log('##[group]Test output');
    console.log(
        stdout.replace(/##vso\[task.issue type=error;\]/g, '##[error]').replace(/##vso\[task.complete result=Failed;\]/g, '##[error]'),
    );
    console.log('##[endgroup]');
}
