// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { AdoConsoleCommentCreator } from './ado-console-comment-creator';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { CombinedReportParameters } from 'accessibility-insights-report';

import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';

describe(AdoConsoleCommentCreator, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let loggerMock: IMock<Logger>;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let adoConsoleCommentCreator: AdoConsoleCommentCreator;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('should initialize', () => {
            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

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

            const expectedLogOutput = AdoConsoleCommentCreator.CURRENT_COMMENT_TITLE + reportMarkdownStub;

            adoTaskConfigMock
                .setup((atcm) => atcm.getBaselineFile())
                .returns(() => undefined)
                .verifiable(Times.once());

            reportMarkdownConvertorMock
                .setup((o) => o.convert(reportStub, AdoConsoleCommentCreator.CURRENT_COMMENT_TITLE, baselineInfoStub))
                .returns(() => expectedLogOutput)
                .verifiable(Times.once());

            loggerMock.setup((lm) => lm.logInfo(expectedLogOutput)).verifiable(Times.once());

            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();
            await adoConsoleCommentCreator.completeRun(reportStub);

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('does nothing interesting', async () => {
            const message = 'message';
            adoConsoleCommentCreator = buildAdoConsoleCommentCreatorWithMocks();

            await adoConsoleCommentCreator.failRun(message);

            verifyAllMocks();
        });
    });

    const buildAdoConsoleCommentCreatorWithMocks = () =>
        new AdoConsoleCommentCreator(adoTaskConfigMock.object, reportMarkdownConvertorMock.object, loggerMock.object);

    const verifyAllMocks = () => {
        adoTaskConfigMock.verifyAll();
        loggerMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
    };
});
