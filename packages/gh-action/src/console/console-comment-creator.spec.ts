// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { IMock, Mock } from 'typemoq';
import { Logger, ReportConsoleLogConvertor } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { ConsoleCommentCreator } from './console-comment-creator';

describe(ConsoleCommentCreator, () => {
    let testSubject: ConsoleCommentCreator;
    let reportConsoleLogConvertorMock: IMock<ReportConsoleLogConvertor>;
    let loggerMock: IMock<Logger>;

    const markdownContent = 'test markdown content';
    const combinedReportResult = { serviceName: 'combinedReportResult' } as CombinedReportParameters;

    beforeEach(() => {
        reportConsoleLogConvertorMock = Mock.ofType(ReportConsoleLogConvertor);
        loggerMock = Mock.ofType(Logger);
        reportConsoleLogConvertorMock.setup((a) => a.convert(combinedReportResult)).returns(() => markdownContent);
        testSubject = new ConsoleCommentCreator(reportConsoleLogConvertorMock.object, loggerMock.object);
    });

    afterEach(() => {
        reportConsoleLogConvertorMock.verifyAll();
        loggerMock.verifyAll();
    });

    describe('start', () => {
        it('does nothing', async () => {
            await expect(testSubject.start()).resolves.toBeUndefined();
        });
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

    describe('completeRun', () => {
        it('logs the console content', async () => {
            loggerMock
                .setup((a) => a.logInfo(markdownContent))
                .returns(() => markdownContent)
                .verifiable();
            await testSubject.completeRun(combinedReportResult);
        });
    });
});
