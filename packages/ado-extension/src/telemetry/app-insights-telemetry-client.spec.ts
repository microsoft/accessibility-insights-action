// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import type * as appInsights from '@microsoft/applicationinsights-web';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { Logger, TelemetryEvent } from '@accessibility-insights-action/shared';
import { IMock, Mock } from 'typemoq';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

class MockApplicationInsightsInitializer {
    public static lastConstructedInitializer?: MockApplicationInsightsInitializer;
    public static lastLoadedMock?: IMock<appInsights.IApplicationInsights>;

    constructor(public readonly snippet: appInsights.Snippet) {
        MockApplicationInsightsInitializer.lastConstructedInitializer = this;
    }

    public loadAppInsights(): appInsights.IApplicationInsights {
        const mockAppInsights = Mock.ofType<appInsights.IApplicationInsights>();
        MockApplicationInsightsInitializer.lastLoadedMock = mockAppInsights;
        return mockAppInsights.object;
    }
}

describe(AppInsightsTelemetryClient, () => {
    let mockAppInsights: typeof appInsights;
    let mockLogger: IMock<Logger>;

    beforeEach(() => {
        mockAppInsights = {
            ApplicationInsights: MockApplicationInsightsInitializer as unknown as typeof appInsights.ApplicationInsights,
        } as typeof appInsights;
        mockLogger = Mock.ofType<Logger>();
    });

    describe('constructor', () => {
        it('initializes an underlying client with the expected parameters', () => {
            new AppInsightsTelemetryClient(mockAppInsights, 'test connection string', mockLogger.object);

            expect(MockApplicationInsightsInitializer.lastConstructedInitializer).not.toBeUndefined();
            expect(MockApplicationInsightsInitializer.lastConstructedInitializer?.snippet).toStrictEqual({
                config: {
                    connectionString: 'test connection string',

                    disableExceptionTracking: true,
                    disableFetchTracking: true,
                    disableAjaxTracking: true,
                    disableCorrelationHeaders: true,
                    disableCookiesUsage: true,
                },
            });
        });
    });

    describe('trackEvent', () => {
        it("delegates to the underlying client's trackEvent", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, 'test connection string', mockLogger.object);

            const testEvent: TelemetryEvent = { name: 'ScanStart', properties: { 'prop 1': 'value 1' } };

            MockApplicationInsightsInitializer.lastLoadedMock!.setup((m) => m.trackEvent(testEvent)).verifiable();

            testSubject.trackEvent(testEvent);

            MockApplicationInsightsInitializer.lastLoadedMock!.verifyAll();
        });
    });

    describe('flush', () => {
        it("delegates to the underlying client's flush (in sync mode)", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, 'test connection string', mockLogger.object);

            MockApplicationInsightsInitializer.lastLoadedMock!.setup((m) => m.flush(/* async: */ false)).verifiable();

            testSubject.flush();

            MockApplicationInsightsInitializer.lastLoadedMock!.verifyAll();
        });
    });
});
