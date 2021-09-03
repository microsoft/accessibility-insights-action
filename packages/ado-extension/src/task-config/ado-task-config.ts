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
        return this.getAbsolutePath(this.adoTaskObj.getInput('outputDir'));
    }

    public getSiteDir(): string {
        return this.adoTaskObj.getInput('siteDir');
    }

    public getScanUrlRelativePath(): string {
        return this.adoTaskObj.getInput('scanUrlRelativePath');
    }

    public getToken(): string {
        return this.adoTaskObj.getInput('repoToken');
    }

    public getChromePath(): string {
        let chromePath;
        chromePath = this.getAbsolutePath(this.adoTaskObj.getInput('chromePath'));

        if (isEmpty(chromePath)) {
            chromePath = this.processObj.env.CHROME_BIN;
        }

        return chromePath;
    }

    public getUrl(): string {
        return this.adoTaskObj.getInput('url');
    }

    public getMaxUrls(): number {
        return parseInt(this.adoTaskObj.getInput('maxUrls'));
    }

    public getDiscoveryPatterns(): string {
        const value = this.adoTaskObj.getInput('discoveryPatterns');

        return isEmpty(value) ? undefined : value;
    }

    public getInputFile(): string {
        return this.getAbsolutePath(this.adoTaskObj.getInput('inputFile'));
    }

    public getInputUrls(): string {
        const value = this.adoTaskObj.getInput('inputUrls');

        return isEmpty(value) ? undefined : value;
    }

    public getScanTimeout(): number {
        return parseInt(this.adoTaskObj.getInput('scanTimeout'));
    }

    public getLocalhostPort(): number {
        const value = this.adoTaskObj.getInput('localhostPort');

        return isEmpty(value) ? undefined : parseInt(value, 10);
    }

    public getRunId(): number {
        return parseInt(this.processObj.env.BUILD_BUILDID, 10);
    }

    public getRepoServiceConnectionName(): string {
        return this.adoTaskObj.getInput('repoServiceConnectionName')
    }

    public getFailOnAccessibilityError(): boolean {
        return this.adoTaskObj.getBoolInput('failOnAccessibilityError');
    }

    private getAbsolutePath(path: string): string {
        if (isEmpty(path)) {
            return undefined;
        }

        const dirname = this.processObj.env.PIPELINE_WORKSPACE ?? __dirname;

        return normalizePath(this.resolvePath(dirname, normalizePath(path)));
    }
}
