// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as appInsights from '@microsoft/applicationinsights-web-basic';
import { Logger, NullTelemetryClient } from '@accessibility-insights-action/shared';
import { AdoExtensionMetadata, AdoExtensionMetadataProvider } from '../ado-extension-metadata';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { TelemetryClientFactory } from './telemetry-client-factory';
import { IMock, Mock } from 'typemoq';

class StubApplicationInsights {
    public initialize(): void {
        /* no-op */
    }
}

describe(TelemetryClientFactory, () => {
    let testSubject: TelemetryClientFactory;
    let mockMetadata: AdoExtensionMetadata;
    let mockMetadataProvider: AdoExtensionMetadataProvider;
    let mockAppInsights: typeof appInsights;
    let mockLogger: IMock<Logger>;

    beforeEach(() => {
        mockAppInsights = {
            ApplicationInsights: StubApplicationInsights,
        } as unknown as typeof appInsights;
        mockMetadata = {} as AdoExtensionMetadata;
        mockMetadataProvider = {
            readMetadata: () => mockMetadata,
        } as AdoExtensionMetadataProvider;
        mockLogger = Mock.ofType<Logger>();
        testSubject = new TelemetryClientFactory(mockAppInsights, mockMetadataProvider, mockLogger.object);
    });

    it('returns a NullTelemetryClient if metadata contains no connection string', () => {
        mockMetadata.appInsightsConnectionString = null;

        const telemetryClient = testSubject.createTelemetryClient();

        expect(telemetryClient).toBeInstanceOf(NullTelemetryClient);
    });

    it('returns an AppInsightsTelemetryClient if metadata contains a connection string', () => {
        mockMetadata.appInsightsConnectionString =
            'InstrumentationKey=1234abcd-56ef-78ab-90cd-123456abcdef;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/';

        const telemetryClient = testSubject.createTelemetryClient();

        expect(telemetryClient).toBeInstanceOf(AppInsightsTelemetryClient);
    });
});
