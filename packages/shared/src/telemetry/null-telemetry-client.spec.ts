// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { NullTelemetryClient } from './null-telemetry-client';

describe(NullTelemetryClient, () => {
    describe('trackEvent', () => {
        it('succeeds silently', () => {
            const testSubject = new NullTelemetryClient();

            expect(() => testSubject.trackEvent({ name: 'irrelevant '})).not.toThrow();
        })
    })

    describe('flush', () => {
        it('succeeds silently', () => {
            const testSubject = new NullTelemetryClient();

            expect(() => testSubject.flush()).not.toThrow();
        })
    })
})