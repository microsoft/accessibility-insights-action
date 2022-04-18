// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { AdoConsoleCommentCreator } from './ado-console-comment-creator';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as fs from 'fs';

import { Logger, ReportConsoleLogConvertor, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';

describe(AdoConsoleCommentCreator, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let loggerMock: IMock<Logger>;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let reportConsoleLogConvertorMock: IMock<ReportConsoleLogConvertor>;
    let adoConsoleCommentCreator: AdoConsoleCommentCreator;
    let fsMock: IMock<typeof fs>;
    const reportOutDir = 'reportOutDir';
    const fileName = `${reportOutDir}/results.md`;
    const outputArtifactName = 'accessibility-reports';
    const reportStub: CombinedReportParameters = {
        results: {
            urlResults: {
                failedUrls: 1,
            },
        },
    } as CombinedReportParameters;
    const baselineInfoStub = {};
    const reportMarkdownStub = '#ReportMarkdownStub';

    const expectedLogOutput = reportMarkdownStub;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
        reportConsoleLogConvertorMock = Mock.ofType<ReportConsoleLogConvertor>(undefined, MockBehavior.Strict);
        fsMock = Mock.ofType<typeof fs>();
    });

    describe('constructor', () => {
        it('should initialize', () => {
            buildAdoConsoleCommentCreatorWithMocks(false);

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('should output results to the console', async () => {
            adoTaskConfigMock
                .setup((atcm) => atcm.getVariable('System.JobAttempt'))
                .returns(() => '1')
                .verifiable(Times.once());

            adoTaskConfigMock
                .setup((atcm) => atcm.getUploadOutputArtifact())
                .returns(() => true)
                .verifiable(Times.once());

            loggerMock.setup((lm) => lm.logInfo(`##vso[task.uploadsummary]${fileName}`)).verifiable(Times.once());
            loggerMock
                .setup((lm) => lm.logInfo(`##vso[artifact.upload artifactname=${outputArtifactName}]${reportOutDir}`))
                .verifiable(Times.once());

            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();
            await adoConsoleCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });

        it('Successfully adds suffix to output name if job attmept > 1', async () => {
            adoTaskConfigMock
                .setup((atcm) => atcm.getVariable('System.JobAttempt'))
                .returns(() => '2')
                .verifiable(Times.once());

            adoTaskConfigMock
                .setup((atcm) => atcm.getUploadOutputArtifact())
                .returns(() => true)
                .verifiable(Times.once());

            loggerMock.setup((lm) => lm.logInfo(`##vso[task.uploadsummary]${fileName}`)).verifiable(Times.once());
            loggerMock
                .setup((lm) => lm.logInfo(`##vso[artifact.upload artifactname=${outputArtifactName}-2]${reportOutDir}`))
                .verifiable(Times.once());

            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();
            await adoConsoleCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });

        it('skips upload artifact step if uploadOutputArtifact is false', async () => {
            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

            adoTaskConfigMock
                .setup((atcm) => atcm.getUploadOutputArtifact())
                .returns(() => false)
                .verifiable(Times.once());

            loggerMock.setup((lm) => lm.logInfo(`##vso[task.uploadsummary]${fileName}`)).verifiable(Times.never());
            await adoConsoleCommentCreator.completeRun(reportStub);
        });
    });

    describe('failRun', () => {
        it('does nothing interesting', async () => {
            const adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks(false);

            await adoConsoleCommentCreator.failRun();

            verifyAllMocks();
        });
    });

    describe('didScanSucceed', () => {
        it('returns true by default', async () => {
            const adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

            await expect(adoConsoleCommentCreator.didScanSucceed()).resolves.toBe(true);
        });

        it('returns true after failRun() is called', async () => {
            const adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks(false);

            await adoConsoleCommentCreator.failRun();

            await expect(adoConsoleCommentCreator.didScanSucceed()).resolves.toBe(true);
        });
    });

    const buildAdoConsoleCommentCreatorWithMocks = (setupSharedMocks = true): AdoConsoleCommentCreator => {
        if (setupSharedMocks) {
            adoTaskConfigMock
                .setup((atcm) => atcm.getBaselineFile())
                .returns(() => undefined)
                .verifiable(Times.once());

            adoTaskConfigMock
                .setup((atcm) => atcm.getReportOutDir())
                .returns(() => reportOutDir)
                .verifiable(Times.exactly(2));

            adoTaskConfigMock
                .setup((atcm) => atcm.getOutputArtifactName())
                .returns(() => outputArtifactName)
                .verifiable(Times.once());

            reportMarkdownConvertorMock
                .setup((o) => o.convert(reportStub, undefined, baselineInfoStub))
                .returns(() => expectedLogOutput)
                .verifiable(Times.once());

            reportConsoleLogConvertorMock
                .setup((o) => o.convert(reportStub, undefined, baselineInfoStub))
                .returns(() => expectedLogOutput)
                .verifiable(Times.once());

            loggerMock.setup((lm) => lm.logInfo(expectedLogOutput)).verifiable(Times.once());
            loggerMock.setup((lm) => lm.logInfo(`##vso[task.uploadsummary]${fileName}`)).verifiable(Times.once());

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fsMock.setup((fsm) => fsm.writeFileSync(fileName, expectedLogOutput)).verifiable();
        }

        return new AdoConsoleCommentCreator(
            adoTaskConfigMock.object,
            reportMarkdownConvertorMock.object,
            reportConsoleLogConvertorMock.object,
            loggerMock.object,
            adoTaskConfigMock.object,
            fsMock.object,
        );
    };

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        loggerMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        reportConsoleLogConvertorMock.verifyAll();
        fsMock.verifyAll();
    };
});
