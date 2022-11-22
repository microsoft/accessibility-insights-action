// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type ErrorSender = 'Scanner' | 'Crawler' | 'TelemetrySender' | 'InputValidator';

export class TelemetryErrorCollector {
    errorSender: ErrorSender;
    errorList: string[] = [];

    constructor(errorSender: ErrorSender) {
        this.errorSender = errorSender;
    }

    public collectError(errorMessage: string): void {
        this.errorList.push(errorMessage);
    }

    public cleanErrorList(): void {
        while (this.errorList.length > 0) {
            this.errorList.pop();
        }
    }

    public returnErrorList(): { [key: string]: any } {
        const errorObject: { [key: string]: any } = {};
        errorObject.sender = this.errorSender;
        errorObject.errorList = this.errorList;
        return errorObject;
    }
}
