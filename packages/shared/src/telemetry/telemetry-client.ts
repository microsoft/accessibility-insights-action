// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TelemetryEvent } from './telemetry-event';

export interface TelemetryClient {
    trackEvent(event: TelemetryEvent): void;
    flush(): Promise<void>;
}
