// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { LogLevel } from './log-level';
import { LoggerProperties } from './logger-properties';

export interface LoggerClient {
    setup(baseProperties?: { [index: string]: string }): Promise<void>;
    log(message: string, logLevel: LogLevel, properties?: { [name: string]: string }): void;
    trackException(error: Error): void;
    setCustomProperties(properties: LoggerProperties): void;
}
