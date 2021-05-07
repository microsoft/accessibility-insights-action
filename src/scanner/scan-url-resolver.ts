// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { TaskConfig } from '../task-config';
import { resolve } from 'url';
import { ScanArguments } from 'accessibility-insights-scan';

@injectable()
export class ScanUrlResolver {
    constructor(@inject(TaskConfig) private readonly taskConfig: TaskConfig, private readonly resolveUrl: typeof resolve = resolve) {}

    public resolveLocallyHostedUrls(baseUrl: string): Partial<ScanArguments> {
        return {
            url: this.resolveUrl(baseUrl, this.taskConfig.getScanUrlRelativePath()),
        };
    }
}
