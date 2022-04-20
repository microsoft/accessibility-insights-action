// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';

@injectable()
export abstract class TaskConfig {
    constructor(@inject(iocTypes.Process) protected readonly processObj: typeof process) {}
    abstract getReportOutDir(): string;
    abstract getStaticSiteDir(): string;
    abstract getStaticSiteUrlRelativePath(): string;
    abstract getSingleWorker(): boolean;
    abstract getBaselineFile(): string | undefined;
    abstract getToken(): string | undefined;
    abstract getChromePath(): string | undefined;
    abstract getUrl(): string | undefined;
    abstract getMaxUrls(): number;
    abstract getDiscoveryPatterns(): string | undefined;
    abstract getInputFile(): string | undefined;
    abstract getInputUrls(): string | undefined;
    abstract getScanTimeout(): number;
    abstract getStaticSitePort(): number | undefined;
    abstract getRunId(): number | undefined;
    abstract getHostingMode(): string | undefined;
    abstract getInputName(): string;
}
