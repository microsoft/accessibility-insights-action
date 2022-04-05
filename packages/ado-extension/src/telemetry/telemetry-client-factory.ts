// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type * as appInsights from 'applicationinsights';
import type * as process from 'process';
import { iocTypes, Logger, NullTelemetryClient, TelemetryClient } from '@accessibility-insights-action/shared';
import { AdoExtensionMetadataProvider } from '../ado-extension-metadata';
import { AppInsightsTelemetryClient } from './app-insights-telemetry-client';
import { inject, injectable } from 'inversify';
import { AdoIocTypes } from '../ioc/ado-ioc-types';

@injectable()
export class TelemetryClientFactory {
    constructor(
        @inject(AdoIocTypes.AppInsights) private readonly appInsightsObj: typeof appInsights,
        @inject(AdoExtensionMetadataProvider) private readonly metadataProvider: AdoExtensionMetadataProvider,
        @inject(Logger) private readonly logger: Logger,
        @inject(iocTypes.Process) private readonly processObj: typeof process,
    ) {}

    public createTelemetryClient(): TelemetryClient {
        const metadata = this.metadataProvider.readMetadata();
        const maybeConnectionString = metadata.appInsightsConnectionString;

        if (maybeConnectionString == null) {
            return new NullTelemetryClient();
        } else {
            return new AppInsightsTelemetryClient(this.appInsightsObj, maybeConnectionString, this.logger, metadata, this.processObj.env);
        }
    }
}
