// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type ErrorSender = 'Scanner' | 'Crawler' | 'TelemetrySender' | 'InputValidator';

export type ErrorReport = { sender: ErrorSender; errorList: string[] };

export class TelemetryErrorCollector {
    errorReport: ErrorReport;

    constructor(errorSender: ErrorSender) {
        this.errorReport = { sender: errorSender, errorList: [] };
    }

    public collectError(errorMessage: string): void {
        this.errorReport.errorList.push(errorMessage);
    }

    public cleanErrorList(): void {
        while (this.errorReport.errorList.length > 0) {
            this.errorReport.errorList.pop();
        }
    }

    public isEmpty(): boolean {
        return this.errorReport.errorList.length == 0;
    }

    public returnErrorList(): ErrorReport {
        return this.errorReport;
    }
}
