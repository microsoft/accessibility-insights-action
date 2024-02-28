// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ScanArguments, validateScanArguments } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import { resolve } from 'path';
import { TaskConfig } from '../task-config';
import { isEmpty } from 'lodash';
import { ScanUrlResolver } from './scan-url-resolver';
import { iocTypes } from '../ioc/ioc-types';

@injectable()
export class CrawlArgumentHandler {
    constructor(
        @inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(ScanUrlResolver) private readonly scanUrlResolver: ScanUrlResolver,
        private readonly resolvePath: typeof resolve = resolve,
        private readonly validateScanArgumentsExt: typeof validateScanArguments = validateScanArguments,
    ) {}

    public processScanArguments(localServerUrl?: string): ScanArguments {
        let scanArguments = this.getInitialScanArguments();

        if (isEmpty(scanArguments.url)) {
            scanArguments = {
                ...scanArguments,
                ...this.scanUrlResolver.resolveLocallyHostedUrls(localServerUrl),
            };
        }

        this.validateScanArgumentsExt(scanArguments);

        return scanArguments;
    }

    private getInitialScanArguments(): ScanArguments {
        const inputFile = this.taskConfig.getInputFile() || undefined;
        const inputUrlsArg = this.taskConfig.getInputUrls() || undefined;
        const discoveryPatternsArg = this.taskConfig.getDiscoveryPatterns() || undefined;

        const args = {
            inputFile,
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: this.resolvePath(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            discoveryPatterns: discoveryPatternsArg?.split(/\s+/),
            inputUrls: inputUrlsArg?.split(/\s+/),
            url: this.taskConfig.getUrl(),
            keepUrlFragment: this.taskConfig.getKeepUrlFragment(),
            singleWorker: this.taskConfig.getSingleWorker(),
            baselineFile: this.taskConfig.getBaselineFile() || null,
            serviceAccountName: this.taskConfig.getServiceAccountName() || undefined,
            serviceAccountPassword: this.taskConfig.getServiceAccountPassword() || undefined,
            authType: this.taskConfig.getAuthType() || undefined,
            snapshot: this.taskConfig.getSnapshot() || undefined,
        };

        return args;
    }
}
