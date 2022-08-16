// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { IMock, Mock } from 'typemoq';
import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { JobSummaryCreator } from './job-summary-creator';
import { GHTaskConfig } from '../task-config/gh-task-config';

describe(JobSummaryCreator, () => {
    let testSubject: JobSummaryCreator;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let loggerMock: IMock<Logger>;
    let taskConfigMock: IMock<GHTaskConfig>;

    const markdownContent = 'test markdown content';
    const combinedReportResult = { serviceName: 'combinedReportResult' } as CombinedReportParameters;

    beforeEach(() => {
        taskConfigMock = Mock.ofType<GHTaskConfig>();
        reportMarkdownConvertorMock = Mock.ofType(ReportMarkdownConvertor);
        loggerMock = Mock.ofType(Logger);
        testSubject = new JobSummaryCreator(taskConfigMock.object, reportMarkdownConvertorMock.object, loggerMock.object);
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
        it('converts to markdown and writes the job summary', async () => {
            reportMarkdownConvertorMock
                .setup((a) => a.convert(combinedReportResult, true))
                .returns(() => markdownContent)
                .verifiable();
            taskConfigMock
                .setup((a) => a.writeJobSummary(markdownContent))
                .returns(() => Promise.resolve())
                .verifiable();
            await testSubject.completeRun(combinedReportResult);
        });
    });
});
