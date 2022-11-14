// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type TelemetryEventName = 'ScanStart' | 'ScanCompleted' | 'AuthUsed' | 'ErrorFound';

export type TelemetryEvent = {
    name: TelemetryEventName;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: { [key: string]: any };
};
