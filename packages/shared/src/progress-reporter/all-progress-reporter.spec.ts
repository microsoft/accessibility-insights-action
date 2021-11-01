// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { CombinedReportParameters } from 'accessibility-insights-report';
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { AllProgressReporter } from './all-progress-reporter';
import { ProgressReporter } from './progress-reporter';

/* eslint-disable @typescript-eslint/no-unused-vars */

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

    describe('complete', () => {
        const failingReporterError = new Error('error from failingReporter');
        const failingReporter = {
            completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
                throw failingReporterError;
            },
        } as ProgressReporter;

        it('should invoke all reporters', async () => {
            const axeResults = 'axe results' as unknown as CombinedReportParameters;
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.completeRun(axeResults))
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            await testSubject.completeRun(axeResults);
        });

        it('should invoke all reporters when baselineEvaluation is available', async () => {
            const axeResults = 'axe results' as unknown as CombinedReportParameters;
            const baselineEvalStub = 'baseline evaluation' as unknown as BaselineEvaluation;

            progressReporterMock
                .setup((p) => p.completeRun(axeResults, baselineEvalStub))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());

            await testSubject.completeRun(axeResults, baselineEvalStub);
        });

        it('should invoke subsequent reporters even if the first one throws', async () => {
            const testSubject = new AllProgressReporter([failingReporter, progressReporterMock.object]);
            const axeResults = 'axe results' as unknown as CombinedReportParameters;
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.completeRun(axeResults))
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.completeRun(axeResults)).rejects.toThrowError(failingReporterError);
        });

        it('should rethrow an AggregateError if multiple reporters throw', async () => {
            const testSubject = new AllProgressReporter([failingReporter, failingReporter]);

            await expect(testSubject.completeRun({} as CombinedReportParameters)).rejects.toThrowErrorMatchingInlineSnapshot(`
                        "Multiple progress reporters encountered Errors
                            error from failingReporter
                            error from failingReporter"
                    `);
        });
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
