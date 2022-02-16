// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReporterFactory, CombinedReportParameters, Reporter, Report } from 'accessibility-insights-report';
import { ConsolidatedReportGenerator } from './consolidated-report-generator';
import { TaskConfig } from '../task-config';
import { Logger } from '../logger/logger';
import * as fs from 'fs';

/* eslint-disable security/detect-non-literal-fs-filename */
const htmlReportString = 'html report';
const reportOutDir = 'reportOutDir';
const reportFileName = `${reportOutDir}/index.html`;

let taskConfigMock: IMock<TaskConfig>;
let reporterMock: IMock<Reporter>;
let loggerMock: IMock<Logger>;
let fsMock: IMock<typeof fs>;
let consolidatedReportGenerator: ConsolidatedReportGenerator;
let htmlReport: Report;
let combinedReportParameters: CombinedReportParameters;

describe(ConsolidatedReportGenerator, () => {
    beforeEach(() => {
        taskConfigMock = Mock.ofType<TaskConfig>();
        reporterMock = Mock.ofType<Reporter>();
        loggerMock = Mock.ofType<Logger>();
        fsMock = Mock.ofType<typeof fs>();

        htmlReport = {
            asHTML: () => htmlReportString,
        };
        const reporterFactoryMock: ReporterFactory = () => reporterMock.object;
        combinedReportParameters = { serviceName: 'combinedReportData' } as CombinedReportParameters;
        reporterMock
            .setup((o) => o.fromCombinedResults(combinedReportParameters))
            .returns(() => htmlReport)
            .verifiable();
        taskConfigMock
            .setup((o) => o.getReportOutDir())
            .returns(() => reportOutDir)
            .verifiable();
        fsMock.setup((o) => o.writeFileSync(reportFileName, htmlReportString)).verifiable();

        consolidatedReportGenerator = new ConsolidatedReportGenerator(
            taskConfigMock.object,
            reporterFactoryMock,
            loggerMock.object,
            fsMock.object,
        );
    });

    afterEach(() => {
        taskConfigMock.verifyAll();
        loggerMock.verifyAll();
        fsMock.verifyAll();
    });

    it('generate report', () => {
        const actualReportFileName = consolidatedReportGenerator.generateReport(combinedReportParameters);

        expect(actualReportFileName).toEqual(reportFileName);
    });
});
