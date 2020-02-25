// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AIScanner } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as path from 'path';
import * as url from 'url';
import { iocTypes } from '../ioc/ioc-types';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { TaskConfig } from '../task-config';
import { PromiseUtils } from '../utils/promise-utils';

@injectable()
export class Scanner {
    constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject(AIScanner) private readonly scanner: AIScanner,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(iocTypes.Process) protected readonly currentProcess: typeof process,
    ) {}

    public async scan(): Promise<void> {
        await this.promiseUtils.waitFor(this.invokeScan(), 90000, async () => {
            this.logger.logError('Unable to scan before timeout');
            this.currentProcess.exit(1);
        });
    }

    private async invokeScan(): Promise<void> {
        let scanUrl: string;

        try {
            const baseUrl = await this.fileServer.start();
            scanUrl = url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath());

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`);

            let chromePath;
            chromePath = this.taskConfig.getChromePath();
            this.logger.logInfo(`this.taskConfig.getChromePath() ${chromePath}.`);

            if (isEmpty(chromePath)) {
                chromePath = process.env.CHROME_BIN;
                this.logger.logInfo(`process.env.CHROME_BIN ${chromePath}.`);
            }

            let axeCoreSourcePath;
            axeCoreSourcePath = this.taskConfig.getAxeCoreSourcePath();
            this.logger.logInfo(`this.taskConfig.getAxeCoreSourcePath() ${axeCoreSourcePath}.`);

            if (isEmpty(axeCoreSourcePath)) {
                axeCoreSourcePath = path.resolve(__dirname, 'axe.js');
                this.logger.logInfo(`path.resolve(__dirname, 'axe.js') ${axeCoreSourcePath}.`);
            }

            this.logger.logInfo(`axeCoreSourcePath: ${axeCoreSourcePath}.`);

            await this.scanner.scan(scanUrl, chromePath, axeCoreSourcePath);
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanUrl}.`);
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`);
        }
    }
}
