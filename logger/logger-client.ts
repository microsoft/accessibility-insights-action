// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { LoggerProperties } from './logger-properties';

export enum LogLevel {
    info,
    warn,
    verbose,
    error,
}

export interface LoggerClient {
    setup(baseProperties?: { [index: string]: string }): Promise<void>;
    log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void;
    trackException(error: Error): void;
    flush(): void;
    setCustomProperties(properties: LoggerProperties): void;
}
