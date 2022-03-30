// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import type * as appInsights from '@microsoft/applicationinsights-web';
import { AppInsightsTelemetryClient } from "./app-insights-telemetry-client";
import { TelemetryEvent } from '@accessibility-insights-action/shared';

class MockApplicationInsights {
    public static lastConstructedInstance?: MockApplicationInsights;

    constructor(public readonly snippet: appInsights.Snippet) {
        MockApplicationInsights.lastConstructedInstance = this;
    }

    public trackEvent = jest.fn();
    public flush = jest.fn();
}

describe(AppInsightsTelemetryClient, () => {
    let mockAppInsights: typeof appInsights;
    beforeEach(() => {
        mockAppInsights = {
            ApplicationInsights: MockApplicationInsights as unknown as typeof appInsights.ApplicationInsights,
        } as typeof appInsights;
    });

    describe('constructor', () => {
        it('initializes an underlying client with the expected parameters', () => {
            new AppInsightsTelemetryClient(mockAppInsights, 'test connection string');

            expect(MockApplicationInsights.lastConstructedInstance).not.toBeUndefined();
            expect(MockApplicationInsights.lastConstructedInstance?.snippet).toStrictEqual({
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
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, 'test connection string');

            const testEvent: TelemetryEvent = { name: 'test event', properties: { 'prop 1': 'value 1' }};
            testSubject.trackEvent(testEvent);

            expect(MockApplicationInsights.lastConstructedInstance?.trackEvent).toHaveBeenCalledWith(testEvent);
        });
    });

    describe('flush', () => {
        it("delegates to the underlying client's flush (in sync mode)", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, 'test connection string');

            testSubject.flush();

            expect(MockApplicationInsights.lastConstructedInstance?.flush).toHaveBeenCalledWith(/* async: */ false);
        });
    });
});