// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { WorkflowEnforcement } from './workflow-enforcement';

describe(WorkflowEnforcement, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let adoTaskMock: IMock<typeof adoTask>;
    let workflowEnforcement: WorkflowEnforcement;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        adoTaskMock = Mock.ofType<typeof adoTask>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('should not initialize if isSupported returns false', () => {
            setupIsSupportedReturnsFalse();

            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true', () => {
            setupIsSupportedReturnsTrue();

            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('should do nothing if isSupported returns false', async () => {
            const reportStub: CombinedReportParameters = {} as CombinedReportParameters;
            setupIsSupportedReturnsFalse();
            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            await workflowEnforcement.completeRun(reportStub);

            verifyAllMocks();
        });

        it('should throw error if baseline needs to be updated', async () => {
            const reportStub = {} as CombinedReportParameters;
            const baselineEvaluationStub = {
                suggestedBaselineUpdate: {} as BaselineFileContent,
            } as BaselineEvaluation;

            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(false);
            setupBaselineFileParameterExists();

            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            await expect(workflowEnforcement.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
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

            setupIsSupportedReturnsTrue();
            setupFailOnAccessibilityError(true);

            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            await expect(workflowEnforcement.completeRun(reportStub, baselineEvaluationStub)).rejects.toThrowError(
                'Failed Accessibility Error',
            );

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('do nothing if isSupported returns false', async () => {
            setupIsSupportedReturnsTrue();
            setupIsSupportedReturnsFalse();

            workflowEnforcement = buildWorkflowEnforcementWithMocks();
            await workflowEnforcement.failRun('message');

            verifyAllMocks();
        });

        it('reject promise with matching error', async () => {
            setupIsSupportedReturnsTrue();

            workflowEnforcement = buildWorkflowEnforcementWithMocks();

            await expect(workflowEnforcement.failRun('message')).rejects.toThrowError('message');
            verifyAllMocks();
        });
    });

    const buildWorkflowEnforcementWithMocks = () => new WorkflowEnforcement(adoTaskConfigMock.object, adoTaskMock.object);

    const verifyAllMocks = () => {
        adoTaskMock.verifyAll();
        adoTaskConfigMock.verifyAll();
    };

    const setupIsSupportedReturnsTrue = () => {
        adoTaskMock
            .setup((o) => o.getVariable('Build.Reason'))
            .returns(() => 'PullRequest')
            .verifiable(Times.atLeastOnce());
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

    const setupIsSupportedReturnsFalse = () => {
        adoTaskMock
            .setup((o) => o.getVariable('Build.Reason'))
            .returns(() => 'CI')
            .verifiable(Times.atLeastOnce());
    };
});
