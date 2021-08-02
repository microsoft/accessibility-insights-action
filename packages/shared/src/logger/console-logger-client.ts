// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as util from 'util';
import { iocTypes } from '../ioc/ioc-types';
import { BaseTelemetryProperties } from './base-telemetry-properties';
import { LoggerClient, LogLevel } from './logger-client';
import { LoggerProperties } from './logger-properties';

@injectable()
export class ConsoleLoggerClient implements LoggerClient {
    private baseProperties?: BaseTelemetryProperties;

    constructor(@inject(iocTypes.Console) private readonly consoleObject: typeof console) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    public async setup(baseProperties?: BaseTelemetryProperties): Promise<void> {
        this.baseProperties = baseProperties;
    }

    public log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void {
        this.logInConsole(`[Trace][${LogLevel[logLevel]}]${this.getPrintablePropertiesString(properties)}`, message);
    }

    public trackException(error: Error): void {
        this.logInConsole(`[Exception]${this.getPrintablePropertiesString()}`, this.getPrintableString(error));
    }

    public setCustomProperties(properties: LoggerProperties): void {
        this.baseProperties = { ...this.baseProperties, ...properties };
    }

    private getPrintablePropertiesString(properties?: { [name: string]: string }): string {
        const allProperties = {
            ...this.baseProperties,
            ...properties,
        };

        return isEmpty(allProperties) ? '' : `[properties - ${this.getPrintableString(allProperties)}]`;
    }

    private getPrintableString(obj: unknown): string {
        return util.inspect(obj, { depth: null });
    }

    private logInConsole(tag: string, content: string): void {
        this.consoleObject.log(`${tag} === ${content}`);
    }
}
