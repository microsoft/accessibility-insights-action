import { iocTypes } from './ioc/ioc-types';

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';

@injectable()
export abstract class TaskConfig {
    constructor(@inject(iocTypes.Process) protected readonly processObj: typeof process) {}
    abstract getReportOutDir(): string;
    abstract getSiteDir(): string;
    abstract getScanUrlRelativePath(): string;
    abstract getToken(): string;
    abstract getChromePath(): string;
    abstract getUrl(): string;
    abstract getMaxUrls(): number;
    abstract getDiscoveryPatterns(): string;
    abstract getInputFile(): string;
    abstract getInputUrls(): string;
    abstract getScanTimeout(): number;
    abstract getLocalhostPort(): number;
    public getRunId(): number {
        return parseInt(this.processObj.env.GITHUB_RUN_ID, 10);
    }
}
