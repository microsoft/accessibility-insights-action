// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { AxeReportParameters, Report, Reporter, ReporterFactory } from 'accessibility-insights-report';
import { AxeResults } from 'axe-core';
import * as filenamifyUrl from 'filenamify-url';
import * as fs from 'fs';
import * as MockDate from 'mockdate';
import { IMock, Mock, Times } from 'typemoq';
import { Logger } from '../logger/logger';
import { AxeScanResults } from '../scanner/axe-scan-results';
import { TaskConfig } from '../task-config';
import { ReportGenerator } from './report-generator';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

describe('ReportGenerator', () => {
    let reportGenerator: ReportGenerator;
    const outputDir = 'outputDir';
    const scanUrl = 'https://www.bla.com';
    const htmlReportString = 'outputDir/bla.com.html';
    let reporterMock: IMock<Reporter>;
    let htmlReport: Report;
    let axeResults: AxeResults;
    let axeScanResults: AxeScanResults;
    let reportGenerationTime: Date;
    let loggerMock: IMock<Logger>;
    let taskConfigMock: IMock<TaskConfig>;
    let filenamify: typeof filenamifyUrl = filenamifyUrl;
    let fileSystemObj: typeof fs = fs;

    beforeEach(() => {
        loggerMock = Mock.ofType<Logger>();
        taskConfigMock = Mock.ofType<TaskConfig>();
        reporterMock = Mock.ofType<Reporter>();
        const reporterFactory: ReporterFactory = () => reporterMock.object;
        reportGenerator = new ReportGenerator(taskConfigMock.object, reporterFactory, loggerMock.object);
        htmlReport = {
            asHTML: () => htmlReportString,
        };
        axeResults = ({
            url: scanUrl,
        } as unknown) as AxeResults;

        axeScanResults = { results: axeResults, pageTitle: 'page title', browserSpec: 'browser version' };
        reportGenerationTime = new Date(2019, 2, 3);
        MockDate.set(reportGenerationTime);
        taskConfigMock
            .setup(tcm => tcm.getReportOutDir())
            .returns(() => outputDir)
            .verifiable(Times.once());
    });

    it('generate report ', () => {
        const params = {
            pageTitle: axeScanResults.pageTitle,
        };
        const htmlReportParams: AxeReportParameters = {
            results: axeScanResults.results,
            description: `Automated report for accessibility scan of url ${
                axeScanResults.results.url
            } completed at ${reportGenerationTime.toUTCString()}.`,
            serviceName: 'Accessibility Insights Action',
            scanContext: {
                pageTitle: params.pageTitle,
            },
        };
        reporterMock
            .setup(rm => rm.fromAxeResult(htmlReportParams))
            .returns(() => htmlReport)
            .verifiable(Times.once());

        const report = reportGenerator.generateReport(axeScanResults);

        reporterMock.verifyAll();
        expect(report).toEqual(htmlReportString);
    });
});
