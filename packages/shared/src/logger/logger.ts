// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { VError } from 'verror';
import * as utils from 'util';
import { LoggerClient, LogLevel } from './logger-client';
import { serializeError as serializeErrorExt } from 'serialize-error';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
export class Logger {
    protected initialized = false;
    protected isDebugEnabled = false;

    constructor(protected readonly loggerClients: LoggerClient[], protected readonly currentProcess: typeof process) {}

    public async setup(baseProperties?: { [property: string]: string }): Promise<void> {
        if (this.initialized === true) {
            return;
        }

        await Promise.all(
            this.loggerClients.map(async (client) => {
                await client.setup(baseProperties);
            }),
        );
        this.isDebugEnabled = /--debug|--inspect/i.test(this.currentProcess.execArgv.join(' '));
        this.initialized = true;
    }

    public log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void {
        this.ensureInitialized();

        this.invokeLoggerClient((client) => client.log(message, logLevel, properties));
    }

    public logInfo(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.info, properties);
    }

    public logVerbose(message: string, properties?: { [name: string]: string }): void {
        if (this.isDebugEnabled) {
            this.log(message, LogLevel.verbose, properties);
        }
    }

    public logWarn(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.warn, properties);
    }

    public logError(message: string, properties?: { [name: string]: string }): void {
        this.log(message, LogLevel.error, properties);
    }

    public trackException(error: Error): void {
        this.ensureInitialized();
        this.invokeLoggerClient((client) => client.trackException(error));
    }

    public trackExceptionAny(underlyingErrorData: any | Error, message: string): void {
        const parsedErrorObject =
            underlyingErrorData instanceof Error ? underlyingErrorData : new Error(this.serializeError(underlyingErrorData));
        this.trackException(new VError(parsedErrorObject, message));
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
}
