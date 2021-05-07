// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { reporterFactory } from 'accessibility-insights-report';
import express from 'express';
import getPort from 'get-port';
import * as inversify from 'inversify';
import serveStatic from 'serve-static';
import { ConsoleLoggerClient } from '../logger/console-logger-client';
import { Logger } from '../logger/logger';
import { Scanner } from '../scanner/scanner';
import { TaskConfig } from '../task-config';
import { iocTypes } from './ioc-types';
import { setupCliContainer } from 'accessibility-insights-scan';

export function setupIocContainer(): inversify.Container {
    const container = new inversify.Container({ autoBindInjectable: true });
    setupCliContainer(container);

    container.bind(Scanner).toSelf().inSingletonScope();
    container.bind(iocTypes.Console).toConstantValue(console);
    container.bind(iocTypes.Process).toConstantValue(process);
    container.bind(iocTypes.GetPort).toConstantValue(getPort);
    container.bind(iocTypes.Express).toConstantValue(express);
    container.bind(iocTypes.ServeStatic).toConstantValue(serveStatic);
    container.bind(iocTypes.ReportFactory).toConstantValue(reporterFactory);
    container.bind(iocTypes.Github).toConstantValue(github);

    container
        .bind(Octokit)
        .toDynamicValue((context) => {
            const taskConfig = context.container.get(TaskConfig);

            return new Octokit({ auth: taskConfig.getToken() });
        })
        .inSingletonScope();

    container
        .bind(Logger)
        .toDynamicValue((context) => {
            const consoleLoggerClient = context.container.get(ConsoleLoggerClient);

            return new Logger([consoleLoggerClient], context.container.get(iocTypes.Process));
        })
        .inSingletonScope();

    return container;
}
