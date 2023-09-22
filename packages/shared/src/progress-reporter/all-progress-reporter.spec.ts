// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { CombinedReportParameters } from 'accessibility-insights-report';
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { AllProgressReporter } from './all-progress-reporter';
import { ProgressReporter } from './progress-reporter';

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

describe(AllProgressReporter, () => {
    const axeResultsStub = 'axe results' as unknown as CombinedReportParameters;
    const baselineEvalStub = 'baseline evaluation' as unknown as BaselineEvaluation;

    const failingReporterError = new Error('error from failingReporter');
    const failingReporter = {
        async start(): Promise<void> {
            throw failingReporterError;
        },
        async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
            throw failingReporterError;
        },
        async failRun(): Promise<void> {
            throw failingReporterError;
        },
        async didScanSucceed(): Promise<boolean> {
            throw failingReporterError;
        },
    } as ProgressReporter;

    let testSubject: AllProgressReporter;
    let progressReporterMock: IMock<ProgressReporter>;

    beforeEach(() => {
        progressReporterMock = Mock.ofType<ProgressReporter>();
    });

    describe('start', () => {
        it('should invoke all reporters', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.start())
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            await testSubject.start();
        });

        it('should invoke subsequent reporters even if the first one throws', async () => {
            testSubject = new AllProgressReporter([failingReporter, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.start())
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.start()).rejects.toThrowError(failingReporterError);
        });

        it('should rethrow an AggregateError if multiple reporters throw', async () => {
            const testSubject = new AllProgressReporter([failingReporter, failingReporter]);

            await expect(testSubject.start()).rejects.toThrowErrorMatchingSnapshot();
        });
    });

    describe('complete', () => {
        it('should invoke all reporters', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.completeRun(axeResultsStub))
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            await testSubject.completeRun(axeResultsStub);
        });

        it('should invoke all reporters when baselineEvaluation is available', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object]);

            progressReporterMock
                .setup((p) => p.completeRun(axeResultsStub, baselineEvalStub))
                .returns(() => Promise.resolve())
                .verifiable(Times.once());

            await testSubject.completeRun(axeResultsStub, baselineEvalStub);
        });

        it('should invoke subsequent reporters even if the first one throws', async () => {
            testSubject = new AllProgressReporter([failingReporter, progressReporterMock.object]);

            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.completeRun(axeResultsStub))
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.completeRun(axeResultsStub)).rejects.toThrowError(failingReporterError);
        });

        it('should rethrow an AggregateError if multiple reporters throw', async () => {
            testSubject = new AllProgressReporter([failingReporter, failingReporter]);

            await expect(testSubject.completeRun(axeResultsStub)).rejects.toThrowErrorMatchingSnapshot();
        });
    });

    describe('failRun', () => {
        it('should invoke all reporters', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.failRun())
                    .returns(() => Promise.resolve())
                    .verifiable(Times.exactly(2));
            });

            await testSubject.failRun();
        });

        it('should invoke subsequent reporters even if the first one throws', async () => {
            testSubject = new AllProgressReporter([failingReporter, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.failRun())
                    .returns(() => Promise.resolve())
                    .verifiable(Times.once());
            });

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.failRun()).rejects.toThrowError(failingReporterError);
        });

        it('should rethrow an AggregateError if multiple reporters throw', async () => {
            testSubject = new AllProgressReporter([failingReporter, failingReporter]);

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.failRun()).rejects.toThrowErrorMatchingSnapshot();
        });
    });

    describe('didScanSucceed', () => {
        it('should invoke all reporters', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.didScanSucceed())
                    .returns(() => Promise.resolve(true))
                    .verifiable(Times.exactly(2));
            });

            await testSubject.didScanSucceed();
        });

        it('should invoke subsequent reporters even if the first one throws', async () => {
            testSubject = new AllProgressReporter([failingReporter, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.didScanSucceed())
                    .returns(() => Promise.resolve(true))
                    .verifiable(Times.once());
            });

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.didScanSucceed()).rejects.toThrowError(failingReporterError);
        });

        it('should rethrow an AggregateError if multiple reporters throw', async () => {
            testSubject = new AllProgressReporter([failingReporter, failingReporter]);

            // The error from the first reporter should be rethrown, but we should still see the call to the second reporter
            await expect(testSubject.didScanSucceed()).rejects.toThrowErrorMatchingSnapshot();
        });

        it('should return true if all reporters return true', async () => {
            testSubject = new AllProgressReporter([progressReporterMock.object, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.didScanSucceed())
                    .returns(() => Promise.resolve(true))
                    .verifiable(Times.exactly(2));
            });

            await expect(testSubject.didScanSucceed()).resolves.toBe(true);
        });

        it('should return false if any reporters return false', async () => {
            const returnValues = [false, true];
            let index = 0;
            testSubject = new AllProgressReporter([progressReporterMock.object, progressReporterMock.object]);
            executeOnReporter((reporter) => {
                reporter
                    .setup((p) => p.didScanSucceed())
                    .returns(() => Promise.resolve(returnValues[index++]))
                    .verifiable(Times.exactly(2));
            });

            await expect(testSubject.didScanSucceed()).resolves.toBe(false);
        });
    });

    afterEach(() => {
        progressReporterMock.verifyAll();
    });

    function executeOnReporter(callback: (reporter: IMock<ProgressReporter>) => void): void {
        callback(progressReporterMock);
    }
});
