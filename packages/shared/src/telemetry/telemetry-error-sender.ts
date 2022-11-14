// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes, TelemetryClient, TelemetryEvent } from '@accessibility-insights-action/shared';

const errorList: unknown[] = [];
@injectable()
export class TelemetryErrorSender {
    constructor(@inject(iocTypes.TelemetryClient) private readonly telemetryClient: TelemetryClient) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    public errorCollector(errorMessage: string[]): void {
        errorList.push(errorMessage);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public sendTelemetryErrorReport(sender: string): void {
        this.telemetryClient.trackEvent({
            name: 'ErrorFound',
            properties: {sender: sender, errorList: errorList},
        } as TelemetryEvent);
    }
}
