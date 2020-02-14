// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';
import { LocalFileServer } from '../local-file-server';
import * as url from 'url';
import { PromiseUtils } from '../utils/promise-utils';

@injectable()
export class Scanner {
    constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
    ) {}

    public async scan(): Promise<void> {
        await this.promiseUtils.waitFor(this.invokeScan(), 90000, async () => {
            this.logger.logError('Unable to scan before timeout');
            process.exit(1);
        });
    }

    private async invokeScan(): Promise<void> {
        let scanUrl: string;

        try {
            const baseUrl = await this.fileServer.start();
            scanUrl = url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath());

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`);
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanUrl}.`);
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`);
        }
    }
}
