// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as express from 'express';
import * as serveStatic from 'serve-static';
import { injectable, inject } from 'inversify';
import { TaskConfig } from './task-config';
import * as getPort from 'get-port';
import { Logger } from './logger/logger';
import { Server } from 'http';
import { isNil } from 'lodash';
import { iocTypes } from './ioc/ioc-types';

@injectable()
export class LocalFileServer {
    private server: Server;
    private startServerPromise: Promise<string>;
    
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(Logger) private readonly logger: Logger,
        @inject(iocTypes.GetPort) private readonly getPortFunc: typeof getPort,
        @inject(iocTypes.Express) private readonly expressFunc : typeof express,
        @inject(iocTypes.ServeStatic) private readonly serveStaticFunc : typeof serveStatic,
    ) {}

    public async start(): Promise<string> {
        if (isNil(this.startServerPromise)) {
            this.startServerPromise = this.startServer();
        }

        return this.startServerPromise;
    }

    private async startServer(): Promise<string> {
        const port = await this.getPortFunc();
        this.logger.logInfo(`Using port ${port}`);

        const app = this.expressFunc();
        app.use(this.serveStaticFunc(this.taskConfig.getSiteDir()));

        this.server = app.listen(port);

        return `http://localhost:${port}`;
    }

    public stop(): void {
        if (!isNil(this.startServerPromise)) {
            this.startServerPromise = undefined;
            this.server.close();
        }
    }
}
