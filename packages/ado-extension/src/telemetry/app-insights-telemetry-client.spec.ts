// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import type * as process from 'process';
import * as appInsights from 'applicationinsights';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { Logger, TelemetryEvent } from '@accessibility-insights-action/shared';
import { IMock, Mock } from 'typemoq';
import { AdoExtensionMetadata } from '../ado-extension-metadata';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describe(AppInsightsTelemetryClient, () => {
    let mockAppInsights: typeof appInsights;
    let mockLogger: IMock<Logger>;
    let stubMetadata: AdoExtensionMetadata;
    let stubProcessEnv: typeof process.env;
    let stubConnectionString: string;

    beforeEach(() => {
        MockUnderlyingClient.lastConstructedInstance = undefined;

        mockAppInsights = {
            TelemetryClient: MockUnderlyingClient as unknown as typeof appInsights.TelemetryClient,
        } as typeof appInsights;
        mockLogger = Mock.ofType<Logger>();

        stubConnectionString = 'stub connection string';
        stubMetadata = {
            environment: 'stub environment',
            extensionId: 'stub extension id',
            extensionName: 'stub extension name',
            extensionVersion: 'stub extension version',
            publisherId: 'stub publisher id',
            appInsightsConnectionString: stubConnectionString,
        };

        stubProcessEnv = {};
    });

    describe('constructor', () => {
        it('initializes an underlying client with the expected parameters', () => {
            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);

            expect(MockUnderlyingClient.lastConstructedInstance).not.toBeUndefined();
            expect(MockUnderlyingClient.lastConstructedInstance?.config).toBe(stubConnectionString);
        });

        it('scrubs identifiable values App Insights populates by default', () => {
            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;
            const contextKeys = appInsights.defaultClient.context.keys;

            expect(underlying.context.tags[contextKeys.cloudRole]).toBe('');
            expect(underlying.context.tags[contextKeys.cloudRoleInstance]).toBe('');
            expect(underlying.context.tags[contextKeys.locationIp]).toBe('0.0.0.0');
        });

        it.each`
            commonPropName | metadataPropName
            ${'extensionPublisherId'} | ${'publisherId'}
            ${'extensionId'} | ${'extensionId'}
            ${'extensionName'} | ${'extensionName'}
            ${'extensionVersion'} | ${'extensionVersion'}
            ${'extensionEnvironment'} | ${'environment'}
        `('reflects metadata property $metadataPropName as common property $commonPropName', ({ commonPropName, metadataPropName }) => {
            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;

            expect(underlying.commonProperties![commonPropName]).toBe(stubMetadata[metadataPropName as keyof AdoExtensionMetadata]);
        });

        it('omits the app insights connection string from common properties', () => {
            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;

            expect(Object.values(underlying.commonProperties!)).not.toContain(stubConnectionString);
        });

        it.each`
            commonPropName | envVar
            ${'adoTeamProjectId'} | ${'SYSTEM_TEAMPROJECTID'}
            ${'adoPipelineDefinitionId'} | ${'SYSTEM_DEFINITIONID'}
            ${'adoPullRequestId'} | ${'SYSTEM_PULLREQUEST_PULLREQUESTID'}
            ${'adoJobId'} | ${'SYSTEM_JOBID'}
        `('reflects environment variable $envVar as common property $commonPropName', ({ commonPropName, envVar }) => {
            stubProcessEnv[envVar] = 'ENV VAR VALUE';

            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;

            expect(underlying.commonProperties![commonPropName]).toBe('ENV VAR VALUE');
        });

        it('reflects environment variables of interest as empty strings if they are not set', () => {
            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;

            expect(underlying.commonProperties!['adoTeamProjectId']).toBe('');
        });

        it("omits environment variables we don't specifically mean to track", () => {
            stubProcessEnv['NOT_TRACKED'] = 'ENV VAR VALUE';

            new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const underlying = MockUnderlyingClient.lastConstructedInstance!;

            expect(underlying.commonProperties).not.toHaveProperty('NOT_TRACKED');
        });
    });

    describe('trackEvent', () => {
        it("delegates to the underlying client's trackEvent with the expected envelope format", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);
            const testEvent: TelemetryEvent = { name: 'ScanStart', properties: { 'prop 1': 'value 1' } };

            testSubject.trackEvent(testEvent);

            expect(MockUnderlyingClient.lastConstructedInstance!.trackEvent).toHaveBeenCalledWith(testEvent);
        });
    });

    describe('flush', () => {
        it("delegates to the underlying client's flush", () => {
            const testSubject = new AppInsightsTelemetryClient(mockAppInsights, stubConnectionString, mockLogger.object, stubMetadata, stubProcessEnv);

            testSubject.flush();

            expect(MockUnderlyingClient.lastConstructedInstance!.flush).toHaveBeenCalledTimes(1);
        });
    });
});

class MockUnderlyingClient {
    public static lastConstructedInstance?: MockUnderlyingClient;

    public commonProperties?: { [key: string]: string };
    public context: { tags: { [key: string]: string } };

    constructor(public readonly config: string) {
        MockUnderlyingClient.lastConstructedInstance = this;
        this.context = appInsights.defaultClient.context;
    }

    public trackEvent = jest.fn();
    public flush = jest.fn();
}
