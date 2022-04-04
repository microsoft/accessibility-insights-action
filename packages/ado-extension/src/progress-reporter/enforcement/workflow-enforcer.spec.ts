// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { BaselineEvaluation, BaselineFileContent } from 'accessibility-insights-scan';
import { WorkflowEnforcer } from './workflow-enforcer';
import { Logger } from '@accessibility-insights-action/shared';
import { times } from 'lodash';

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

    describe('start', () => {
        it.each`
            input                          | hostingMode      | staticSiteDir      | staticSitePort | staticSiteUrlRelativePath      | url
            ${'url'}                       | ${'staticSite'}  | ${undefined}       | ${undefined}   | ${'/'}                         | ${'url'}
            ${'staticSiteDir'}             | ${'dynamicSite'} | ${'staticSiteDir'} | ${undefined}   | ${'/'}                         | ${undefined}
            ${'staticSitePort'}            | ${'dynamicSite'} | ${undefined}       | ${100}         | ${'/'}                         | ${undefined}
            ${'staticSiteUrlRelativePath'} | ${'dynamicSite'} | ${undefined}       | ${undefined}   | ${'staticSiteUrlRelativePath'} | ${undefined}
        `(
            `returns correct error if '$input' is configured in '$hostingMode' mode`,
            async ({ input, hostingMode, staticSiteDir, staticSitePort, staticSiteUrlRelativePath, url }) => {
                adoTaskConfigMock
                    .setup((o) => o.getUrl())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => url);
                adoTaskConfigMock
                    .setup((o) => o.getHostingMode())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => hostingMode);
                adoTaskConfigMock
                    .setup((o) => o.getStaticSiteDir())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => staticSiteDir);
                adoTaskConfigMock
                    .setup((o) => o.getStaticSitePort())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => staticSitePort);
                adoTaskConfigMock
                    .setup((o) => o.getStaticSiteUrlRelativePath())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => staticSiteUrlRelativePath);
                adoTaskConfigMock.setup((o) => o.getFailOnAccessibilityError()).returns(() => true);
                loggerMock
                    .setup((o) =>
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        o.logError(`A configuration error has occurred ${input} cannot be set in ${hostingMode} mode`),
                    )
                    .verifiable(Times.once());

                const workflowEnforcer = buildWorkflowEnforcerWithMocks();

                await workflowEnforcer.start();

                loggerMock.verifyAll();
            },
        );

        it('return correct error if staticSiteDir and Url are set at the same time', async () => {
            setUpGetStaticSiteDir();
            setUpGetUrl();
            setupLoggerWithErrorMessage(`A configuration error has occurred, Url and staticSiteDir inputs cannot be set at the same time`);
            setUpGetHostingMode();
            setUpGetStaticSitePort();
            setUpGetStaticSiteUrlRelativePath();

            const workflowEnforcer = buildWorkflowEnforcerWithMocks();

            await workflowEnforcer.start();

            loggerMock.verifyAll();
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

    const setUpGetUrl = () => {
        adoTaskConfigMock
            .setup((o) => o.getUrl())
            .returns(() => 'url')
            .verifiable(Times.atLeastOnce());
    };

    const setUpGetStaticSiteDir = () => {
        adoTaskConfigMock
            .setup((o) => o.getStaticSiteDir())
            .returns(() => 'static-site-dir')
            .verifiable(Times.atLeastOnce());
    };

    const setUpGetHostingMode = (mode?: string) => {
        adoTaskConfigMock
            .setup((o) => o.getHostingMode())
            .returns(() => mode)
            .verifiable(Times.atLeastOnce());
    };

    const setUpGetStaticSitePort = () => {
        adoTaskConfigMock
            .setup((o) => o.getStaticSitePort())
            .returns(() => 1)
            .verifiable(Times.atLeastOnce());
    };

    const setUpGetStaticSiteUrlRelativePath = () => {
        adoTaskConfigMock
            .setup((o) => o.getStaticSiteUrlRelativePath())
            .returns(() => 'url-relative-path')
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
