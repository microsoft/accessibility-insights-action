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

@injectable()
export class LocalFileServer {
    private server: Server;
    private startServerPromise: Promise<string>;

    private isRunning: boolean;
    constructor(@inject(TaskConfig) private readonly taskConfig: TaskConfig, @inject(Logger) private readonly logger: Logger) {}

    public async start(): Promise<string> {
        if (isNil(this.startServerPromise)) {
            this.startServerPromise = this.startServer();
        }

        return this.startServerPromise;
    }

    private async startServer(): Promise<string> {
        this.isRunning = true;

        const port = await getPort();
        this.logger.logInfo(`Using port ${port}`);

        const app = express();
        app.use(serveStatic(this.taskConfig.getSiteDir()));

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
