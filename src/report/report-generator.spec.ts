// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { AxeReportParameters, Report, Reporter, ReporterFactory } from 'accessibility-insights-report';
import { AxeScanResults } from 'accessibility-insights-scan';
import { AxeResults } from 'axe-core';
import * as filenamifyUrl from 'filenamify-url';
import * as fs from 'fs';
import * as MockDate from 'mockdate';
import { IMock, Mock, Times } from 'typemoq';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';
import { ReportGenerator } from './report-generator';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

describe('ReportGenerator', () => {
    let reportGenerator: ReportGenerator;
    const outputDir = 'outputDir';
    const scanUrl = 'https://www.bla.com';
    const htmlReportString = 'some html';
    let reporterMock: IMock<Reporter>;
    let htmlReport: Report;
    let axeResults: AxeResults;
    let axeScanResults: AxeScanResults;
    let reportGenerationTime: Date;
    let loggerMock: IMock<Logger>;
    let taskConfigMock: IMock<TaskConfig>;
    let filenamifyMock: IMock<typeof filenamifyUrl>;
    let fsMock: IMock<typeof fs>;
    // tslint:disable-next-line:mocha-no-side-effect-code
    const fileName = `${outputDir}/${filenamifyUrl(scanUrl, {
        replacement: '_',
    })}.html`;

    beforeEach(() => {
        loggerMock = Mock.ofType<Logger>();
        taskConfigMock = Mock.ofType<TaskConfig>();
        reporterMock = Mock.ofType<Reporter>();
        filenamifyMock = Mock.ofType<typeof filenamifyUrl>();
        fsMock = Mock.ofType<typeof fs>();
        const reporterFactory: ReporterFactory = () => reporterMock.object;

        reportGenerator = new ReportGenerator(
            taskConfigMock.object,
            reporterFactory,
            loggerMock.object,
            filenamifyMock.object,
            fsMock.object,
        );
        htmlReport = {
            asHTML: () => htmlReportString,
        };
        axeResults = ({
            url: scanUrl,
        } as unknown) as AxeResults;

        axeScanResults = { results: axeResults, pageTitle: 'page title', browserSpec: 'browser version' } as AxeScanResults;
        reportGenerationTime = new Date(2019, 2, 3);
        MockDate.set(reportGenerationTime);
        taskConfigMock
            .setup(tcm => tcm.getReportOutDir())
            .returns(() => outputDir)
            .verifiable(Times.once());
    });

    test.each([true, false])('generate report', (directoryExists: boolean) => {
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

        fsMock
            .setup(fsm => fsm.existsSync(outputDir))
            .returns(() => directoryExists)
            .verifiable(Times.once());

        fsMock.setup(fsm => fsm.writeFileSync(fileName, htmlReportString)).verifiable(Times.once());

        loggerMock.setup(lm => lm.logInfo(`scan report saved successfully ${fileName}`)).verifiable(Times.once());

        if (!directoryExists) {
            fsMock.setup(fsm => fsm.mkdirSync(outputDir)).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo('output directory does not exists.')).verifiable(Times.once());
            loggerMock.setup(lm => lm.logInfo(`creating output directory - ${outputDir}`)).verifiable(Times.once());
        }

        reportGenerator.generateReport(axeScanResults);

        reporterMock.verifyAll();
    });
});
