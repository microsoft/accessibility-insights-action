// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { LoggerClient } from './logger-client';
import { LogLevel } from './log-level';
import { Logger } from './logger';
import { LoggerProperties } from './logger-properties';
import * as process from 'process';

// We allow this type to be complex in order to produce readable snapshots
// when a test does expect(recordingLogger.recordedLogs()).toMatchSnapshot()
// Particularly, "Simple" logs (messages with no properties) will show up in
// snapshots as simple strings.
export type LogRecord =
    | string
    | {
          message: string;
          properties?: { [name: string]: string };
      }
    | {
          exception: Error;
      };

export class RecordingTestLogger extends Logger {
    private client: RecordingLoggerClient;
    constructor(currentProcess: typeof process = process) {
        const client = new RecordingLoggerClient();
        super([client], currentProcess);
        this.client = client;
        this.initialized = true;
    }

    public recordedLogs(): LogRecord[] {
        return [...this.client.logRecords];
    }
}

class RecordingLoggerClient implements LoggerClient {
    public logRecords: LogRecord[] = [];

    log(
        message: string,
        logLevel: LogLevel,
        properties?: {
            [name: string]: string;
        },
    ): void {
        const messageWithLevel = `[${LogLevel[logLevel]}] ${message}`;
        if (properties) {
            this.logRecords.push({
                message: messageWithLevel,
                properties,
            });
        } else {
            this.logRecords.push(messageWithLevel);
        }
    }
    trackException(error: Error): void {
        this.logRecords.push({
            exception: error,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    async setup(baseProperties?: { [index: string]: string }): Promise<void> {
        throw new Error('Not supported');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCustomProperties(properties: LoggerProperties): void {
        throw new Error('Not supported');
    }
}
