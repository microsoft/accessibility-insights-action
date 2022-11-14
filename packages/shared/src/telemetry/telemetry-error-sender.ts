// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes, TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';

const eventProperties: { [key: string]: any } = {};

@injectable()
export class TelemetryErrorSender{
    constructor(
        @inject(iocTypes.TelemetryClient) private readonly telemetryClient: TelemetryClient,
    ) { }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async errorCollector(errorType: string, errorName: string, errorMessage: string): Promise<void> {
        eventProperties.errorType = errorType,
        eventProperties.errorName = errorName,
        eventProperties.errorMessage = errorMessage;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async sendTelemetryErrorReport(): Promise<void> {
        this.telemetryClient.trackEvent({
            name: 'Error',
            properties: this.eventProperties,
        } as TelemetryEvent);
    }
}
