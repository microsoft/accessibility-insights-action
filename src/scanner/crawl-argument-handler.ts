// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ScanArguments, validateScanArguments } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { TaskConfig } from '../task-config';
import { isEmpty } from 'lodash';
import { ScanUrlResolver } from './scan-url-resolver';
import { Logger } from '../logger/logger';

@injectable()
export class CrawlArgumentHandler {
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(ScanUrlResolver) private readonly scanUrlResolver: ScanUrlResolver,
        @inject(Logger) private readonly logger: Logger,
    ) {}

    public async processScanArguments(startFileServer: () => Promise<string>): Promise<ScanArguments> {
        let scanArguments = this.getInitialScanArguments();

        const remoteUrl: string = this.taskConfig.getUrl();
        if (isEmpty(remoteUrl)) {
            const localServerUrl = await startFileServer();
            scanArguments = {
                ...scanArguments,
                ...this.scanUrlResolver.resolveLocallyHostedUrls(localServerUrl),
            };
        }

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const restartContinue = `${scanArguments.restart} ${scanArguments.continue}`;
        this.logger.logInfo(`scan arguments crawl true ${restartContinue}`);
        validateScanArguments(scanArguments);

        return scanArguments;
    }

    private getInitialScanArguments(): ScanArguments {
        const args = {
            inputFile: this.taskConfig.getInputFile(),
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            continue: true,
            discoveryPatterns: this.taskConfig.getDiscoveryPatterns(),
            inputUrls: this.taskConfig.getInputUrls(),
            url: this.taskConfig.getUrl(),
        };

        if (isEmpty(args.discoveryPatterns)) {
            delete args.discoveryPatterns;
        }

        if (isEmpty(args.inputUrls)) {
            delete args.inputUrls;
        }

        return args;
    }
}
