// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { AdoConsoleCommentCreator } from './ado-console-comment-creator';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import * as fs from 'fs';
import * as path from 'path';

import { RecordingTestLogger, ReportConsoleLogConvertor, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

describe(AdoConsoleCommentCreator, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let logger: RecordingTestLogger;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let reportConsoleLogConvertorMock: IMock<ReportConsoleLogConvertor>;
    let testSubject: AdoConsoleCommentCreator;
    let fsMock: IMock<typeof fs>;
    let pathStub: typeof path;

    const defaultReportOutDir = 'reportOutDir';
    const reportStub: CombinedReportParameters = {
        results: {
            urlResults: {
                failedUrls: 1,
            },
        },
    } as CombinedReportParameters;
    const baselineInfoStub = {};
    const reportMarkdownStub = '#ReportMarkdownStub';
    const reportConsoleLogStub = 'Report Console Log Stub';
    const baselineFilenameStub = 'baselineFilenameStub.baseline';

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>();
        logger = new RecordingTestLogger();
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
        reportConsoleLogConvertorMock = Mock.ofType<ReportConsoleLogConvertor>(undefined, MockBehavior.Strict);
        fsMock = Mock.ofType<typeof fs>();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pathStub = { join: (...paths) => paths.join('/'), basename: (filepath) => baselineFilenameStub } as typeof path;

        reportMarkdownConvertorMock
            .setup((o) => o.convert(reportStub, undefined, baselineInfoStub))
            .returns(() => reportMarkdownStub)
            .verifiable(Times.atMostOnce());

        reportConsoleLogConvertorMock
            .setup((o) => o.convert(reportStub, undefined, baselineInfoStub))
            .returns(() => reportConsoleLogStub)
            .verifiable(Times.atMostOnce());

        testSubject = new AdoConsoleCommentCreator(
            adoTaskConfigMock.object,
            reportMarkdownConvertorMock.object,
            reportConsoleLogConvertorMock.object,
            logger,
            fsMock.object,
            pathStub,
        );
    });

    describe('completeRun', () => {
        it.each`
            uploadOutputArtifact | outputArtifactName         | jobAttempt | expectedSummaryFilePath
            ${false}             | ${'accessibility-reports'} | ${1}       | ${'reportOutDir/Accessibility Insights scan summary.md'}
            ${false}             | ${'custom-artifact'}       | ${1}       | ${'reportOutDir/Accessibility Insights scan summary.md'}
            ${false}             | ${'accessibility-reports'} | ${2}       | ${'reportOutDir/Accessibility Insights scan summary.md'}
            ${true}              | ${'accessibility-reports'} | ${1}       | ${'reportOutDir/Accessibility Insights scan summary.md'}
            ${true}              | ${'custom-artifact'}       | ${1}       | ${'reportOutDir/Accessibility Insights scan summary (custom-artifact).md'}
            ${true}              | ${'accessibility-reports'} | ${2}       | ${'reportOutDir/Accessibility Insights scan summary (accessibility-reports-2).md'}
        `(
            'should create and upload a job summary with the expected filename for inputs uploadOutputArtifact=$uploadOutputArtifact, outputArtifactName=$outputArtifactName, jobAttempt=$jobAttempt',
            async ({ uploadOutputArtifact, outputArtifactName, jobAttempt, expectedSummaryFilePath }) => {
                setupTaskConfig({
                    uploadOutputArtifact,
                    outputArtifactName,
                    jobAttempt,
                });

                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fsMock.setup((fsm) => fsm.writeFileSync(expectedSummaryFilePath, reportMarkdownStub)).verifiable(Times.once());

                await testSubject.completeRun(reportStub);

                expect(logger.recordedLogs()).toContain(`[info] ##vso[task.uploadsummary]${expectedSummaryFilePath}`);
                verifyAllMocks();
            },
        );

        it.each`
            outputArtifactName         | jobAttempt | expectedArtifactName
            ${'accessibility-reports'} | ${1}       | ${'accessibility-reports'}
            ${'custom-artifact'}       | ${1}       | ${'custom-artifact'}
            ${'accessibility-reports'} | ${2}       | ${'accessibility-reports-2'}
            ${'custom-artifact'}       | ${2}       | ${'custom-artifact-2'}
        `(
            'should upload an artifact with the expected name for inputs uploadOutputArtifact=true, outputArtifactName=$outputArtifactName, jobAttempt=$jobAttempt',
            async ({ outputArtifactName, jobAttempt, expectedArtifactName }) => {
                setupTaskConfig({
                    uploadOutputArtifact: true,
                    outputArtifactName,
                    jobAttempt,
                });

                await testSubject.completeRun(reportStub);

                expect(logger.recordedLogs()).toContain(
                    `[info] ##vso[artifact.upload artifactname=${expectedArtifactName}]${defaultReportOutDir}/index.html`,
                );
                verifyAllMocks();
            },
        );

        it.each`
            outputArtifactName         | jobAttempt
            ${'accessibility-reports'} | ${1}
            ${'custom-artifact'}       | ${1}
            ${'accessibility-reports'} | ${2}
            ${'custom-artifact'}       | ${2}
        `(
            'should not upload an artifact inputs uploadOutputArtifact=false, outputArtifactName=$outputArtifactName, jobAttempt=$jobAttempt',
            async ({ outputArtifactName, jobAttempt }) => {
                setupTaskConfig({
                    uploadOutputArtifact: false,
                    outputArtifactName,
                    jobAttempt,
                });

                await testSubject.completeRun(reportStub);

                expect(logger.recordedLogs()).not.toContain(/##vso\[artifact.upload/);
                verifyAllMocks();
            },
        );

        it('should upload snapshot artifacts but not other files in the directory when snapshot is set to true and uploadOutputArtifact is set to true', async () => {
            setupTaskConfig({
                uploadOutputArtifact: true,
                outputArtifactName: 'accessibility-reports',
                jobAttempt: 1,
                snapshot: true,
            });

            const snapshotDirectory = `${defaultReportOutDir}/key_value_stores/scan-results`;

            fsMock
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                .setup((fsm) => fsm.existsSync(`${snapshotDirectory}`))
                .returns(() => true)
                .verifiable(Times.once());

            fsMock
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                .setup((fsm) => fsm.readdirSync(`${snapshotDirectory}`))
                .returns(() => ['snapshot1.screenshot.jpg', 'snapshot2.screenshot.jpg', 'this-is-not-a-snapshot.txt'])
                .verifiable(Times.once());

            await testSubject.completeRun(reportStub);

            expect(logger.recordedLogs()).toContain(
                `[info] ##vso[artifact.upload artifactname=accessibility-reports-snapshots]${snapshotDirectory}/snapshot1.screenshot.jpg`,
            );
            expect(logger.recordedLogs()).toContain(
                `[info] ##vso[artifact.upload artifactname=accessibility-reports-snapshots]${snapshotDirectory}/snapshot2.screenshot.jpg`,
            );
            expect(logger.recordedLogs()).not.toContain(
                `[info] ##vso[artifact.upload artifactname=accessibility-reports-snapshots]${snapshotDirectory}/this-is-not-a-snapshot.txt`,
            );

            verifyAllMocks();
        });

        it.each`
            uploadOutputArtifact | snapshot
            ${true}              | ${false}
            ${false}             | ${true}
        `(
            'should not attempt snapshot upload logic when uploadOutputArtifact=$uploadOutputArtifact, snapshot=$snapshot',
            async ({ uploadOutputArtifact, snapshot }) => {
                setupTaskConfig({
                    uploadOutputArtifact: uploadOutputArtifact,
                    outputArtifactName: 'accessibility-reports',
                    jobAttempt: 1,
                    snapshot: snapshot,
                });

                const snapshotDirectory = `${defaultReportOutDir}/key_value_stores/scan-results`;

                fsMock
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    .setup((fsm) => fsm.existsSync(`${snapshotDirectory}`))
                    .returns(() => true)
                    .verifiable(Times.never());

                await testSubject.completeRun(reportStub);

                verifyAllMocks();
            },
        );

        it.each`
            baselineFileExists
            ${true}
            ${false}
        `(
            'should conditionally upload baseline artifact when filename set: baselineFileExists=$baselineFileExists',
            async ({ baselineFileExists }) => {
                setupTaskConfig({
                    uploadOutputArtifact: true,
                    outputArtifactName: 'accessibility-reports',
                    jobAttempt: 1,
                    baselineFile: baselineFilenameStub,
                });

                const baselineEvaluationStub = {
                    suggestedBaselineUpdate: null,
                    newViolationsByRule: {},
                    fixedViolationsByRule: {},
                    totalNewViolations: 1,
                    totalFixedViolations: 1,
                } as BaselineEvaluation;

                const baselineInfoWithEvalStub = { baselineFileName: baselineFilenameStub, baselineEvaluation: baselineEvaluationStub };

                reportMarkdownConvertorMock
                    .setup((o) => o.convert(reportStub, undefined, baselineInfoWithEvalStub))
                    .returns(() => reportMarkdownStub)
                    .verifiable(Times.atMostOnce());

                reportConsoleLogConvertorMock
                    .setup((o) => o.convert(reportStub, undefined, baselineInfoWithEvalStub))
                    .returns(() => reportConsoleLogStub)
                    .verifiable(Times.atMostOnce());

                const expectedBaselineOutputFilePath = `${defaultReportOutDir}/${baselineFilenameStub}`;

                fsMock
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    .setup((fsm) => fsm.existsSync(`${expectedBaselineOutputFilePath}`))
                    .returns(() => baselineFileExists as boolean)
                    .verifiable(Times.once());

                await testSubject.completeRun(reportStub, baselineEvaluationStub);
                if (baselineFileExists) {
                    expect(logger.recordedLogs()).toContain(
                        `[info] ##vso[artifact.upload artifactname=accessibility-reports]${expectedBaselineOutputFilePath}`,
                    );
                } else {
                    expect(logger.recordedLogs()).not.toContain(
                        `[info] ##vso[artifact.upload artifactname=accessibility-reports]${expectedBaselineOutputFilePath}`,
                    );
                }

                verifyAllMocks();
            },
        );
    });

    describe('failRun', () => {
        it('does nothing interesting', async () => {
            await testSubject.failRun();

            expect(logger.recordedLogs()).toStrictEqual([]);
            verifyAllMocks();
        });
    });

    describe('didScanSucceed', () => {
        it('returns true by default', async () => {
            await expect(testSubject.didScanSucceed()).resolves.toBe(true);

            verifyAllMocks();
        });

        it('returns true after failRun() is called', async () => {
            await testSubject.failRun();

            await expect(testSubject.didScanSucceed()).resolves.toBe(true);

            verifyAllMocks();
        });
    });

    function setupTaskConfig(config: {
        uploadOutputArtifact: boolean;
        outputArtifactName: string;
        jobAttempt: number;
        baselineFile?: string;
        reportOutDir?: string;
        snapshot?: boolean;
    }): void {
        adoTaskConfigMock.setup((atcm) => atcm.getUploadOutputArtifact()).returns(() => config.uploadOutputArtifact);

        adoTaskConfigMock.setup((atcm) => atcm.getVariable('System.JobAttempt')).returns(() => `${config.jobAttempt}`);

        adoTaskConfigMock.setup((atcm) => atcm.getOutputArtifactName()).returns(() => config.outputArtifactName);

        adoTaskConfigMock.setup((atcm) => atcm.getBaselineFile()).returns(() => config.baselineFile);

        adoTaskConfigMock.setup((atcm) => atcm.getReportOutDir()).returns(() => config.reportOutDir ?? defaultReportOutDir);

        adoTaskConfigMock.setup((atcm) => atcm.getSnapshot()).returns(() => config.snapshot ?? false);
    }

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        reportConsoleLogConvertorMock.verifyAll();
        fsMock.verifyAll();
    };
});
