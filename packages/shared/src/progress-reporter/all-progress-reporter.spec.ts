// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import { AllProgressReporter } from './all-progress-reporter';
import { ProgressReporter } from './progress-reporter';

describe(AllProgressReporter, () => {
    let testSubject: AllProgressReporter;
    let progressReporterMock: IMock<ProgressReporter>;

    beforeEach(() => {
        progressReporterMock = Mock.ofType<ProgressReporter>();
        testSubject = new AllProgressReporter([progressReporterMock.object]);
    });

    it('start should invoke all reporters', async () => {
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.start())
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.start();
    });

    it('complete should invoke all reporters', async () => {
        const axeResults = 'axe results' as any;
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.completeRun(axeResults))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.completeRun(axeResults);
    });

    it('failRun should invoke all reporters', async () => {
        const error = 'scan error';
        executeOnReporter((reporter) => {
            reporter
                .setup((p) => p.failRun(error))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());
        });

        await testSubject.failRun(error);
    });

    afterEach(() => {
        progressReporterMock.verifyAll();
    });

    function executeOnReporter(callback: (reporter: IMock<ProgressReporter>) => void): void {
        callback(progressReporterMock);
    }
});
