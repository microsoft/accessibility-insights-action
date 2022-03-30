// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type TelemetryEvent = {
    name: string;
    properties?: { [key: string]: string };
};
