// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type * as appInsights from '@microsoft/applicationinsights-web';
import { TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';

export class AppInsightsTelemetryClient implements TelemetryClient {
    private underlyingClient: appInsights.IApplicationInsights;

    public constructor(appInsightsObj: typeof appInsights, connectionString: string) {
        const appInsightsInitializer = new appInsightsObj.ApplicationInsights({
            config: {
                connectionString,

                disableExceptionTracking: true,
                disableFetchTracking: true,
                disableAjaxTracking: true,
                disableCorrelationHeaders: true,
                disableCookiesUsage: true,
            },
        });

        this.underlyingClient = appInsightsInitializer.loadAppInsights();
    }

    public trackEvent(event: TelemetryEvent): void {
        this.underlyingClient.trackEvent(event);
    }

    public flush(): void {
        this.underlyingClient.flush(/* async: */ false);
    }
}
