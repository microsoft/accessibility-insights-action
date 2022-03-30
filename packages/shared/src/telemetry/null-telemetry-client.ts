// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TelemetryClient } from './telemetry-client';
import { TelemetryEvent } from './telemetry-event';

export class NullTelemetryClient implements TelemetryClient {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public trackEvent(event: TelemetryEvent): void {
        // no-op
    }

    public flush(): void {
        // no-op
    }
}
