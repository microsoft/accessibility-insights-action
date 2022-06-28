// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { AdoWorkflowEnforcer } from './ado-workflow-enforcer';
import { RecordingTestLogger } from '@accessibility-insights-action/shared';

describe(AdoWorkflowEnforcer, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let logger: RecordingTestLogger;
    let testSubject: AdoWorkflowEnforcer;

    const reportWithErrors = {
        results: {
            urlResults: {
                failedUrls: 1,
            },
        },
    } as unknown as CombinedReportParameters;
    const reportWithoutErrors = {
        results: {
            urlResults: {
                failedUrls: 0,
            },
        },
    } as unknown as CombinedReportParameters;
    const emptyBaselineEvaluation = {} as BaselineEvaluation;
    const baselineEvaluationWithSuggestedUpdate = {
        suggestedBaselineUpdate: {} as BaselineFileContent,
    } as BaselineEvaluation;
    const baselineEvaluationWithoutSuggestedUpdate = {
        suggestedBaselineUpdate: null,
    } as BaselineEvaluation;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        logger = new RecordingTestLogger();
        testSubject = new AdoWorkflowEnforcer(adoTaskConfigMock.object, logger);
    });

    describe('completeRun', () => {
        describe('without baseline', () => {
            beforeEach(() => {
                setupBaselineFileInput(undefined);
            });

            it('fails with pinned error log if accessibility error occurs and failOnAccessibilityError=true', async () => {
                setupFailOnAccessibilityErrorInput(true);

                await testSubject.completeRun(reportWithErrors, emptyBaselineEvaluation);

                expect(logger.recordedLogs()).toMatchSnapshot();
                await expect(testSubject.didScanSucceed()).resolves.toBe(false);
            });

            it.each`
                accessibilityErrorExists | failOnAccessibilityError
                ${true}                  | ${false}
                ${false}                 | ${false}
                ${false}                 | ${true}
            `(
                'succeeds silently when accessibilityErrorExists=$accessibilityErrorExists and failOnAccessibilityError=$failOnAccessibilityError',
                async ({ accessibilityErrorExists, failOnAccessibilityError }) => {
                    setupFailOnAccessibilityErrorInput(failOnAccessibilityError);

                    const report = accessibilityErrorExists ? reportWithErrors : reportWithoutErrors;
                    await testSubject.completeRun(report, emptyBaselineEvaluation);

                    expect(logger.recordedLogs()).toStrictEqual([]);
                    await expect(testSubject.didScanSucceed()).resolves.toBe(true);
                },
            );
        });

        // All baseline behavior should be independent of failOnAccessibilityError
        describe.each([true, false])('with baseline and failOnAccessibilityError=%p', (failOnAccessibilityError) => {
            beforeEach(() => {
                setupBaselineFileInput('/some/file');
                setupFailOnAccessibilityErrorInput(failOnAccessibilityError);
            });

            it('fails with pinned error log if baseline needs to be updated', async () => {
                await testSubject.completeRun(reportWithErrors, baselineEvaluationWithSuggestedUpdate);

                expect(logger.recordedLogs()).toMatchSnapshot();
                await expect(testSubject.didScanSucceed()).resolves.toBe(false);
            });

            it('succeeds silently if baseline does not need update', async () => {
                await testSubject.completeRun(reportWithErrors, baselineEvaluationWithoutSuggestedUpdate);

                expect(logger.recordedLogs()).toStrictEqual([]);
                await expect(testSubject.didScanSucceed()).resolves.toBe(true);
            });
        });
    });

    describe('didScanSucceed', () => {
        it('returns true by default', async () => {
            await expect(testSubject.didScanSucceed()).resolves.toBe(true);
        });

        it('returns false after failRun() is called', async () => {
            await testSubject.failRun();
            await expect(testSubject.didScanSucceed()).resolves.toBe(false);
        });
    });

    const setupFailOnAccessibilityErrorInput = (fail: boolean) => {
        adoTaskConfigMock.setup((o) => o.getFailOnAccessibilityError()).returns(() => fail);
    };

    const setupBaselineFileInput = (baselineFile: undefined | string) => {
        adoTaskConfigMock.setup((o) => o.getBaselineFile()).returns(() => baselineFile);
    };
});
