// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type * as appInsights from '@microsoft/applicationinsights-web-basic';
import { TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';
import { Logger } from '@accessibility-insights-action/shared';

// This is based on the "Light SKU" of the Application Insights SDK, which has
// significantly different usage from the normal SKU that's documented at
// https://github.com/microsoft/ApplicationInsights-JS. We do this primarily
// because we don't want any of the automatic reporting included with the full
// SDK and secondarily because it's 1/4 the size.
//
// Reference sample for light SDK usage:
// https://github.com/Azure-Samples/applicationinsights-web-sample1/blob/master/testlightsku.html
export class AppInsightsTelemetryClient implements TelemetryClient {
    private underlyingClient: appInsights.ApplicationInsights;
    private instrumentationKey: string;

    public constructor(
        appInsightsObj: typeof appInsights,
        connectionString: string,
        private readonly logger: Logger,
        private readonly timestampProvider: () => Date,
    ) {
        this.instrumentationKey = extractInstrumentationKeyFromConnectionString(connectionString);
        this.underlyingClient = new appInsightsObj.ApplicationInsights({
            // connectionString,

            // The docs for the basic SDK suggest that connectionString should be sufficient
            // on its own, since it contains the instrumentation key, but this is not the
            // case in actual use.
            instrumentationKey: this.instrumentationKey,
        });
        //this.underlyingClient.initialize();
    }

    public trackEvent(event: TelemetryEvent): void {
        this.logger.logDebug(`AppInsightsTelemetryClient.trackEvent: ${JSON.stringify(event)}`);

        // const utcTimestamp = this.timestampProvider().toISOString(); // Should use format '2018-07-19T02:17:12.993Z'

        // This format is derived from https://github.com/Azure-Samples/applicationinsights-web-sample1/blob/8160801c59bc2e191ffc7e9fe35201fc5c926c7b/testlightsku.html#L41
        const eventItem = {
            name: `Microsoft.ApplicationInsights.${this.instrumentationKey}.Event`,
            // timestamp: utcTimestamp,
            baseType: 'EventData',
            baseData: {
                name: event.name,
                properties: {
                    ...event.properties,
                },
            },
        };

        this.logger.logDebug(`ApplicaitonInsights.track: ${JSON.stringify(eventItem)}`);

        this.underlyingClient.track(eventItem);
    }

    public flush(): void {
        this.logger.logDebug(`AppInsightsTelemetryClient.flush`);
        this.underlyingClient.flush();
    }
}

function extractInstrumentationKeyFromConnectionString(connectionString: string): string {
    // Example connection string: InstrumentationKey=1234abcd-56ef-78ab-90cd-123456abcdef;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/
    const instrumentationKeyFromConnectionStringRegex =
        /InstrumentationKey=([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/;
    const regexMatch = instrumentationKeyFromConnectionStringRegex.exec(connectionString);
    if (regexMatch == null) {
        throw new Error('Could not extract instrumentation key from connection string');
    }

    // The example formats suggested by
    // https://github.com/Azure-Samples/applicationinsights-web-sample1/blob/master/testlightsku.html#L41
    // suggest that we should be using toUpperCase, but the library actually enforces
    // that we give the instrumentationKey in lowerCase.
    return regexMatch[1].toLowerCase();
}
