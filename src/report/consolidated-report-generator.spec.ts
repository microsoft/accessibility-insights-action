// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { ReporterFactory, CombinedReportParameters, Reporter, Report } from 'accessibility-insights-report';
import { AxeInfo } from '../axe/axe-info';
import { ConsolidatedReportGenerator } from './consolidated-report-generator';
import { TaskConfig } from '../task-config';
import { Logger } from '../logger/logger';
import * as fs from 'fs';

const axeCoreVersion = 'axe core version';
const htmlReportString = 'html report';
const scanStarted = new Date(1000);
const scanEnded = new Date(60000);

let taskConfigMock: IMock<TaskConfig>;
let reporterFactoryMock: IMock<ReporterFactory>;
let loggeryMock: IMock<Logger>;
let fsMock: IMock<fs>;

let reporterMock: IMock<Reporter>;
let axeInfoMock: IMock<AxeInfo>;
let consolidatedReportGenerator: ConsolidatedReportGenerator;
let htmlReport: Report;
let combinedReportData: CombinedReportParameters;

describe(ConsolidatedReportGenerator, () => {
    beforeEach(() => {
        combinedReportDataConverterMock = Mock.ofType<CombinedReportDataConverter>();
        axeInfoMock = Mock.ofType<AxeInfo>();
        reporterMock = Mock.ofType<Reporter>();

        axeInfoMock
            .setup((o) => o.version)
            .returns(() => axeCoreVersion)
            .verifiable();

        htmlReport = {
            asHTML: () => htmlReportString,
        };
        const reporterFactoryMock: ReporterFactory = () => reporterMock.object;
        combinedReportData = { serviceName: 'combinedReportData' } as CombinedReportParameters;
        reporterMock
            .setup((o) => o.fromCombinedResults(combinedReportData))
            .returns(() => htmlReport)
            .verifiable();

        consolidatedReportGenerator = new ConsolidatedReportGenerator(
            combinedReportDataConverterMock.object,
            reporterFactoryMock,
            axeInfoMock.object,
        );
    });

    afterEach(() => {
        combinedReportDataConverterMock.verifyAll();
        reporterMock.verifyAll();
        axeInfoMock.verifyAll();
    });

    it('generate report', async () => {
        const baseUrl = 'baseUrl-1';
        const scanMetadata = {
            baseUrl,
            basePageTitle: 'basePageTitle',
            userAgent: 'userAgent',
            browserResolution: '1920x1080',
        } as ScanMetadata;
        const combinedAxeResults = {
            violations: new AxeResultsList(),
            passes: new AxeResultsList(),
            incomplete: new AxeResultsList(),
            inapplicable: new AxeResultsList(),
        } as AxeCoreResults;
        const scanResults = [
            {
                id: 'id-1',
                scanState: 'pass',
                axeResults: { url: 'url-1' },
            },
            {
                id: 'id-2',
                scanState: 'fail',
                axeResults: { url: 'url-2' },
            },
            {
                id: 'id-3',
                scanState: 'pass',
                axeResults: { url: 'url-3' },
            },
            {
                id: 'id-4',
                scanState: 'runError',
            },
        ] as ScanResult[];
        const urlCount = getUrlCount(scanResults);
        const scanResultData: ScanResultData = {
            baseUrl: scanMetadata.baseUrl,
            basePageTitle: scanMetadata.basePageTitle,
            scanEngineName: serviceName,
            axeCoreVersion: axeCoreVersion,
            browserUserAgent: scanMetadata.userAgent,
            browserResolution: scanMetadata.browserResolution,
            urlCount,
            scanStarted,
            scanEnded,
        };

        combinedReportDataConverterMock
            .setup((o) => o.convert(combinedAxeResults, scanResultData))
            .returns(() => combinedReportData)
            .verifiable();

        const combinedScanResult = {
            urlCount: urlCount,
            scanMetadata: scanMetadata,
            combinedAxeResults: combinedAxeResults,
        } as CombinedScanResult;

        await consolidatedReportGenerator.generateReport(combinedScanResult, scanStarted, scanEnded);
    });
});

function getUrlCount(scanResults: ScanResult[]): UrlCount {
    const urlCount = {
        total: scanResults.length,
        failed: 0,
        passed: 0,
    };

    for (const scanResult of scanResults) {
        if (scanResult.scanState === 'pass') {
            urlCount.passed++;
        } else if (scanResult.scanState === 'fail') {
            urlCount.failed++;
        }
    }

    return urlCount;
}
