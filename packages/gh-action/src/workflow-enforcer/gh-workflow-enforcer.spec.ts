// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, IMock, MockBehavior } from 'typemoq';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { GHWorkflowEnforcer } from './gh-workflow-enforcer';
import { RecordingTestLogger } from '@accessibility-insights-action/shared';
import { GHTaskConfig } from '../task-config/gh-task-config';

describe(GHWorkflowEnforcer, () => {
    let adoTaskConfigMock: IMock<GHTaskConfig>;
    let logger: RecordingTestLogger;
    let testSubject: GHWorkflowEnforcer;

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

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<GHTaskConfig>(undefined, MockBehavior.Strict);
        logger = new RecordingTestLogger();
        testSubject = new GHWorkflowEnforcer(adoTaskConfigMock.object, logger);
    });

    describe('completeRun', () => {
        it('fails with pinned error log if accessibility error occurs and failOnAccessibilityError=true', async () => {
            setupFailOnAccessibilityErrorInput(true);

            await testSubject.completeRun(reportWithErrors);

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
                await testSubject.completeRun(report);

                expect(logger.recordedLogs()).toStrictEqual([]);
                await expect(testSubject.didScanSucceed()).resolves.toBe(true);
            },
        );
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
});
