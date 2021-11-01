// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { WorkflowEnforcer } from './workflow-enforcer';

describe(WorkflowEnforcer, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let workflowEnforcer: WorkflowEnforcer;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('initializes', () => {
            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('throws correct error if accessibility error occurred', async () => {
            const reportStub = {
                results: {
                    urlResults: {
                        failedUrls: 1,
                    },
                },
            } as unknown as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            setupFailOnAccessibilityError(true);

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await expect(workflowEnforcer.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
                'Failed Accessibility Error',
            );

            verifyAllMocks();
        });

        it('throws correct error if baseline needs to be updated', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await expect(workflowEnforcer.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
                'Failed: The baseline file does not match scan results. If this is a PR, check the PR comments.',
            );

            verifyAllMocks();
        });

        it('succeeds in happy path (baseline enabled)', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('succeeds in happy path (baseline not enabled)', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {} as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterDoesNotExist();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('reject promise with matching error', async () => {
            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await expect(workflowEnforcer.failRun('message')).rejects.toThrowError('message');
            verifyAllMocks();
        });
    });

    const buildWorkflowEnforcerWithMocks = () => new WorkflowEnforcer(adoTaskConfigMock.object);

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

    const setupBaselineFileParameterDoesNotExist = () => {
        adoTaskConfigMock
            .setup((o) => o.getBaselineFile())
            .returns(() => undefined)
            .verifiable(Times.atLeastOnce());
    };
});
