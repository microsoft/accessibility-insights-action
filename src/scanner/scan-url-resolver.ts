// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { TaskConfig } from '../task-config';
import * as url from 'url';
import { ScanArguments } from 'accessibility-insights-scan';

@injectable()
export class ScanUrlResolver {
    constructor(@inject(TaskConfig) private readonly taskConfig: TaskConfig) {}

    public resolveLocallyHostedUrls(baseUrl: string): Partial<ScanArguments> {
        return {
            url: url.resolve(baseUrl, this.taskConfig.getScanUrlRelativePath()),
        };
    }
}
