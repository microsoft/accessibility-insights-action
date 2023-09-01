// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ErrorWithCause } from 'pony-cause';
import * as utils from 'util';
import { LoggerClient } from './logger-client';
import { LogLevel } from './log-level';
import { serializeError as serializeErrorExt } from 'serialize-error';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
export class Logger {
    protected initialized = false;
    public errors: string[] = [];

    constructor(
        protected readonly loggerClients: LoggerClient[],
        protected readonly currentProcess: typeof process,
    ) {}

    public async setup(baseProperties?: { [property: string]: string }): Promise<void> {
        if (this.initialized === true) {
            return;
        }

        await Promise.all(
            this.loggerClients.map(async (client) => {
                await client.setup(baseProperties);
            }),
        );
        this.initialized = true;
    }

    public log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void {
        this.ensureInitialized();

        this.invokeLoggerClient((client) => client.log(message, logLevel, properties));
    }

    public logInfo(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.info, properties);
    }

    public logDebug(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.debug, properties);
    }

    public logWarning(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.warning, properties);
    }

    public logError(message: string, properties?: { [name: string]: string }): void {
        this.errors.push(message);
        this.log(message, LogLevel.error, properties);
    }

    public logStartGroup(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.group, properties);
    }

    public logEndGroup(properties?: { [name: string]: string }): void {
        this.log('', LogLevel.endgroup, properties);
    }

    public trackException(error: Error): void {
        this.ensureInitialized();
        this.invokeLoggerClient((client) => client.trackException(error));
    }

    public trackExceptionAny(underlyingErrorData: any, message: string): void {
        const underlyingError =
            underlyingErrorData instanceof Error ? underlyingErrorData : new Error(this.serializeError(underlyingErrorData));
        this.trackException(new ErrorWithCause(message, { cause: underlyingError }));
    }

    public serializeError(error: any): string {
        return utils.inspect(serializeErrorExt(error), false, null);
    }

    private invokeLoggerClient(action: (loggerClient: LoggerClient) => void): void {
        this.loggerClients.forEach((client) => {
            action(client);
        });
    }

    private ensureInitialized(): void {
        if (this.initialized === true) {
            return;
        }

        throw new Error('The logger instance is not initialized. Ensure the setup() method is invoked by derived class implementation.');
    }

    public getAllErrors(): string {
        return this.errors.join('\n');
    }
}
