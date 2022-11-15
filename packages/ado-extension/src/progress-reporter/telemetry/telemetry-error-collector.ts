// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type ErrorSender = 'Scanner' | 'Crawler' | 'TelemetrySender';
export type Error = {
    description: unknown;
    properties?: { [key: string]: any };
};
const errorList: unknown[] = [];

export class TelemetryErrorCollector {
    errorSender: ErrorSender;
    errorList: { [key: string]: any } = {};

    constructor(errorSender: ErrorSender) {
        this.errorSender = errorSender;
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    public collectError(errorMessage: string[]): void {
        errorList.push(errorMessage);
    }
}
