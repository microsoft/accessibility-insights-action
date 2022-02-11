// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { IMock, Mock } from 'typemoq';
import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { ConsoleCommentCreator } from './console-comment-creator';

describe(ConsoleCommentCreator, () => {
    let testSubject: ConsoleCommentCreator;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let loggerMock: IMock<Logger>;

    const markdownContent = 'test markdown content';
    const combinedReportResult = { serviceName: 'combinedReportResult' } as CombinedReportParameters;

    beforeEach(() => {
        reportMarkdownConvertorMock = Mock.ofType(ReportMarkdownConvertor);
        loggerMock = Mock.ofType(Logger);
        reportMarkdownConvertorMock.setup((a) => a.convert(combinedReportResult)).returns(() => markdownContent);
        testSubject = new ConsoleCommentCreator(reportMarkdownConvertorMock.object, loggerMock.object);
    });

    afterEach(() => {
        reportMarkdownConvertorMock.verifyAll();
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
        it('logs the markdown content', async () => {
            loggerMock
                .setup((a) => a.logInfo(markdownContent))
                .returns(() => markdownContent)
                .verifiable();
            await testSubject.completeRun(combinedReportResult);
        });
    });
});
