// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as express from 'express';
import * as getPort from 'get-port';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { isNil } from 'lodash';
import * as serveStatic from 'serve-static';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { TaskConfig } from './task-config';

@injectable()
export class LocalFileServer {
    private server: Server;
    private startServerPromise: Promise<string>;

    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(Logger) private readonly logger: Logger,
        @inject(iocTypes.GetPort) private readonly getPortFunc: typeof getPort,
        @inject(iocTypes.Express) private readonly expressFunc: typeof express,
        @inject(iocTypes.ServeStatic) private readonly serveStaticFunc: typeof serveStatic,
    ) {}

    public async start(): Promise<string> {
        if (isNil(this.startServerPromise)) {
            this.startServerPromise = this.startServer();
        }

        return this.startServerPromise;
    }

    public stop(): void {
        if (!isNil(this.startServerPromise)) {
            this.startServerPromise = undefined;
            this.server.close();
        }
    }

    private async startServer(): Promise<string> {
        const port = await this.getPortFunc();
        this.logger.logInfo(`Using port ${port}`);

        const app = this.expressFunc();
        app.use(this.serveStaticFunc(this.taskConfig.getSiteDir()));

        this.server = app.listen(port);

        return `http://localhost:${port}`;
    }
}
