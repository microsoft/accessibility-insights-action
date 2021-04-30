// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CrawlerParametersBuilder, CrawlerRunOptions, ScanArguments, validateScanArguments } from "accessibility-insights-scan";
import { TaskConfig } from "../task-config";
import * as path from 'path';
import { inject, injectable } from "inversify";

@injectable()
export class CrawlOptionValidator {
    constructor(
        @inject(TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(CrawlerParametersBuilder) private readonly crawlerParametersBuilder: CrawlerParametersBuilder,
    ) {}

    public validate(resolvedScanUrl: string): CrawlerRunOptions {
        const scanArguments: ScanArguments = {
            url: resolvedScanUrl,
            inputFile: this.taskConfig.getInputFile(),
            output: this.taskConfig.getReportOutDir(),
            maxUrls: this.taskConfig.getMaxUrls(),
            chromePath: this.taskConfig.getChromePath(),
            // axeSourcePath is relative to /dist/index.js, not this source file
            axeSourcePath: path.resolve(__dirname, 'node_modules', 'axe-core', 'axe.js'),
            crawl: true,
            restart: true,
            ...[this.taskConfig.getInputUrls(), this.taskConfig.getDiscoveryPatterns()].filter((l) => l.length > 0),
        };
    
        validateScanArguments(scanArguments);
    
        return this.crawlerParametersBuilder.build(scanArguments);
    }
}

