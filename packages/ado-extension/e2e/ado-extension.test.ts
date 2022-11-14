// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';
import * as ttm from './mock-test';

describe('Sample task tests', () => {
    it('should succeed with simple inputs', (done) => {
        const compiledSourcePath = path.join(__dirname, 'run-simple-inputs.js');
        const testSubject: ttm.MockTestRunner = new ttm.MockTestRunner(compiledSourcePath);

        testSubject.run();

        // Uncomment the following line to debug e2e tests:
        // console.log(testSubject);

        expect(testSubject.warningIssues.length).toEqual(0);
        expect(testSubject.errorIssues.length).toEqual(1);
        expect(
            testSubject.stdOutContained(
                'Accessibility scanning of URL https://www.washington.edu/accesscomputing/AU/before.html completed',
            ),
        ).toBeTruthy();
        expect(testSubject.stdOutContained('Rules: 4 with failures, 14 passed, 35 not applicable')).toBeTruthy();

        done();
    });
});
