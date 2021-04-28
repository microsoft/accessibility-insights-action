// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AIScanner } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as url from 'url';
import * as util from 'util';

import { iocTypes } from '../ioc/ioc-types';
import { LocalFileServer } from '../local-file-server';
import { Logger } from '../logger/logger';
import { AllProgressReporter } from '../progress-reporter/all-progress-reporter';
import { ReportGenerator } from '../report/report-generator';
import { TaskConfig } from '../task-config';
import { PromiseUtils } from '../utils/promise-utils';

@injectable()
export class Scanner {
    constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject(AIScanner) private readonly scanner: AIScanner,
        @inject(ReportGenerator) private readonly reportGenerator: ReportGenerator,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(AllProgressReporter) private readonly allProgressReporter: AllProgressReporter,
        @inject(LocalFileServer) private readonly fileServer: LocalFileServer,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(iocTypes.Process) protected readonly currentProcess: typeof process,
    ) {}

    public async scan(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/require-await
        await this.promiseUtils.waitFor(this.invokeScan(), 90000, async () => {
            this.logger.logError('Unable to scan before timeout');
            this.currentProcess.exit(1);
        });
    }

    private async invokeScan(): Promise<void> {
        let scanUrl: string;

        try {
            await this.allProgressReporter.start();

            const remoteUrl: string = this.taskConfig.getUrl();
            if (remoteUrl) {
                scanUrl = remoteUrl;
            } else {
                const baseUrl = await this.fileServer.start();
                scanUrl = url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath());
            }

            this.logger.logInfo(`Starting accessibility scanning of URL ${scanUrl}.`);

            const chromePath = this.taskConfig.getChromePath();
            // Note: this is relative to /dist/index.js, not this source file
            const axeCoreSourcePath = path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.min.js');

            const axeScanResults = await this.scanner.scan(scanUrl, chromePath, axeCoreSourcePath);

            this.reportGenerator.generateReport(axeScanResults);

            await this.allProgressReporter.completeRun(axeScanResults);
        } catch (error) {
            this.logger.trackExceptionAny(error, `An error occurred while scanning website page ${scanUrl}.`);
            await this.allProgressReporter.failRun(util.inspect(error));
        } finally {
            this.fileServer.stop();
            this.logger.logInfo(`Accessibility scanning of URL ${scanUrl} completed.`);
        }
    }
}
