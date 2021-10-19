// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as adoTask from 'azure-pipelines-task-lib/task';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as process from 'process';
import { iocTypes, TaskConfig } from '@accessibility-insights-action/shared';
import normalizePath from 'normalize-path';
import { resolve } from 'path';

@injectable()
export class ADOTaskConfig extends TaskConfig {
    constructor(
        @inject(iocTypes.Process) protected readonly processObj: typeof process,
        private readonly adoTaskObj = adoTask,
        private readonly resolvePath: typeof resolve = resolve,
    ) {
        super(processObj);
    }

    public getReportOutDir(): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getAbsolutePath(this.adoTaskObj.getInput('outputDir'))!;
    }

    public getSiteDir(): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.adoTaskObj.getInput('siteDir')!;
    }

    public getScanUrlRelativePath(): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.adoTaskObj.getInput('scanUrlRelativePath')!;
    }

    public getToken(): string | undefined {
        return this.adoTaskObj.getInput('repoToken') || undefined;
    }

    public getChromePath(): string | undefined {
        let chromePath = this.adoTaskObj.getInput('chromePath') || undefined;
        chromePath = this.getAbsolutePath(chromePath);

        if (isEmpty(chromePath)) {
            chromePath = this.processObj.env.CHROME_BIN;
        }

        return chromePath;
    }

    public getUrl(): string | undefined {
        const value = this.adoTaskObj.getInput('url');

        return isEmpty(value) ? undefined : value;
    }

    public getMaxUrls(): number {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return parseInt(this.adoTaskObj.getInput('maxUrls')!);
    }

    public getDiscoveryPatterns(): string | undefined {
        const value = this.adoTaskObj.getInput('discoveryPatterns');

        return isEmpty(value) ? undefined : value;
    }

    public getInputFile(): string | undefined {
        return this.getAbsolutePath(this.adoTaskObj.getInput('inputFile') ?? undefined);
    }

    public getInputUrls(): string | undefined {
        const value = this.adoTaskObj.getInput('inputUrls');

        return isEmpty(value) ? undefined : value;
    }

    public getScanTimeout(): number {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return parseInt(this.adoTaskObj.getInput('scanTimeout')!);
    }

    public getLocalhostPort(): number | undefined {
        const value = this.adoTaskObj.getInput('localhostPort');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return isEmpty(value) ? undefined : parseInt(value!, 10);
    }

    public getRunId(): number | undefined {
        const value = this.processObj.env.BUILD_BUILDID;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return isEmpty(value) ? undefined : parseInt(value!, 10);
    }

    public getRepoServiceConnectionName(): string | undefined {
        return this.adoTaskObj.getInput('repoServiceConnectionName') ?? undefined;
    }

    public getFailOnAccessibilityError(): boolean {
        return this.adoTaskObj.getBoolInput('failOnAccessibilityError');
    }

    public getSingleWorker(): boolean {
        return this.adoTaskObj.getBoolInput('singleWorker');
    }

    public getBaselineFile(): string | undefined {
        const value = this.getAbsolutePath(this.adoTaskObj.getInput('baselineFile'));

        return isEmpty(value) ? undefined : value;
    }

    private getAbsolutePath(path: string | undefined): string | undefined {
        if (isEmpty(path)) {
            return undefined;
        }

        const dirname = this.processObj.env.SYSTEM_DEFAULTWORKINGDIRECTORY ?? __dirname;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return normalizePath(this.resolvePath(dirname, normalizePath(path!)));
    }
}
