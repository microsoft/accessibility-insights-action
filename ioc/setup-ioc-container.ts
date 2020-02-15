// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Octokit } from '@octokit/rest';
import { reporterFactory } from 'accessibility-insights-report';
import * as express from 'express';
import * as getPort from 'get-port';
import * as inversify from 'inversify';
import * as serveStatic from 'serve-static';

import { ConsoleLoggerClient } from '../logger/console-logger-client';
import { Logger } from '../logger/logger';
import { Scanner } from '../scanner/scanner';
import { TaskConfig } from '../task-config';
import { iocTypes } from './ioc-types';


export function setupCliContainer(): inversify.Container {
    const container = new inversify.Container({ autoBindInjectable: true });
    container
        .bind(Scanner)
        .toSelf()
        .inSingletonScope();

    container.bind(iocTypes.Console).toConstantValue(console);
    container.bind(iocTypes.Process).toConstantValue(process);
    container.bind(iocTypes.GetPort).toConstantValue(getPort);
    container.bind(iocTypes.Express).toConstantValue(express);
    container.bind(iocTypes.ServeStatic).toConstantValue(serveStatic);
    container.bind(iocTypes.ReporterFactory).toConstantValue(reporterFactory);

    container
        .bind(Octokit)
        .toDynamicValue(context => {
            const taskConfig = context.container.get(TaskConfig);

            return new Octokit({ auth: taskConfig.getToken() });
        })
        .inSingletonScope();

    container
        .bind(Logger)
        .toDynamicValue(context => {
            const consoleLoggerClient = context.container.get(ConsoleLoggerClient);

            return new Logger([consoleLoggerClient], context.container.get(iocTypes.Process));
        })
        .inSingletonScope();

    return container;
}
