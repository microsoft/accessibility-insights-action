// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import { ConsoleLoggerClient } from './console-logger-client';
import { IMock, Mock, MockBehavior, Times } from 'typemoq';
import { LogLevel } from './logger-client';
import { BaseTelemetryProperties } from './base-telemetry-properties';
import * as util from 'util';
import { LoggerProperties } from './logger-properties';


// tslint:disable: no-null-keyword no-object-literal-type-assertion no-any no-void-expression no-empty


describe(ConsoleLoggerClient, ()=> {
    let testSubject: ConsoleLoggerClient;
    let consoleMock: IMock<typeof console>;

    beforeEach(() => {

        consoleMock = Mock.ofInstance({ log: () => {} } as typeof console);

        testSubject = new ConsoleLoggerClient(consoleMock.object);
    });

    describe('log', () => {
        it('log data without properties', async () => {
            await testSubject.setup(null);

            testSubject.log('trace1', LogLevel.verbose);

            consoleMock.verify(c => c.log('[Trace][verbose] === trace1'), Times.once());
        });

        it('log data with base properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };
            await testSubject.setup(baseProps);

            testSubject.log('trace1', LogLevel.warn);

            consoleMock.verify(c => c.log(`[Trace][warn][properties - ${util.inspect(baseProps)}] === trace1`), Times.once());
        });

        it('log data with custom runtime properties', async () => {
            const baseProps: BaseTelemetryProperties = { source: 'test-source' };
            const customProps: LoggerProperties = { scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            const mergedProps = { source: 'test-source', scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            await testSubject.setup(baseProps);
            testSubject.setCustomProperties(customProps);

            testSubject.log('trace1', LogLevel.warn);

            consoleMock.verify(c => c.log(`[Trace][warn][properties - ${util.inspect(mergedProps)}] === trace1`), Times.once());
        });

        it('log data with event properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };
            await testSubject.setup(baseProps);
            const traceProps = { eventProp1: 'prop value' };

            testSubject.log('trace1', LogLevel.warn, traceProps);

            consoleMock.verify(
                c => c.log(`[Trace][warn][properties - ${util.inspect({ ...baseProps, ...traceProps })}] === trace1`),
                Times.once(),
            );
        });
    });

} );