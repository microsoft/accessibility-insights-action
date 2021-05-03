// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ScanArguments, CrawlerRunOptions, CrawlerParametersBuilder, validateScanArguments } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { TaskConfig } from '../task-config';
import { isEmpty } from 'lodash';

@injectable()
export class CrawlArgumentHandler {
    constructor(
        @inject(CrawlerParametersBuilder) private readonly crawlerParametersBuilder: CrawlerParametersBuilder,
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
    ) {}

    public buildCrawlerOptions(scanArguments: ScanArguments): CrawlerRunOptions {
        validateScanArguments(scanArguments);
        return this.crawlerParametersBuilder.build(scanArguments);
    }

    public getInitialScanArguments(): ScanArguments {
        const args = {
            inputFile: this.taskConfig.getInputFile(),
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            discoveryPatterns: this.taskConfig.getDiscoveryPatterns(),
            inputUrls: this.taskConfig.getInputUrls(),
            url: this.taskConfig.getUrl(),
        };

        Object.keys(args)
            .map((key) => key as keyof typeof args)
            .forEach((key) => {
                if (isEmpty(args[key])) {
                    delete args[key];
                }
            });

        return args;
    }
}
