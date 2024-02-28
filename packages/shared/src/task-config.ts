// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';

export type TaskInputKey = 'HostingMode' | 'StaticSiteDir' | 'StaticSiteUrlRelativePath' | 'Url' | 'StaticSitePort';
@injectable()
export abstract class TaskConfig {
    constructor(@inject(iocTypes.Process) protected readonly processObj: typeof process) {}
    abstract getReportOutDir(): string;
    abstract getStaticSiteDir(): string | undefined;
    abstract getStaticSiteUrlRelativePath(): string | undefined;
    abstract getSingleWorker(): boolean;
    abstract getBaselineFile(): string | undefined;
    abstract getChromePath(): string | undefined;
    abstract getUrl(): string | undefined;
    abstract getKeepUrlFragment(): boolean;
    abstract getMaxUrls(): number;
    abstract getDiscoveryPatterns(): string | undefined;
    abstract getInputFile(): string | undefined;
    abstract getInputUrls(): string | undefined;
    abstract getScanTimeout(): number;
    abstract getStaticSitePort(): number | undefined;
    abstract getRunId(): number | undefined;
    abstract getHostingMode(): string | undefined;
    abstract getInputName(key: TaskInputKey): string;
    abstract getUsageDocsUrl(): string;
    abstract getServiceAccountName(): string | undefined;
    abstract getServiceAccountPassword(): string | undefined;
    abstract getAuthType(): string | undefined;
    abstract getFailOnAccessibilityError(): boolean;
    abstract getSnapshot(): boolean | undefined;
}
