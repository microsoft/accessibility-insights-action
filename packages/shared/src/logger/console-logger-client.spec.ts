// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import * as util from 'util';
import { BaseTelemetryProperties } from './base-telemetry-properties';
import { ConsoleLoggerClient } from './console-logger-client';
import { LogLevel } from './log-level';
import { LoggerProperties } from './logger-properties';

describe(ConsoleLoggerClient, () => {
    let testSubject: ConsoleLoggerClient;
    let consoleMock: IMock<typeof console>;

    beforeEach(() => {
        consoleMock = Mock.ofInstance({
            log: () => {
                /* noop */
            },
        } as typeof console);

        testSubject = new ConsoleLoggerClient(consoleMock.object);
    });

    describe('log', () => {
        it('log data without properties', async () => {
            await testSubject.setup(null);

            testSubject.log('trace1', LogLevel.verbose);

            consoleMock.verify((c) => c.log('##[verbose]trace1'), Times.once());
        });

        it('log data with base properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };
            await testSubject.setup(baseProps);

            testSubject.log('trace1', LogLevel.warn);

            consoleMock.verify((c) => c.log(`##[warn][properties - ${util.inspect(baseProps)}]trace1`), Times.once());
        });

        it('log data with custom runtime properties', async () => {
            const baseProps: BaseTelemetryProperties = { source: 'test-source' };
            const customProps: LoggerProperties = { scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            const mergedProps = { source: 'test-source', scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            await testSubject.setup(baseProps);
            testSubject.setCustomProperties(customProps);

            testSubject.log('trace1', LogLevel.warn);

            consoleMock.verify((c) => c.log(`##[warn][properties - ${util.inspect(mergedProps)}]trace1`), Times.once());
        });

        it('log data with event properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };
            await testSubject.setup(baseProps);
            const traceProps = { eventProp1: 'prop value' };

            testSubject.log('trace1', LogLevel.warn, traceProps);

            consoleMock.verify((c) => c.log(`##[warn][properties - ${util.inspect({ ...baseProps, ...traceProps })}]trace1`), Times.once());
        });
    });

    describe('trackException', () => {
        it('log data without properties', async () => {
            await testSubject.setup(null);
            const error = new Error('error1');

            testSubject.trackException(error);

            consoleMock.verify((c) => c.log(`##[error][Exception]${util.inspect(error, { depth: null })}`), Times.once());
        });

        it('log data with base properties', async () => {
            const baseProps: BaseTelemetryProperties = { foo: 'bar', source: 'test-source' };
            await testSubject.setup(baseProps);
            const error = new Error('error1');

            testSubject.trackException(error);

            consoleMock.verify(
                (c) => c.log(`##[error][Exception][properties - ${util.inspect(baseProps)}]${util.inspect(error, { depth: null })}`),
                Times.once(),
            );
        });

        it('log data with custom runtime properties', async () => {
            const baseProps: BaseTelemetryProperties = { source: 'test-source' };
            const customProps: LoggerProperties = { scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            const mergedProps = { source: 'test-source', scanId: 'scan-id', batchRequestId: 'batch-req-id' };
            await testSubject.setup(baseProps);
            const error = new Error('error1');

            testSubject.setCustomProperties(customProps);
            testSubject.trackException(error);

            consoleMock.verify(
                (c) => c.log(`##[error][Exception][properties - ${util.inspect(mergedProps)}]${util.inspect(error, { depth: null })}`),
                Times.once(),
            );
        });
    });
});
