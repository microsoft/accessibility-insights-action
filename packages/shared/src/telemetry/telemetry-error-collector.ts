// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type ErrorSender = 'Scanner' | 'Crawler' | 'InputValidator';
const errorList: unknown[] = [];

export class TelemetryErrorCollector {
    // eslint-disable-next-line @typescript-eslint/require-await
    public errorCollector(errorMessage: string[]): void {
        errorList.push(errorMessage);
    }
}
