// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { NullTelemetryClient } from './null-telemetry-client';
import { TelemetryEventName } from './telemetry-event';

describe(NullTelemetryClient, () => {
    describe('trackEvent', () => {
        it('succeeds silently', () => {
            const testSubject = new NullTelemetryClient();

            expect(() => testSubject.trackEvent({ name: 'irrelevant' as TelemetryEventName })).not.toThrow();
        });
    });

    describe('flush', () => {
        it('succeeds silently', () => {
            const testSubject = new NullTelemetryClient();

            expect(() => testSubject.flush()).not.toThrow();
        });
    });
});
