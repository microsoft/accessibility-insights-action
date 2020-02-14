// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BaseTelemetryProperties } from './base-telemetry-properties';
import { LoggerClient, LogLevel } from './logger-client';
import * as util from 'util';
import { LoggerProperties } from './logger-properties';
import { isEmpty } from 'lodash';
import { injectable, inject } from 'inversify';
import { iocTypes } from '../ioc/ioc-types';

@injectable()
export class ConsoleLoggerClient implements LoggerClient {
    private baseProperties?: BaseTelemetryProperties;

    constructor(@inject(iocTypes.Console) private readonly consoleObject: typeof console) {}

    public async setup(baseProperties?: BaseTelemetryProperties): Promise<void> {
        this.baseProperties = baseProperties;
    }

    public log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void {
        this.logInConsole(`[Trace][${LogLevel[logLevel]}]${this.getPrintablePropertiesString(properties)}`, message);
    }

    public trackException(error: Error): void {
        this.logInConsole(`[Exception]${this.getPrintablePropertiesString()}`, this.getPrintableString(error));
    }

    // tslint:disable-next-line: no-empty
    public flush(): void {}

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

    // tslint:disable-next-line: no-any
    private getPrintableString(obj: any): string {
        // tslint:disable-next-line: no-null-keyword
        return util.inspect(obj, { depth: null });
    }

    private logInConsole(tag: string, content: string): void {
        this.consoleObject.log(`${tag} === ${content}`);
    }
}
