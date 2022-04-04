// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type * as appInsights from 'applicationinsights';
import { TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';
import { Logger } from '@accessibility-insights-action/shared';
import { AdoExtensionMetadata } from '../ado-extension-metadata';

// App Insights telemetry must *only* be sent for Microsoft-internal releases of
// the extension, for internal accessibility compliance tracking purposes.
//
// Public/external releases should use a NullTelemetryClient instead.
export class AppInsightsTelemetryClient implements TelemetryClient {
    private underlyingClient: appInsights.TelemetryClient;

    public constructor(
        appInsightsObj: typeof appInsights,
        connectionString: string,
        private readonly logger: Logger,
        extensionMetadata: AdoExtensionMetadata,
        processEnv: typeof process.env,
    ) {
        // It's very important that we invoke new TelemetryClient and *not* setup()
        // The latter initializes a bunch of auto-collectors that we don't want to run
        this.underlyingClient = new appInsightsObj.TelemetryClient(connectionString);

        // This disables collection of the local machine's hostname
        this.underlyingClient.context.tags[this.underlyingClient.context.keys.cloudRole] = '';
        this.underlyingClient.context.tags[this.underlyingClient.context.keys.cloudRoleInstance] = '';

        // This disables client location telemetry that is otherwise automatically gathered
        // via geolocation against the sending IP
        this.underlyingClient.context.tags[this.underlyingClient.context.keys.locationIp] = '0.0.0.0';

        this.underlyingClient.commonProperties = {
            extensionPublisherId: extensionMetadata.publisherId,
            extensionId: extensionMetadata.extensionId,
            extensionName: extensionMetadata.extensionName,
            extensionVersion: extensionMetadata.extensionVersion,
            extensionEnvironment: extensionMetadata.environment,

            adoTeamProjectId: processEnv['SYSTEM_TEAMPROJECTID'] ?? '',
            adoPipelineDefinitionId: processEnv['SYSTEM_DEFINITIONID'] ?? '',
            adoPullRequestId: processEnv['SYSTEM_PULLREQUEST_PULLREQUESTID'] ?? '',
            adoJobId: processEnv['SYSTEM_JOBID'] ?? '',
        };
    }

    public trackEvent(event: TelemetryEvent): void {
        this.logger.logDebug(`[Telemetry] tracking a '${event.name}' event`);
        this.underlyingClient.trackEvent(event);
    }

    public async flush(): Promise<void> {
        this.logger.logDebug(`[Telemetry] flushing telemetry`);
        await new Promise<void>((resolve) => {
            this.underlyingClient.flush({
                callback: () => resolve(),
            });
        });
    }
}
