// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type * as appInsights from '@microsoft/applicationinsights-web';
import { TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';

export class AppInsightsTelemetryClient implements TelemetryClient {
    private underlyingClient: appInsights.ApplicationInsights;

    public constructor(appInsightsObj: typeof appInsights, connectionString: string) {
        this.underlyingClient = new appInsightsObj.ApplicationInsights({
            config: {
                connectionString,

                disableExceptionTracking: true,
                disableFetchTracking: true,
                disableAjaxTracking: true,
                disableCorrelationHeaders: true,
                disableCookiesUsage: true,
            },
        });
    }

    public trackEvent(event: TelemetryEvent): void {
        this.underlyingClient.trackEvent(event);
    }

    public flush(): void {
        this.underlyingClient.flush(/* async: */ false);
    }
}
