// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { WorkflowEnforcer } from './workflow-enforcer';
import { Logger } from '@accessibility-insights-action/shared';

describe(WorkflowEnforcer, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let loggerMock: IMock<Logger>;
    let workflowEnforcer: WorkflowEnforcer;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('initializes', () => {
            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('logs correct error if accessibility error occurred', async () => {
            const reportStub = {
                results: {
                    urlResults: {
                        failedUrls: 1,
                    },
                },
            } as unknown as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            setupFailOnAccessibilityError(true);
            setupLoggerWithErrorMessage('An accessibility error was found and you specified the "failOnAccessibilityError" flag.');

            const workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('logs correct error if baseline needs to be updated', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();
            loggerMock
                .setup((o) =>
                    o.logInfo(`##vso[task.logissue type=error;sourcepath=baseline-file] The baseline file does not match scan results.`),
                )
                .verifiable(Times.once());

            const workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds in happy path (baseline enabled)', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            const workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds in happy path (baselineEvaluation not provided)', async () => {
            const reportStub = {} as CombinedReportParameters;

            setupFailOnAccessibilityError(false);

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub);

            verifyAllMocks();
        });
    });

    describe('didScanSucceed', () => {
        it('returns true by default', async () => {
            const workflowEnforcer = buildWorkflowEnforcerWithMocks();
            await expect(workflowEnforcer.didScanSucceed()).resolves.toBe(true);
        });

        it('returns false after failRun() is called', async () => {
            const workflowEnforcer = buildWorkflowEnforcerWithMocks();
            await workflowEnforcer.failRun();
            await expect(workflowEnforcer.didScanSucceed()).resolves.toBe(false);
        });
    });

    const buildWorkflowEnforcerWithMocks = () => new WorkflowEnforcer(adoTaskConfigMock.object, loggerMock.object);

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
    };

    const setupFailOnAccessibilityError = (fail: boolean) => {
        adoTaskConfigMock
            .setup((o) => o.getFailOnAccessibilityError())
            .returns(() => fail)
            .verifiable(Times.atLeastOnce());
    };

    const setupBaselineFileParameterExists = () => {
        adoTaskConfigMock
            .setup((o) => o.getBaselineFile())
            .returns(() => 'baseline-file')
            .verifiable(Times.atLeastOnce());
    };

    const setupLoggerWithErrorMessage = (message: string) => {
        loggerMock.setup((o) => o.logError(message)).verifiable(Times.once());
    };
});
