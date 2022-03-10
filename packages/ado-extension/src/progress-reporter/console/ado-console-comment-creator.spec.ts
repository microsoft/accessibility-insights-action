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
    const defaultWorkingDirectory = 'working/directory/';

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
        reportConsoleLogConvertorMock = Mock.ofType<ReportConsoleLogConvertor>(undefined, MockBehavior.Strict);
        fsMock = Mock.ofType<typeof fs>();
    });

    describe('constructor', () => {
        it('should initialize', () => {
            buildAdoConsoleCommentCreatorWithMocks();

            verifyAllMocks();
        });
    });

    describe('completeRun', () => {
        it('should output results to the console', async () => {
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

            adoTaskConfigMock
                .setup((atcm) => atcm.getBaselineFile())
                .returns(() => undefined)
                .verifiable(Times.once());

            adoTaskConfigMock
                .setup((atcm) => atcm.getReportOutDir())
                .returns(() => reportOutDir)
                .verifiable(Times.once());

            adoTaskConfigMock
                .setup((atcm) => atcm.getVariable('System.DefaultWorkingDirectory'))
                .returns(() => defaultWorkingDirectory)
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
            loggerMock
                .setup((lm) =>
                    lm.logInfo(
                        `##vso[artifact.upload artifactname=accessibility-reports]${defaultWorkingDirectory}/_accessibility-reports`,
                    ),
                )
                .verifiable(Times.once());
            fsMock.setup((fsm) => fsm.writeFileSync(fileName, expectedLogOutput)).verifiable();

            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();
            await adoConsoleCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('does nothing interesting', async () => {
            const adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

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
            const adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

            await adoConsoleCommentCreator.failRun();

            await expect(adoConsoleCommentCreator.didScanSucceed()).resolves.toBe(true);
        });
    });

    const buildAdoConsoleCommentCreatorWithMocks = (): AdoConsoleCommentCreator =>
        new AdoConsoleCommentCreator(
            adoTaskConfigMock.object,
            reportMarkdownConvertorMock.object,
            reportConsoleLogConvertorMock.object,
            loggerMock.object,
            adoTaskConfigMock.object,
            fsMock.object,
        );

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        loggerMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        reportConsoleLogConvertorMock.verifyAll();
        fsMock.verifyAll();
    };
});
