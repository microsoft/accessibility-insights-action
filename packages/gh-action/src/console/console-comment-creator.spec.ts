// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { IMock, Mock, MockBehavior } from 'typemoq';
import {
    ConsoleLogOutputFormatter,
    Logger,
    OutputFormatter,
    ReportConsoleLogConvertor,
    ResultOutputBuilder,
} from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { ConsoleCommentCreator } from './console-comment-creator';

describe(ConsoleCommentCreator, () => {
    let testSubject: ConsoleCommentCreator;
    let reportConsoleLogConvertorMock: IMock<ReportConsoleLogConvertor>;
    let loggerMock: IMock<Logger>;
    let consoleLogOutputFormatterMock: IMock<ConsoleLogOutputFormatter>;
    let resultOutputBuilderFactoryMock: IMock<(formatter: OutputFormatter) => ResultOutputBuilder>;

    const consoleOutputContent = 'test console content';
    const combinedReportResult = { serviceName: 'combinedReportResult' } as CombinedReportParameters;

    beforeEach(() => {
        resultOutputBuilderFactoryMock = Mock.ofType<(formatter: OutputFormatter) => ResultOutputBuilder>();
        consoleLogOutputFormatterMock = Mock.ofType<ConsoleLogOutputFormatter>(undefined, MockBehavior.Strict);
        reportConsoleLogConvertorMock = Mock.ofType2(ReportConsoleLogConvertor, [
            resultOutputBuilderFactoryMock.object,
            consoleLogOutputFormatterMock.object,
        ]);
        loggerMock = Mock.ofType(Logger);
        reportConsoleLogConvertorMock.setup((a) => a.convert(combinedReportResult)).returns(() => consoleOutputContent);
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
        it('logs the markdown content', async () => {
            loggerMock
                .setup((a) => a.logInfo(consoleOutputContent))
                .returns(() => consoleOutputContent)
                .verifiable();
            await testSubject.completeRun(combinedReportResult);
        });
    });
});
