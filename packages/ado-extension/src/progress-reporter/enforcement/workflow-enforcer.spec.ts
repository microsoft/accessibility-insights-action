// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { WorkflowEnforcer } from './workflow-enforcer';

describe(WorkflowEnforcer, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let adoTaskMock: IMock<typeof adoTask>;
    let workflowEnforcer: WorkflowEnforcer;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        adoTaskMock = Mock.ofType<typeof adoTask>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('should initialize', () => {
            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('should succeed if baseline is not enabled', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
            } as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterDoesNotExist();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('should succeed in happy path', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
            } as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.completeRun(reportStub, baselineEvaluationStub);

            verifyAllMocks();
        });

        it('should throw error if baseline needs to be updated', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;

            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await expect(workflowEnforcer.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
                'Failed: The baseline file needs to be updated. See the PR comments for more details.',
            );

            verifyAllMocks();
        });

        it('should throw error if accessibiity error occurred', async () => {
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
    });

    describe('failRun', () => {
        it('reject promise with matching error', async () => {
            workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await expect(workflowEnforcer.failRun('message')).rejects.toThrowError('message');
            verifyAllMocks();
        });
    });

    const buildWorkflowEnforcerWithMocks = () => new WorkflowEnforcer(adoTaskConfigMock.object, adoTaskMock.object);

    const verifyAllMocks = () => {
        adoTaskMock.verifyAll();
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
