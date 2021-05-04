// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ScanArguments, validateScanArguments } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import { resolve } from 'path';
import { TaskConfig } from '../task-config';
import { isEmpty } from 'lodash';
import { ScanUrlResolver } from './scan-url-resolver';

@injectable()
export class CrawlArgumentHandler {
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(ScanUrlResolver) private readonly scanUrlResolver: ScanUrlResolver,
        private readonly resolvePath: typeof resolve = resolve,
        private readonly validateScanArgumentsExt: typeof validateScanArguments = validateScanArguments,
    ) {}

    public async processScanArguments(startFileServer: () => Promise<string>): Promise<ScanArguments> {
        let scanArguments = this.getInitialScanArguments();

        if (isEmpty(scanArguments.url)) {
            const localServerUrl = await startFileServer();
            scanArguments = {
                ...scanArguments,
                ...this.scanUrlResolver.resolveLocallyHostedUrls(localServerUrl),
            };
        }

        this.validateScanArgumentsExt(scanArguments);

        return scanArguments;
    }

    private getInitialScanArguments(): ScanArguments {
        const args = {
            inputFile: this.taskConfig.getInputFile(),
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: this.resolvePath(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            discoveryPatterns: this.taskConfig.getDiscoveryPatterns()?.split(/\s+/),
            inputUrls: this.taskConfig.getInputUrls()?.split(/\s+/),
            url: this.taskConfig.getUrl(),
        };

        return args;
    }
}
