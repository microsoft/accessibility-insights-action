// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as appInsights from '@microsoft/applicationinsights-web';
import { Logger, NullTelemetryClient } from '@accessibility-insights-action/shared';
import { AdoExtensionMetadata, AdoExtensionMetadataProvider } from '../ado-extension-metadata';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { TelemetryClientFactory } from './telemetry-client-factory';
import { IMock, Mock } from 'typemoq';

class StubApplicationInsights {
    loadAppInsights(): appInsights.IApplicationInsights {
        return {} as appInsights.IApplicationInsights;
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
        mockMetadata.appInsightsConnectionString = 'test connection string';

        const telemetryClient = testSubject.createTelemetryClient();

        expect(telemetryClient).toBeInstanceOf(AppInsightsTelemetryClient);
    });
});
