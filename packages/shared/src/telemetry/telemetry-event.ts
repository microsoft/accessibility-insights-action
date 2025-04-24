// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type TelemetryEventName = 'ScanStart' | 'ScanCompleted' | 'AuthUsed' | 'ErrorFound' | 'Inputs';

export type TelemetryEvent = {
    name: TelemetryEventName;

    properties?: { [key: string]: any };
};
