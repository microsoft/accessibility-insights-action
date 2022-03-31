// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import type * as appInsights from '@microsoft/applicationinsights-web-basic';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { Logger, TelemetryEvent } from '@accessibility-insights-action/shared';
import { IMock, Mock } from 'typemoq';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

class MockApplicationInsights {
    public static lastConstructedInstance?: MockApplicationInsights;

    constructor(public readonly config: appInsights.IConfiguration) {
        MockApplicationInsights.lastConstructedInstance = this;
    }

    public initialize = jest.fn();
    public track = jest.fn();
    public flush = jest.fn();
}

describe(AppInsightsTelemetryClient, () => {
    let mockAppInsights: typeof appInsights;
    let mockLogger: IMock<Logger>;
    let mockDate: Date;
    let exampleConnectionString: string;
    let exampleInstrumentationKey: string;

    beforeEach(() => {
        MockApplicationInsights.lastConstructedInstance = undefined;

        mockAppInsights = {
            ApplicationInsights: MockApplicationInsights as unknown as typeof appInsights.ApplicationInsights,
        } as typeof appInsights;
        mockLogger = Mock.ofType<Logger>();
        mockDate = new Date('2020-01-02T03:04:05.678Z');

        exampleConnectionString =
            'InstrumentationKey=1234ABCD-56ef-78ab-90cd-123456abcdef;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/';
        exampleInstrumentationKey = '1234abcd-56ef-78ab-90cd-123456abcdef';
    });

    describe('constructor', () => {
        it('initializes an underlying client with the expected parameters', () => {
            new AppInsightsTelemetryClient(mockAppInsights, exampleConnectionString, mockLogger.object, () => mockDate);

            expect(MockApplicationInsights.lastConstructedInstance).not.toBeUndefined();
            expect(MockApplicationInsights.lastConstructedInstance?.config).toStrictEqual({
                connectionString: exampleConnectionString,
                instrumentationKey: exampleInstrumentationKey,
            });
            expect(MockApplicationInsights.lastConstructedInstance!.initialize).toHaveBeenCalledTimes(1);
        });
    });

    describe('trackEvent', () => {
        it("delegates to the underlying client's trackEvent with the expected envelope format", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, exampleConnectionString, mockLogger.object, () => mockDate);

            const testEvent: TelemetryEvent = { name: 'ScanStart', properties: { 'prop 1': 'value 1' } };

            const expectedEnvelope = {
                name: `Microsoft.ApplicationInsights.${exampleInstrumentationKey}.Event`,
                timestamp: '2020-01-02T03:04:05.678Z',
                baseType: 'EventData',
                baseData: {
                    name: 'ScanStart',
                    properties: {
                        'prop 1': 'value 1',
                    },
                },
            };

            testSubject.trackEvent(testEvent);

            expect(MockApplicationInsights.lastConstructedInstance!.track).toHaveBeenCalledWith(expectedEnvelope);
        });
    });

    describe('flush', () => {
        it("delegates to the underlying client's flush", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, exampleConnectionString, mockLogger.object, () => mockDate);

            testSubject.flush();

            expect(MockApplicationInsights.lastConstructedInstance!.flush).toHaveBeenCalledTimes(1);
        });
    });
});
