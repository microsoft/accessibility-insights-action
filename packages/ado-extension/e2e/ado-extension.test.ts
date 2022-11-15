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

    function runTestWithInputs(inputs?: { [key: string]: string }): ttm.MockTestRunner {
        const compiledSourcePath = path.join(__dirname, 'mock-test-runner.js');
        const testSubject: ttm.MockTestRunner = new ttm.MockTestRunner(compiledSourcePath, inputs);

        testSubject.run();

        console.log(testSubject.stdout);
        return testSubject;
    }
});
